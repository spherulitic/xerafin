#!/usr/bin/python
import MySQLdb as mysql
import sys, json
import time

# Called via AJAX and returns photo URL, name, and last active time of all logged in users

# JSON fields: name, photo (url), id, token

now = int(time.time())
AUTOLOGOFF = .1 # in hours
logoffTime = now - (3600*AUTOLOGOFF)
print "Content-type: application/json\n\n"
#params = json.load(sys.stdin)
result = [ ]
error = {"status": "success"}

with mysql.connect("localhost", "***REMOVED***", "***REMOVED***", "***REMOVED***") as con:
  if con is None:
    error["status"] = "DB connection failure"
  else:
    try:
      command = "select name, photo, last_active from login where last_active > %s"
#      command = "select name, photo, last_active from login"
      con.execute(command, logoffTime)
      for row in con.fetchall():
#        print str(row)
        result.append({"name": row[0], "photo": row[1], "lastActive": row[2]})
		
    except mysql.Error, e: 
      error["status"] = "MySQL error %d %s" % (e.args[0], e.args[1])

print json.dumps([result, error])
		
