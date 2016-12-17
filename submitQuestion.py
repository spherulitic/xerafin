#!/usr/bin/python

import xerafinLib as xl
import json, sys
import updateActive as ua
import MySQLdb as mysql
import xerafinSetup as xs

params = json.load(sys.stdin)
userid = params["user"]
alpha = params["question"]
correct = params["correct"] # boolean
currentCardbox = params["cardbox"] 
ua.updateActive(userid)
increment = params["incrementQ"] # boolean

error = {"status": "success"}
result = { }

# increment means - add one to the question total
# correct means - put in currentCardbox + 1
# wrong means - put in cardbox 0
# to reschedule in current CB, need to pass in cardbox-1

try:
  if increment:
    with xs.getMysqlCon() as con:
      con.execute("update leaderboard set questionsAnswered = questionsAnswered+1 where userid = %s and dateStamp = curdate()", userid)
      if con.rowcount == 0:
        con.execute("insert into leaderboard (userid, dateStamp, questionsAnswered, startScore) values (%s, curdate(), 1, %s)", (userid, xl.getCardboxScore(userid)))
      con.execute("select questionsAnswered from leaderboard where userid = %s and dateStamp = curdate()" % userid)
      result["qAnswered"] = con.fetchone()[0]

  if correct:
    xl.correct(alpha, userid, currentCardbox+1)
  else:
    xl.wrong(alpha, userid)

  result["score"] = xl.getCardboxScore(userid)
except:
  error["status"] = "Cardbox DB Failure"

print "Content-type: application/json\n\n"
print json.dumps([result, error])


