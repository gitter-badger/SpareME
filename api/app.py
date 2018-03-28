from flask import Flask
from flask import request
from flask_restful import Resource, Api
import json
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.model_selection import GridSearchCV
# from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import SGDClassifier
from collections import Counter
import firebase_admin
from firebase_admin import auth, credentials

# initialize the firebase server/admin SDK
cred = credentials.Certificate('firebase-private-key.json')
default_app = firebase_admin.initialize_app(cred)

# for debugging access control
# auth.set_custom_user_claims('Xua9VRs4C7eqnLAJL945orgT4Au2', {'admin': True})
# auth.set_custom_user_claims('Xua9VRs4C7eqnLAJL945orgT4Au2', None)

app = Flask(__name__)
api = Api(app)

# in-memory data store. begins empty
cats = []
data = []
target = []

# multinomial naive bayes classifier based on word counts
# text_clf = Pipeline([
#     ('vect', CountVectorizer()), 
#     ('tfidf', TfidfTransformer()),
#     ('clf', MultinomialNB())])

# alternative support vector machine classifier
text_clf = Pipeline([
    ('vect', CountVectorizer()),
    ('tfidf', TfidfTransformer()),
    ('clf', SGDClassifier(
        loss='hinge', penalty='l2',
        alpha=1e-3, random_state=42,
        max_iter=5, tol=None))])

# exhaustively search for best classifier parameters
parameters = {
    'vect__ngram_range': [(1, 1), (1, 2)],
    'tfidf__use_idf': (True, False),
    'clf__alpha': (1e-2, 1e-3)}
gs_clf = GridSearchCV(text_clf, parameters, n_jobs=-1)


@app.route('/populate', methods=['GET'])
def populate():
    if len(cats) < 2 or any(i < 3 for i in Counter(target).values()):
        addStringsToCategory(['the', 'american', 'congress'], 'hateful')
        addStringsToCategory(['trees', 'santa', 'snow'], 'christmas')
        addStringsToCategory(['virginia', 'tech', 'hokies'], 'awesome')

    return "The models have been populated with sample data."


def addStringsToCategory(strArray, category):
    for text in strArray:
        if text in data:
            continue

        # add given text to in-memory data store
        data.append(text)
        if category not in cats:
            cats.append(category)
        target.append(cats.index(category))

        if len(cats) >= 2 and all(i >= 3 for i in Counter(target).values()):
            gs_clf.fit(data, target)

@app.route('/add', methods=['POST'])
def add():
    # extract arguments from post request
    try:
        text = request.form['text']
        category = request.form['category']
        id_token = request.form['id_token']
    except KeyError:
        return "Error: must specify the 'text', 'category', and 'id_token' keys when making a POST to /add"

    try:
        # Verify the ID token while checking if the token is revoked by
        # passing check_revoked=True
        decoded_token = auth.verify_id_token(id_token, check_revoked=True)
        # Token is valid and not revoked
        uid = decoded_token['uid']
    except ValueError:
        return "Error: token malformed"
    except auth.AuthError as exc:
        if exc.code == 'ID_TOKEN_REVOKED':
            return "Error: token revoked; user must reauthenticate or sign out"
        else:
            return "Error: token invalid"

    # get the actual user from the uid
    user = auth.get_user(uid)

    # control access using custom claim
    print(user.custom_claims)
    if user.custom_claims is None or user.custom_claims.get('admin') is not True:
        # Prevent access to admin resource.
        return "Error: user is not allowed to access this resource"

    # verify prediction pre-requisites
    if text in data:
        return "Error: data store already contains text"

    # add given text to in-memory data store
    data.append(text)
    if category not in cats:
        cats.append(category)
    target.append(cats.index(category))

    # build classifier if pre-requisites satisfied
    # if len(cats) >= 2:
        # requires enough categories to make a meaningful prediction
        # text_clf.fit(data, target)
    if len(cats) >= 2 and all(i >= 3 for i in Counter(target).values()):
        # requires enough data to split into training, test, and validation sets
        gs_clf.fit(data, target)

    # return value is arbitrary
    return "added " + text + " to category " + category + " which is index " + str(cats.index(category))


@app.route('/predict', methods=['GET'])
def predict():
    if len(cats) < 2 or any(i < 3 for i in Counter(target).values()):
        populate(['the', 'american', 'congress'], 'hateful')
        populate(['trees', 'santa', 'snow'], 'christmas')
        populate(['virginia', 'tech', 'hokies'], 'awesome')
    # extract arguments from get request
    try:
        text = request.args['text']
        id_token = request.args['id_token']
    except KeyError:
        return "Error: must specify the 'text' and 'id_token' args when making a GET to /predict"

    try:
        # Verify the ID token while checking if the token is revoked by
        # passing check_revoked=True
        decoded_token = auth.verify_id_token(id_token, check_revoked=True)
        # Token is valid and not revoked
        uid = decoded_token['uid']
    except ValueError:
        return "Error: token malformed"
    except auth.AuthError as exc:
        if exc.code == 'ID_TOKEN_REVOKED':
            return "Error: token revoked; user must re-authenticate or sign out"
        else:
            return "Error: token invalid"

    # get the actual user from the uid
    user = auth.get_user(uid)
    #
    # # control access using custom claim
    if user.custom_claims is None or user.custom_claims.get('admin') is not True:
        # Prevent access to admin resource.
        return "Error: user is not allowed to access this resource"

    # verify prediction pre-requisites
    # if len(cats) < 2:
    if len(cats) < 2 or any(i < 3 for i in Counter(target).values()):
        return "Error: not enough data to predict"

    # predict category of given text
    # return cats[text_clf.predict([text])[0]]
    return cats[gs_clf.predict([text])[0]]


@app.route('/predictBatch', methods=['GET'])
def predictBatch():
    # extract arguments from get request
    try:
        text = request.args['text']
        # id_token = request.args['id_token']
    except KeyError:
        return "Error: must specify the 'text' arg when making a GET to /predict"

    try:
        # Verify the ID token while checking if the token is revoked by
        # passing check_revoked=True
        decoded_token = auth.verify_id_token(id_token, check_revoked=True)
        # Token is valid and not revoked
        uid = decoded_token['uid']
    except ValueError:
        return "Error: token malformed"
    except auth.AuthError as exc:
        if exc.code == 'ID_TOKEN_REVOKED':
            return "Error: token revoked; user must reauthenticate or sign out"
        else:
            return "Error: token invalid"

    # get the actual user from the uid
    user = auth.get_user(uid)

    # control access using custom claim
    if user.custom_claims is None or user.custom_claims.get('admin') is not True:
        # Prevent access to admin resource.
        return "Error: user is not allowed to access this resource"

    # verify prediction pre-requisites
    # if len(cats) < 2:
    if len(cats) < 2 or any(i < 3 for i in Counter(target).values()):
        return "Error: not enough data to predict"

    predictions = {}

    # predict categories of given text
    for string in request.args.values():
        print(string)
        predictions[string] = (cats[gs_clf.predict([string])[0]])

    return json.dumps(predictions)


@app.route('/reset', methods=['GET'])
def reset():
    # extract arguments from get request
    try:
        id_token = request.args['id_token']
    except KeyError:
        return "Error: must specify the 'id_token' arg when making a GET to /reset"

    try:
        # Verify the ID token while checking if the token is revoked by
        # passing check_revoked=True
        decoded_token = auth.verify_id_token(id_token, check_revoked=True)
        # Token is valid and not revoked
        uid = decoded_token['uid']
    except ValueError:
        return "Error: token malformed"
    except auth.AuthError as exc:
        if exc.code == 'ID_TOKEN_REVOKED':
            return "Error: token revoked; user must reauthenticate or sign out"
        else:
            return "Error: token invalid"

    # get the actual user from the uid
    user = auth.get_user(uid)

    # control access using custom claim
    print(user.custom_claims)
    if user.custom_claims is None or user.custom_claims.get('admin') is not True:
        # Prevent access to admin resource.
        return "Error: user is not allowed to access this resource"

    # clear in-memory data store
    cats = []
    data = []
    target = []
