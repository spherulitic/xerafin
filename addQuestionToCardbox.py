#!/usr/bin/python

import xerafinLib as xl
import json, sys
import sqlite3 as lite

params = json.load(sys.stdin)
userid = params["user"]
question = params["question"]
#userid = "10157462952395078"  # me
error = {"status": "success"}
result = {"question": question } 

try:

  with lite.connect(xl.getDBFile(userid)) as con:
    cur = con.cursor()
    if xl.isAlphagramValid(question):
      xl.addWord(question, cur)
    else:
      error["status"] = "Invalid Alphagram"

except Exception as ex:
  template = "An exception of type {0} occured. Arguments:\n{1!r}"
  message = template.format(type(ex).__name__, ex.args)
  error["status"] =  message

print "Content-type: application/json\n\n"
print json.dumps([result, error])


