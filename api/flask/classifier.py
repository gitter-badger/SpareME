from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.model_selection import GridSearchCV
# from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import SGDClassifier
from collections import Counter
from sklearn.exceptions import NotFittedError

import dal

# support vector machine classifier
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
# hack because we can't otherwise tell whether or not gs_clf has been fit yet.
initialized = False

def fit(uid):
    """
    Fits a new classifier from the given user's labeled text in the database.

    TODO: persist the given user's new classifier rather than persisting it as
    the global classifier.
    """
    labeled_text = dal.get_labeled_text(uid)
    # Requires enough data for each target to be split into training, test, and
    # validation sets.
    if len(labeled_text['targets']) >= 2 and all(i >= 3 for i in Counter(labeled_text['targets']).values()):
        gs_clf.fit(labeled_text['data'], labeled_text['targets'])
        global initialized
        initialized = True

def predict(uid, unlabeled_text):
    """
    Predicts the text label of every value in the given list of unlabeled text.

    TODO: get the given user's actual classifier from persistence and use that
    rather than using the global classifier.
    """
    global initialized
    if not initialized:
        return ['harmless' for _ in unlabeled_text]
    predicted_ids = gs_clf.predict(unlabeled_text)
    return [dal.get_label_text(uid, int(id)) for id in predicted_ids]
