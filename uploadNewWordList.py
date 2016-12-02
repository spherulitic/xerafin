#!/usr/bin/python
import cgi, json
import xerafinLib as xl
import sqlite3 as lite

params = cgi.FieldStorage()
userid = params.keys()[0]
inFile = params[userid].file

result = {"status": "success"}
alphaList = [ ]

try:
  for line in inFile:
    alpha = ''.join(sorted(line.rstrip().upper()))
    alphaList.append(alpha)
  with lite.connect(xl.getDBFile(userid)) as con:
    cur = con.cursor()
    xl.insertIntoNextAdded(alphaList, cur)
  result["status"] = alphaList
  result["userid"] = userid
except:
  template = "An exception of type {0} occured. Arguments:\n{1!r}"
  message = template.format(type(ex).__name__, ex.args)
  result["status"] =  message

print "Content-type: application/json\n\n"
print json.dumps(result)

		

