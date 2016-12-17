#!/usr/bin/python

import json, sys, os
import MySQLdb as mysql
import time
import updateActive as ua
import xerafinSetup as xs

error = {"status": "success"}
result = [ ]
params = json.load(sys.stdin)
userid = params["userid"]
message = params["chatText"]
chatTime = int(params["chatTime"])  # Epoch * 1000 -- in milliseconds
now = int(time.time())
if userid != '0':
  ua.updateActive(userid)
AUTOLOGOFF = .1 # in hours
logoffTime = now - (3600*AUTOLOGOFF)

try:
  with xs.getMysqlCon() as con:
    if con is None:
      result["status"] = "Chat Database Connection Failed"
    else:
      try:
         command = "insert into chat (userid, timeStamp, message) values (%s, %s, %s)"
         con.execute(command, (userid, chatTime, message))
         command = "select userid from login where last_active > %s"
         con.execute(command, logoffTime)
         for row in con.fetchall():
           filename = os.path.join('chats', row[0] + '.chat')
           with open(filename, 'a') as f:
             f.write(str(userid)+','+str(chatTime)+','+message+'\n')
      except mysql.Error, e:
         result["status"] = "MySQL error %d %s " % (e.args[0], e.args[1])
      except:
         template = "An exception of type {0} occured. Arguments:\n{1!r}"
         message = template.format(type(ex).__name__, ex.args)
         result["status"] =  message


except:
  result["status"] = "Chat DB Failure"

print "Content-type: application/json\n\n"
print json.dumps([result, error])



