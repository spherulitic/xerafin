#!/usr/bin/python

import json, sys
import MySQLdb as mysql
import xerafinSetup as xs

try:
  params = json.load(sys.stdin)
  userid = params["userid"]
except:
  userid = "0"

result = {"personal": 0, "daily": {"score": 0, "userid": 0}}
error = {"status": "success"}

try:
  with xs.getMysqlCon() as con:
    con.execute("select score from invaders_personal where userid = %s", userid)
    if con.rowcount == 0:
      con.execute("insert into invaders_personal (userid, score) values (%s, 0)", userid)
    else:
      result["personal"] = con.fetchone()[0]
    con.execute("select score, userid from invaders_daily where dateStamp = curdate()")
    # I guess this is a race condition if two users hit this at the start of the day at the same time
    if con.rowcount == 0:
      con.execute("insert into invaders_daily (userid, score, dateStamp) values (0, 0, curdate())")
    else:
      row = con.fetchone()
      result["daily"]["score"] = row[0]
      result["daily"]["userid"] = row[1]

except Exception as ex: 
  template = "An exception of type {0} occured. Arguments:\n{1!r}"
  message = template.format(type(ex).__name__, ex.args)
  error["status"] = message



print "Content-type: application/json\n\n"
print json.dumps([result, error])


