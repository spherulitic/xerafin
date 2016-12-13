#!/usr/bin/python

import json, sys, os
import MySQLdb as mysql
import time


def appendChatToResult(line):
  temp = line.split(',')
  userid = temp[0]
  timeStamp = temp[1]
  message = ','.join(temp[2:])


  with mysql.connect("localhost", "***REMOVED***", "***REMOVED***", "***REMOVED***") as con: 
    if con is None:
      pass
    else:
      con.execute("select photo, name from login where userid = %s", userid)
      row = con.fetchone()
      return {"chatDate": int(timeStamp), "photo": row[0], "name": row[1], "chatText": message }

#  return {"chatDate": 0, "photo": "", "name": "Stinky McCheese", "chatText": userid}

params = json.load(sys.stdin);
userid = params["userid"]
lastReadRow = params["rownum"]
error = {"status": "success"}
result = [ ]
MAX_TRIES = 45
TRY_DELAY = 1.0 # in seconds
tries = 0
time.sleep(4)
chatFile = os.path.join('chats', userid + '.chat')
with open(chatFile, 'r') as f:
  lineCounter = 0
  while lineCounter < lastReadRow:
    f.readline()
    lineCounter = lineCounter + 1
  while tries < MAX_TRIES:
    line = f.readline()
    if line:
      while line:
        result.append(appendChatToResult(line))
        line = f.readline()
        lastReadRow = lastReadRow + 1
      break
    time.sleep(TRY_DELAY)
    tries = tries + 1 
          
print "Content-type: application/json\n\n"
print json.dumps([result, lastReadRow, error])
