#!/usr/bin/python

import xerafinLib as xl
import json, sys
import time
import xerafinSetup as xs

#userid = "10157462952395078"
#userid = "825060375517"
params = json.load(sys.stdin)
userid = params["userid"]

try:
  getDue = params["due"]
except:
  getDue = False
try:
  getCoverage = params["coverage"]
except:
  getCoverage = False

result = { }
error = {"status": "success"}
now = int(time.time())
DAY = 3600 * 24 # length of a day in seconds

try:

  if getDue:
    dueNow = xl.getCurrentDue(userid)
    overdue = xl.getDueInRange(userid, 0, now)
    dueToday = xl.getDueInRange(userid, now, now+DAY)
    dueThisWeek = xl.getDueInRange(userid, now, now+(DAY*7))
    dueByCardbox = {"dueNow": dueNow, "overdue": overdue, "dueToday": dueToday, "dueThisWeek": dueThisWeek}
    totalCards = xl.getTotalByCardbox(userid)
    result["totalCards"] = totalCards
    result["score"] = xl.getCardboxScore(userid)
    result["totalDue"] = sum(dueNow.values())
    result["dueByCardbox"] = dueByCardbox

  if getCoverage:
    allLenFreq = { }
    result["coverage"] = { }
    totalCards = xl.getTotalByLength(userid)
    with xs.getMysqlCon() as con: 
      command = "select length(alphagram), count(distinct alphagram) from words group by length(alphagram) order by length(alphagram)"
      con.execute(command)
      for row in con.fetchall():
        allLenFreq[row[0]] = row[1]
      for box in totalCards:
        result["coverage"][box] = {"cardbox": totalCards[box], "total": allLenFreq[box]}
        pct = (float(totalCards[box])/float(allLenFreq[box])) * 100.0
        result["coverage"][box]["percent"] = format(pct, '.2f')
      
except Exception as ex:
  error["status"] = "%s, %s" % (type(ex).__name__, ex.args)

print "Content-type: application/json\n\n"
print json.dumps([result, error])


