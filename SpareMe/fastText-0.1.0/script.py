import os
os.system("./fasttext supervised -input testclassifierdocument.txt -output test_model")
os.system("./fasttext predict test_model.bin -")
