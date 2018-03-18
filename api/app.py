from flask import Flask
from flask import request
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.naive_bayes import MultinomialNB
# from sklearn.linear_model import SGDClassifier
app = Flask(__name__)

# in-memory data store. begins empty
cats = []
data = []
target = []

# multinomial naive bayes classifier based on word counts
text_clf = Pipeline([
    ('vect', CountVectorizer()), 
    ('tfidf', TfidfTransformer()),
    ('clf', MultinomialNB())])

# alternative support vector machine classifier
# text_clf = Pipeline([
#     ('vect', CountVectorizer()),
#     ('tfidf', TfidfTransformer()),
#     ('clf', SGDClassifier(
#         loss='hinge', penalty='l2',
#         alpha=1e-3, random_state=42,
#         max_iter=5, tol=None))])

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
    if len(cats) > 1:
        text_clf.fit(data, target)
    return "added " + text + " to category " + category + " which is index " + str(cats.index(category))

@app.route('/predict', methods=['GET'])
def predict():
    try:
        text = request.args['text']
        return cats[text_clf.predict([text])[0]]
    except KeyError:
        return "Error: must specify the 'text' arg when making a GET to /predict"
