#!/usr/bin/python

import json, sys
import MySQLdb as mysql
import xerafinLib as xl

result = {"today": [ ], "yesterday": [ ], "lastWeek": [ ] }
error = {"status": "success"}
startScores = { }
todayScore = { }

try:
  with mysql.connect("localhost", "***REMOVED***", "***REMOVED***", "***REMOVED***") as con:

    con.execute("select userid from login")
    for row in con.fetchall():
      userid = row[0]
      startScores[userid] = xl.getCardboxScore(userid)
      todayScore[userid] = 0
    result["scores"] = startScores

    command = "select name, photo, questionsAnswered, startScore, userid from leaderboard join login using (userid) where dateStamp = curdate() order by questionsAnswered desc limit 10"
    con.execute(command)
    for row in con.fetchall():
      todayScore[row[4]] = int(startScores[row[4]]) - int(row[3]) 
      result["today"].append({"name": row[0], "photo": row[1], "answered": row[2], "score": todayScore[row[4]] })

    command = "select name, photo, questionsAnswered, startScore, userid from leaderboard join login using (userid) where dateStamp = curdate() - interval 1 day order by questionsAnswered desc limit 10"
    con.execute(command)
    for row in con.fetchall():
      result["yesterday"].append({"name": row[0], "photo": row[1], "answered": row[2], "score": int(startScores[row[4]]) - int(row[3]) - todayScore[row[4]]})

    command = "select name, photo, sum(questionsAnswered), min(startScore), userid from leaderboard join login using (userid) where dateStamp >= curdate() - interval 7 day group by name, photo, userid order by sum(questionsAnswered) desc limit 10"
    con.execute(command)
    for row in con.fetchall():
      result["lastWeek"].append({"name": row[0], "photo": row[1], "answered": int(row[2]), "score": int(startScores[row[4]]) - int(row[3])})
#      result["lastWeek"].append({"name": row[0], "photo": row[1], "answered": row[2], "score": int(startScores[row[4]]) - int(row[3])})
#      result["lastWeek"].append({"name": row[0], "photo": row[1], "answered": row[2], "score": 0})

except Exception as ex: 
  template = "An exception of type {0} occured. Arguments:\n{1!r}"
  message = template.format(type(ex).__name__, ex.args)
  error["status"] = message



print "Content-type: application/json\n\n"
print json.dumps([result, error])


