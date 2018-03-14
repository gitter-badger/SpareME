# see http://ai.intelligentonlinetools.com/ml/fasttext-word-embeddings-text-classification-python-mlp/

vectors_fname = 'wiki-news-300d-1M.vec'
vectors_zip_fname = 'wiki-news-300d-1M.vec.zip'

import os.path
if not os.path.isfile(vectors_fname):

    if not os.path.isfile(vectors_zip_fname):
        # from https://fasttext.cc/docs/en/english-vectors.html
        url = 'https://s3-us-west-1.amazonaws.com/fasttext-vectors/' + vectors_zip_fname
        import requests
        response = requests.get(url, stream=True)

        from tqdm import tqdm
        with open(vectors_zip_fname, "wb") as handle:
            for data in tqdm(response.iter_content()):
                handle.write(data)

    if os.path.isfile(vectors_zip_fname):
        import zipfile
        zip_ref = zipfile.ZipFile('wiki-news-300d-1M.vec.zip', 'r')
        zip_ref.extractall()
        zip_ref.close()
        os.remove(vectors_zip_fname)

if not os.path.isfile(vectors_fname):
    print('couldn\'t find vector file')
    quit()

from gensim.models import KeyedVectors
import pandas as pd

model = KeyedVectors.load_word2vec_format('wiki-news-300d-1M.vec')
print (model.most_similar('desk'))
 
words = []
for word in model.vocab:
    words.append(word)
 
print("Vector components of a word: {}".format(
    model[words[0]]
))
sentences = [['this', 'is', 'the', 'good', 'machine', 'learning', 'book'],
            ['this', 'is',  'another', 'machine', 'learning', 'book'],
            ['one', 'more', 'new', 'book'],
        ['this', 'is', 'about', 'machine', 'learning', 'post'],
          ['orange', 'juice', 'is', 'the', 'liquid', 'extract', 'of', 'fruit'],
          ['orange', 'juice', 'comes', 'in', 'several', 'different', 'varieties'],
          ['this', 'is', 'the', 'last', 'machine', 'learning', 'book'],
          ['orange', 'juice', 'comes', 'in', 'several', 'different', 'packages'],
          ['orange', 'juice', 'is', 'liquid', 'extract', 'from', 'fruit', 'on', 'orange', 'tree']]
          
import numpy as np
 
def sent_vectorizer(sent, model):
    sent_vec =[]
    numw = 0
    for w in sent:
        try:
            if numw == 0:
                sent_vec = model[w]
            else:
                sent_vec = np.add(sent_vec, model[w])
            numw+=1
        except:
            pass
    
    return np.asarray(sent_vec) / numw
 
V=[]
for sentence in sentences:
    V.append(sent_vectorizer(sentence, model))   
          
     
X_train = V[0:6]
X_test = V[6:9] 
Y_train = [0, 0, 0, 0, 1,1]
Y_test =  [0,1,1]    
     
     
from sklearn.neural_network import MLPClassifier
classifier = MLPClassifier(alpha = 0.7, max_iter=400) 
classifier.fit(X_train, Y_train)
 
df_results = pd.DataFrame(data=np.zeros(shape=(1,3)), columns = ['classifier', 'train_score', 'test_score'] )
train_score = classifier.score(X_train, Y_train)
test_score = classifier.score(X_test, Y_test)
 
print  (classifier.predict_proba(X_test))
print  (classifier.predict(X_test))
 
df_results.loc[1,'classifier'] = "MLP"
df_results.loc[1,'train_score'] = train_score
df_results.loc[1,'test_score'] = test_score
print(df_results)
