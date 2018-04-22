from threading import Thread
from multiprocessing import Process
import sgdclassifier
import dal

def fit(uid):
    """
    Asynchronously spawns a thread which spawns a subprocess which
    fits a new classifier from the given user's labeled text in the
    database. We can't just do this in a thread because the fit
    operation uses multiprocessing and so must be done on the main
    thread. And we can't just spawn a process because we have to
    immediately join() it in order to avoid creating zombies. So we
    spawn a thread whose only responsibility is spawning and joining
    the process.
    """
    t = Thread(target=fit_thread, args=(uid,))
    t.start()

def fit_thread(uid):
    """
    Asynchronously spawns a subprocess which fits a new classifier.
    """
    p = Process(target=fit_process, args=(uid,))
    p.start()
    p.join()

def fit_process(uid):
    sgdclassifier.fit(uid)

def predict(uid, unlabeled_text):
    """
    Predicts the text label of every value in the given list of unlabeled text.
    """
    classifier = dal.get_classifier(uid)
    if not classifier:
        return ['harmless' for _ in unlabeled_text]
    predicted_ids = classifier.predict(unlabeled_text)
    return [dal.get_label_text(uid, int(id)) for id in predicted_ids]
