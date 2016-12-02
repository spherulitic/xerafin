#!/usr/bin/python

import xerafinLib as xl
import sys, json
import sqlite3 as lite

# Arguments should be: prepareNewWords.py userid numNeeded
#userid = "10157462952395078"
#numNeeded = 4
params = json.load(sys.stdin)
userid = params["userid"]
numNeeded = xl.getPrefs("newWordsAtOnce", userid)
error = {"status": "success"}
#result = [ ]
try:
  with lite.connect(xl.getDBFile(userid)) as con:
    cur = con.cursor()
    wordsToAdd = xl.getFromStudyOrder(numNeeded, userid, cur)
    error["wordsToAdd"] = wordsToAdd
    xl.insertIntoNextAdded(wordsToAdd, cur)
#    cur.execute("select question from next_added")
#    for row in cur.fetchall():
#      result.append(row[0])
  error["studyOrder"] = xl.getPrefs("studyOrderIndex", userid)
except Exception as ex:
  template = "An exception of type {0} occured. Arguments:\n{1!r}"
  message = template.format(type(ex).__name__, ex.args)
  error["status"] =  message 

print "Content-type: application/json\n\n"
print json.dumps(error)




