#!/usr/bin/python

import MySQLdb as mysql
import time
import xerafinSetup as xs

def updateActive (userid, timestamp=None) :
  if timestamp is None:
    timestamp = int(time.time())
  with xs.getMysqlCon() as con:
    if con is None:
      result["status"] = "Chat Database Connection Failed"
    else:
      try:
        command = "update login set last_active = %s where userid = %s"
        if (userid != 0):  # 0 is the system user
          con.execute(command, (timestamp, userid))
      except mysql.Error, e:
         result["status"] = "MySQL error %d %s " % (e.args[0], e.args[1])

