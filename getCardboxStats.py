#!/usr/bin/python

import xerafinLib as xl
import json, sys
import time

#userid = "10157462952395078"
#userid = "825060375517"
params = json.load(sys.stdin)
userid = params["userid"]
result = { }
error = {"status": "success"}
now = int(time.time())
DAY = 3600 * 24 # length of a day in seconds

try:
  result["score"] = xl.getCardboxScore(userid)
  dueNow = xl.getCurrentDue(userid)
  dueToday = xl.getDueInRange(userid, now, now+DAY)
  dueThisWeek = xl.getDueInRange(userid, now, now+(DAY*7))
  dueByCardbox = {"dueNow": dueNow, "dueToday": dueToday, "dueThisWeek": dueThisWeek}
  totalCards = xl.getTotalByCardbox(userid)
  result["totalDue"] = sum(dueNow.values())
  result["dueByCardbox"] = dueByCardbox
  result["totalCards"] = totalCards
except:
  error["status"] = "Cardbox DB Failure"

print "Content-type: application/json\n\n"
print json.dumps([result, error])


