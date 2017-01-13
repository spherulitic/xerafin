#!/usr/bin/python

import json, sys
import MySQLdb as mysql
import xerafinLib as xl
import xerafinSetup as xs

try:
  params = json.load(sys.stdin)
  me = params["userid"]
except:
  me = "0"

result = {"today": [ ], "yesterday": [ ], "lastWeek": [ ] }
result["myRank"] = { "today": 0, "yesterday": 0, "lastWeek": 0 }
error = {"status": "success"}
currScores = { }
todayScore = { }

try:
  with xs.getMysqlCon() as con:
    con.execute("select userid from login")
    for row in con.fetchall():
      userid = row[0]
      currScores[userid] = xl.getCardboxScore(userid)
      todayScore[userid] = 0
    result["scores"] = currScores

#### 
#### TODAY
####

    getMyScores = True
    command = "select name, photo, questionsAnswered, startScore, userid from leaderboard join login using (userid) where dateStamp = curdate() order by questionsAnswered desc limit 10"
    con.execute(command)
    for row in con.fetchall():
      todayScore[row[4]] = int(currScores[row[4]]) - int(row[3]) 
      if row[4] == me:
        getMyScores = False
      result["today"].append({"name": row[0], "photo": row[1], "answered": row[2], "score": todayScore[row[4]] })
    if getMyScores and me != "0":
      command = "select name, photo, questionsAnswered, startScore from leaderboard join login using (userid) where dateStamp = curdate() and userid = %s"
      con.execute(command, me)
      row = con.fetchone()
      todayScore[me] = int(currScores[me]) - int(row[3]) 
      myAnswered = row[2]
      result["today"].append({"name": row[0], "photo": row[1], "answered": myAnswered, "score": todayScore[me] })
      command = "select count(*) from leaderboard join login using (userid) where dateStamp = curdate() and questionsAnswered > %s"
      con.execute(command, myAnswered)
      result["myRank"]["today"] = con.fetchone()[0]+1

####
#### YESTERDAY
####
     
    getMyScores = True
    command = "select name, photo, questionsAnswered, startScore, userid from leaderboard join login using (userid) where dateStamp = curdate() - interval 1 day order by questionsAnswered desc limit 10"
    con.execute(command)
    for row in con.fetchall():
      if row[4] == me:
        getMyScores = False
      result["yesterday"].append({"name": row[0], "photo": row[1], "answered": row[2], "score": int(currScores[row[4]]) - int(row[3]) - todayScore[row[4]]})
    if getMyScores and me != "0":
      command = "select name, photo, questionsAnswered, startScore from leaderboard join login using (userid) where dateStamp = curdate() - interval 1 day and userid = %s"
      con.execute(command, me)
      row = con.fetchone()
      myAnswered = row[2]
      result["yesterday"].append({"name": row[0], "photo": row[1], "answered": myAnswered, "score": int(currScores[me]) - int(row[3]) - todayScore[me] })
      command = "select count(*) from leaderboard join login using (userid) where dateStamp = curdate() - interval 1 day and questionsAnswered > %s"
      con.execute(command, myAnswered)
      result["myRank"]["yesterday"] = con.fetchone()[0]+1

####
#### LAST WEEK
####

    getMyScores = True
    command = "select name, photo, sum(questionsAnswered), min(startScore), userid from leaderboard join login using (userid) where dateStamp >= curdate() - interval 7 day group by name, photo, userid order by sum(questionsAnswered) desc limit 10"
    con.execute(command)
    for row in con.fetchall():
      if row[4] == me:
        getMyScores = False
      result["lastWeek"].append({"name": row[0], "photo": row[1], "answered": int(row[2]), "score": int(currScores[row[4]]) - int(row[3])})
    if getMyScores and me != "0":
      command = "select name, photo, sum(questionsAnswered), min(startScore) from leaderboard join login using (userid) where dateStamp >= curdate() - interval 7 day and userid = %s group by name, photo, userid"
      con.execute(command, me)
      row = con.fetchone()
      myAnswered = int(row[2])
      result["lastWeek"].append({"name": row[0], "photo": row[1], "answered": myAnswered, "score": int(currScores[me]) - int(row[3])})
      command = "select userid from leaderboard where dateStamp >= curdate() - interval 7 day group by userid having sum(questionsAnswered) > %s"
      con.execute(command, myAnswered)
      result["myRank"]["lastWeek"] = len(con.fetchall())+1

except Exception as ex: 
  template = "An exception of type {0} occured. Arguments:\n{1!r}"
  message = template.format(type(ex).__name__, ex.args)
  error["status"] = message



print "Content-type: application/json\n\n"
print json.dumps([result, error])


