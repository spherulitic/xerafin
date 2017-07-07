#!/usr/bin/python

import xerafinLib as xl
import json, sys
import sqlite3 as lite

#userid = "10157462952395078"
#alpha = 'ABENORTT'
error = {"status": "success"}
params = json.load(sys.stdin)
userid = params["user"]
alpha = params["alpha"]
# 0 means quiz on all words
# 1 means quiz on words of length len(alpha)-3 and greater only
#   unless there's not very many total
try:
  pruneWords = params["getAllWords"] == "1"
except Exception as ex:
  error["status"] = "%s, %s" % (type(ex).__name__, ex.args)
  pruneWords = False

REASONABLE_QUIZ_SIZE = 40

result = [ ]

try:
  with lite.connect(xl.getDBFile(userid)) as con:
    cur = con.cursor()
    xl.futureSweep(cur)
  
  totalWords = 0
  for subalpha in xl.getSubanagrams(alpha):
    words = xl.getAnagrams(subalpha)
    totalWords += len(words)
    auxInfo = xl.getAuxInfo(subalpha, userid)
    result.append({ "alpha": subalpha, "words": words, "auxInfo": auxInfo })

  if pruneWords and totalWords > REASONABLE_QUIZ_SIZE:
    result = [ x for x in result if len(x["alpha"]) > len(alpha)-4 ]

except Exception as ex:
  error["status"] = "%s, %s" % (type(ex).__name__, ex.args)

print "Content-type: application/json\n\n"
try:
  print json.dumps([result, error], ensure_ascii=False)
except Exception as ex:
  error["status"] = "%s, %s" % (type(ex).__name__, ex.args)
  print json.dumps(error)

