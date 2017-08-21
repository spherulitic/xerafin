#!/usr/bin/python

import json, sys, os
import MySQLdb as mysql
import time
import datetime
import xerafinSetup as xs

# Deletes the previous chat from the current day by user 2 (Cardbox Invaders)

#params = json.load(sys.stdin);
now = int(time.time())
error = {"status": "success"}
AUTOLOGOFF = .1 # in hours
logoffTime = now - (3600*AUTOLOGOFF)
SYSTEM_USERID = 2  # userid of system Xerafin user whose chats we are deleting
chatTime = 0

with xs.getMysqlCon() as con:
  if con is None:
    error["status"] = "Chat Database Connection Failed"
  else:
    try:
      command = "select max(timeStamp) from chat where userid = %s"
      con.execute(command, SYSTEM_USERID)
      chatTime = con.fetchone()[0]
      if datetime.date.fromtimestamp(int(chatTime/1000)) == datetime.date.today():
        command = "delete from chat where userid = %s and timeStamp = %s"
        con.execute(command, (SYSTEM_USERID, chatTime))

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
