#!/usr/bin/python


import xerafinLib as xl
import json, sys

#userid = "10157462952395078"
params = json.load(sys.stdin)
userid = params["user"]
result = { }
error = {"status": "success"}

try:
  result["score"] = xl.getCardboxScore(userid)
except:
  error["status"] = "Cardbox DB Failure"

print "Content-type: application/json\n\n"
print json.dumps([result, error])


