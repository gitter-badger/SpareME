#!/usr/bin/python
import os
import sys


#os.system("./fasttext predict test_model.bin -")
category = str(sys.argv[1])
text = str(sys.argv[2])
file = open("classifierDocument.txt", "a+")
file.write("__label__" + category + " " + text + "\n")
file.close()
os.system("./fasttext supervised -input classifierDocument.txt -output test_model")
