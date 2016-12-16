#!/usr/bin/python

import json, sys
import os
import MySQLdb as mysql
import time

params = json.load(sys.stdin);
error = {"status": "success"}
result = [ ]

now = int(params["mostRecent"]) 
userid = params["userid"]
chatFile = os.path.join("chats", userid + ".chat")
open(chatFile, 'w').close()
command = "select name, photo, timeStamp, message from chat join login on chat.userid = login.userid where timeStamp > %s order by timeStamp asc"

with mysql.connect("localhost", "slipkin_clipe", "xev1ous#", "slipkin_xerafin") as con:
    if con is None:
      error["status"] = "Chat Database Connection Failed"
    else:
      try:
        con.execute(command, now)
        for row in con.fetchall():
          result.append({"chatDate": row[2], "photo": row[1], "name": row[0], "chatText": row[3] })
      except mysql.Error, e:
        error["status"] = "MySQL error %d %s " % (e.args[0], e.args[1])
      except:
        error["status"] = "Chat DB Failure"

print "Content-type: application/json\n\n"
print json.dumps([result, 0, error])
