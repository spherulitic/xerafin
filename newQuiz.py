#!/usr/bin/python

import xerafinLib as xl
import json, sys

#userid = "10157462952395078"
params = json.load(sys.stdin)
userid = params["user"]
error = {"status": "success"}

try:
  xl.newQuiz(userid)
except:
  error["status"] = "Cardbox DB Failure"

print "Content-type: application/json\n\n"
print json.dumps(error)


