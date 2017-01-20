#!/usr/bin/python

import xerafinLib as xl
import json, sys
import updateActive as ua
import MySQLdb as mysql
import xerafinSetup as xs

params = json.load(sys.stdin)
userid = params["user"]
alpha = params["question"]
ua.updateActive(userid)

error = {"status": "success"}

try:
  xl.skipWord(alpha, userid)

except:
  error["status"] = "Cardbox DB Failure"

print "Content-type: application/json\n\n"
print json.dumps(error)


