#!/usr/bin/python

import xerafinLib as xl
import json, sys
import sqlite3 as lite

#userid = "10157462952395078"
#alpha = 'ABENORTT'
params = json.load(sys.stdin)
userid = params["user"]
alpha = params["alpha"]
result = [ ]
error = {"status": "success"}

try:
  with lite.connect(xl.getDBFile(userid)) as con:
    cur = con.cursor()
    xl.futureSweep(cur)
  for subalpha in xl.getSubanagrams(alpha):
    words = xl.getAnagrams(subalpha)
    auxInfo = xl.getAuxInfo(subalpha, userid)
    result.append({ "alpha": subalpha, "words": words, "auxInfo": auxInfo })

except Exception as ex:
  error["status"] = "%s, %s" % (type(ex).__name__, ex.args)

print "Content-type: application/json\n\n"
try:
  print json.dumps([result, error], ensure_ascii=False)
except Exception as ex:
  error["status"] = "%s, %s" % (type(ex).__name__, ex.args)
  print json.dumps(error)

