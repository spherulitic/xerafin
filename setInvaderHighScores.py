#!/usr/bin/python

import json, sys
import MySQLdb as mysql
import xerafinSetup as xs

result = {"personal": 0, "daily": {"score": 0, "userid": 0}}
error = {"status": "success"}

try:
  params = json.load(sys.stdin)
  userid = params["userid"]
  score = params["score"]

  with xs.getMysqlCon() as con:
    con.execute("select score from invaders_personal where userid = %s", userid)
    for row in con.fetchall():
      result["personal"] = row[0]
    con.execute("select score, userid from invaders_daily where dateStamp = curdate()")
    for row in con.fetchall():
      result["daily"]["score"] = row[0]
      result["daily"]["userid"] = row[0]
    if score > result["personal"]:
      result["personal"] = score
      con.execute("update invaders_personal set score = %s where userid = %s", (score, userid))
    if score > result["daily"]["score"]:
      result["daily"] = {"score": score, "userid": userid}
      con.execute("update invaders_daily set score = %s, userid = %s where dateStamp = curdate()", (score, userid))

except Exception as ex: 
  template = "An exception of type {0} occured. Arguments:\n{1!r}"
  message = template.format(type(ex).__name__, ex.args)
  error["status"] = message

print "Content-type: application/json\n\n"
print json.dumps([result, error])


