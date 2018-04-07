#!/usr/bin/python
import os
import sys


#os.system("./fasttext predict test_model.bin -")
file = open("predictText.txt", "a+")
file.seek(0)
file.truncate()
file.write(str(sys.argv[1]) + "\n")
file.close()

os.system("./fasttext predict test_model.bin predictText.txt 1")
