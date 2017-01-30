#!/usr/bin/python

import json, sys, os
import MySQLdb as mysql
import time
import xerafinSetup as xs

# Takes in a userid and returns the previous chat that mentions that user 
#  from the system user Xerafin
#  Message is in the format <name> has completed <number> alphagrams today!

params = json.load(sys.stdin);
userid = params["userid"]
error = {"status": "success"}
now = int(time.time())
AUTOLOGOFF = .1 # in hours
logoffTime = now - (3600*AUTOLOGOFF)
SYSTEM_USERID = 0  # userid of system Xerafin user whose chats we are deleting

with xs.getMysqlCon() as con:
  if con is None:
    error["status"] = "Chat Database Connection Failed"
  else:
    try:
      command = "select name from login where userid = %s"
      con.execute(command, userid)
      name = con.fetchone()[0]
      command = "select max(timeStamp) from chat where userid = " + str(SYSTEM_USERID) + " and message like '" + name + " has completed %'"
      con.execute(command)
      chatTime = con.fetchone()[0]

      command = "select userid from login where last_active > %s"
      con.execute(command, logoffTime)
      for row in con.fetchall():
        filename = os.path.join('chats', row[0] + '.chat')
        with open(filename, 'a') as f:
          msg = unicode(SYSTEM_USERID)+u','+unicode(chatTime)+u','+u'\n'
          f.write(msg.encode('utf8'))
      
    except mysql.Error, e:
      error["status"] = "MySQL error %d %s " % (e.args[0], e.args[1])
    except:
      error["status"] = "Chat DB Failure"

          
print "Content-type: application/json\n\n"
print json.dumps(error)
