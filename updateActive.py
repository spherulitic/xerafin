#!/usr/bin/python

import MySQLdb as mysql
import time

def updateActive (userid) :
  now = int(time.time())
  with mysql.connect("localhost", "***REMOVED***", "***REMOVED***", "***REMOVED***") as con: 
    if con is None:
      result["status"] = "Chat Database Connection Failed"
    else:
      try:
        command = "update login set last_active = %s where userid = %s"
        if (userid != 0):  # 0 is the system user
          con.execute(command, (now, userid))
      except mysql.Error, e:
         result["status"] = "MySQL error %d %s " % (e.args[0], e.args[1])

