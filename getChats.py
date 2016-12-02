#!/usr/bin/python

import json, sys
import MySQLdb as mysql
import time

params = json.load(sys.stdin);
now = int(params["mostRecent"]) 
error = {"status": "success at %s" % now}
result = [ ]
MAX_TRIES = 45
TRY_DELAY = .66 # in seconds
tries = 0
command = "select name, photo, timeStamp, message from chat join login on chat.userid = login.userid where timeStamp > %s order by timeStamp asc"

with mysql.connect("localhost", "***REMOVED***", "***REMOVED***", "***REMOVED***") as con:
  while not result and tries < MAX_TRIES:
    tries = tries + 1
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
    time.sleep(TRY_DELAY);

print "Content-type: application/json\n\n"
print json.dumps([result, error])


