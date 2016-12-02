#!/usr/bin/python

import json, sys
import MySQLdb as mysql
import time
import updateActive as ua

error = {"status": "success"}
result = [ ]
params = json.load(sys.stdin)
userid = params["userid"]
message = params["chatText"]
chatTime = int(params["chatTime"])  # Epoch * 1000 -- in milliseconds
now = int(time.time())
ua.updateActive(userid)

try:
  with mysql.connect("localhost", "***REMOVED***", "***REMOVED***", "***REMOVED***") as con:
    if con is None:
      result["status"] = "Chat Database Connection Failed"
    else:
      try:
         command = "insert into chat (userid, timeStamp, message) values (%s, %s, %s)"
         con.execute(command, (userid, chatTime, message))

      except mysql.Error, e:
         result["status"] = "MySQL error %d %s " % (e.args[0], e.args[1])
except:
  result["status"] = "Chat DB Failure"

print "Content-type: application/json\n\n"
print json.dumps([result, error])



