#!/usr/bin/python


import xerafinLib as xl
import json, sys

userid = "10157462952395078"
print "Content-type: application/json\n\n"
#print "Content-type: application/json\n\n"
#userid = json.load(sys.stdin)
result = {"status": "success"}

try:
  result["score"] = xl.getCardboxScore(userid)
  totalDue = xl.getCurrentDue(userid)
  result["totalDue"] = sum(totalDue.values())
  result["dueByCardbox"] = totalDue
except:
  result["status"] = "Cardbox DB Failure"
#
#print "Hello world\n"
#print xl.getCardboxScore(userid) + "\n"
print json.dumps(result)


