#!/usr/bin/python

import xerafinLib as xl
import json, sys
import MySQLdb as mysql
import xerafinSetup as xs

params = json.load(sys.stdin)
userid = params["user"]
error = {"status": "success"}

try:
  xl.newQuiz(userid)
  with xs.getMysqlCon() as con:
    con.execute("select questionsAnswered, startScore from leaderboard where userid = %s and dateStamp = curdate()", (userid,))
    row = con.fetchone()
    if row is not None:
      error["qAnswered"] = row[0]
      error["startScore"] = row[1]
      error["score"] = xl.getCardboxScore(userid)
    else:
      error["qAnswered"] = 0
      error["startScore"] = xl.getCardboxScore(userid)      
      error["score"] = error["startScore"]

except:
  error["status"] = "Cardbox DB Failure"

print "Content-type: application/json\n\n"
print json.dumps(error)


