#!/usr/bin/python

import xerafinLib as xl
import json, sys, time
import updateActive as ua
import MySQLdb as mysql
import xerafinSetup as xs
import xerafinChat as xchat

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
  with xs.getMysqlCon() as con:
    if increment:
      con.execute("update leaderboard set questionsAnswered = questionsAnswered+1 where userid = %s and dateStamp = curdate()", userid)
      if con.rowcount == 0:
        con.execute("insert into leaderboard (userid, dateStamp, questionsAnswered, startScore) values (%s, curdate(), 1, %s)", (userid, xl.getCardboxScore(userid)))
    con.execute("select questionsAnswered, startScore from leaderboard where userid = %s and dateStamp = curdate()" % userid)
    row = con.fetchone()
    result["qAnswered"] = row[0]
    result["startScore"] = row[1]

  if correct:
    xl.correct(alpha, userid, currentCardbox+1)
  else:
    xl.wrong(alpha, userid)

  result["aux"] = xl.getAuxInfo(alpha, userid)
  result["score"] = xl.getCardboxScore(userid)

  # MILESTONE CHATS 
  # Every 50 up to 500, every 100 up to 1000, every 200 after that
  
  SYSTEM_USERID = 0 # Xerafin system uid
  milestone = (result["qAnswered"] < 501 and result["qAnswered"]%50==0) or (result["qAnswered"] < 1001 and result["qAnswered"]%100==0) or (result["qAnswered"]%200==0)

  if milestone:
    with xs.getMysqlCon() as con:
      command = "select name from login where userid = %s"
      con.execute(command, userid)
      name = con.fetchone()[0]
     
    # Find the previous milestone chat to expire
      try:
        command = "select max(timeStamp) from chat where userid = %s and message like %s"
        con.execute(command, (SYSTEM_USERID, "%{0} has completed %".format(name)))
        expiredChatTime = con.fetchone()[0]
        error["milestoneDelete"] = xchat.post(u'0', u'', expiredChatTime, True)
      except:
        pass 
 
    msg = "{0} has completed <b>{1}</b> alphagrams today!".format(name, result["qAnswered"])
    error["milestoneSubmit"] = xchat.post(u'0', msg)

except:
  template = "An exception of type {0} occured. Arguments:\n{1!r}"
  errmsg = template.format(type(ex).__name__, ex.args)
  error["status"] = errmsg


print "Content-type: application/json\n\n"
print json.dumps([result, error])


