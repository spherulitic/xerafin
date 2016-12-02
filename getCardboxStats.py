#!/usr/bin/python

import xerafinLib as xl
import json, sys

#userid = "10157462952395078"
#userid = "825060375517"
params = json.load(sys.stdin)
userid = params["userid"]
result = { }
error = {"status": "success"}

try:
  result["score"] = xl.getCardboxScore(userid)
  totalDue = xl.getCurrentDue(userid)
  totalCards = xl.getTotalByCardbox(userid)
  result["totalDue"] = sum(totalDue.values())
  result["dueByCardbox"] = totalDue
  result["totalCards"] = totalCards
except:
  error["status"] = "Cardbox DB Failure"

print "Content-type: application/json\n\n"
print json.dumps([result, error])


