#!/usr/bin/python

import json, sys, os
import MySQLdb as mysql
import time
import updateActive as ua
import xerafinSetup as xs

def post(userid, message, chatTime=None, expire=False):
# chatTime is in milliseconds - epoch*1000
# message is unicode
  result = { }

  now = int(time.time())
  if int(userid) > 10:
    ua.updateActive(userid)
  AUTOLOGOFF = .5 # in hours
  logoffTime = now - (3600*AUTOLOGOFF)

  if chatTime is None:
    chatTime = now*1000

  # this is a little kludgy
  # bad data spooled to the chat file hoses everything
  if userid is None:
    pass
    result["status"] = "Chat Missing Userid"
  elif not expire and message is None:
    result["status"] = "Chat Missing Message"
  else:
    try:
      with xs.getMysqlCon(useUnicode=True) as con:
        if expire:
          command = "delete from chat where userid = %s and timeStamp = %s"
          con.execute(command, (userid, chatTime))
          msg = userid+u','+unicode(chatTime)+u','+u'\n'
          result["msg"] = msg
        else:
          command = 'insert into chat (userid, timeStamp, message) values (%s, %s, %s)'
          con.execute(command, (userid.encode('utf8'), chatTime, message.encode('utf8')))
          msg = userid+u','+unicode(chatTime)+u','+message+u'\n'
          result["msg"] = msg
        command = "select userid from login where last_active > %s"
        con.execute(command, [logoffTime])
        for row in con.fetchall():
          filename = os.path.join('chats', row[0] + '.chat')
          with open(filename, 'a') as f:
            f.write(msg.encode('utf8'))
      result["status"] = "success"
    except mysql.Error, e:
       result["status"] = "MySQL error %d %s " % (e.args[0], e.args[1])
    except:
       template = "An exception of type {0} occured. Arguments:\n{1!r}"
       errmsg = template.format(type(ex).__name__, ex.args)
       result["status"] = errmsg
  return result
  
