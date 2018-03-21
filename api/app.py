from flask import Flask
from flask import request
from flask_restful import Resource, Api
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.model_selection import GridSearchCV
# from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import SGDClassifier
from collections import Counter

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

@app.route('/add', methods=['POST'])
def add():
    try:
        text = request.form['text']
        category = request.form['category']
    except KeyError:
        return "Error: must specify the 'text' and 'category' keys when making a POST to /add"
    if text in data:
        return "Error: data store already contains text"
    data.append(text)
    if category not in cats:
        cats.append(category)
    target.append(cats.index(category))
    # if len(cats) >= 2:
        # requires enough categories to make a meaningful prediction
        # text_clf.fit(data, target)
    if len(cats) >= 2 and all(i >= 3 for i in Counter(target).values()):
        # requires enough data to split into training, test, and validation sets
        gs_clf.fit(data, target)
    return "added " + text + " to category " + category + " which is index " + str(cats.index(category))

@app.route('/predict', methods=['GET'])
def predict():
    try:
        text = request.args['text']
    except KeyError:
        return "Error: must specify the 'text' arg when making a GET to /predict"
    # if len(cats) < 2:
    if len(cats) < 2 or any(i < 3 for i in Counter(target).values()):
        return "Error: not enough data to predict"
    # return cats[text_clf.predict([text])[0]]
    return cats[gs_clf.predict([text])[0]]

@app.route('/reset', methods=['GET'])
def reset():
    cats = []
    data = []
    target = []
