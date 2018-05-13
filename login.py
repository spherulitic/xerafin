#!/usr/bin/python
import MySQLdb as mysql
import sys, json
import time
import xerafinSetup as xs

# Called via AJAX when a user logs in
# Accepts a Facebook token and updates last login date
# If a user is new, adds them to login table and creates an empty cardbox db, default prefs, etc

# JSON fields: name, photo (url), id, token

print "Content-type: application/json\n\n"
params = json.load(sys.stdin)
result = {"status": "success"}
userid = params["id"]
token = params["token"]
name = params["name"]
photo = params["photo"]


try:
  first = params["firstName"]
  last = params["lastName"]
except:
  first = name
  last = ""

name = name.replace(u'\u0142', 'l')
first = first.replace(u'\u0142', 'l')
last = last.replace(u'\u0142', 'l')
now = int(time.time())

with xs.getMysqlCon() as con:
  if con is None:
    result["status"] = "DB connection failure"
  else:
    try:
      command = "delete from login where userid = %s"
      con.execute(command, userid)
      command = "insert into login (userid, last_login, last_active, token, name, firstName, lastName, photo) values (%s, %s, %s, %s, %s, %s, %s, %s)"
      con.execute(command, (userid, now, now, token, name, first, last, photo))
      # Check if they have user preferences; if not insert defaults
      command = "select count(*) from user_prefs where userid = %s"
      con.execute(command, userid)
      if con.fetchone()[0] == 0:
         command = "insert into user_prefs (userid, studyOrderIndex, closet, newWordsAtOnce, reschedHrs, showNumSolutions, cb0max, schedVersion, secLevel, isTD) values (%s, 0, 20, 4, 24, 'Y', 200, 0, 0, 0)"
         con.execute(command, userid)
         xl.checkCardboxDatabase(userid)

    except mysql.Error, e: 
      result["status"] = "MySQL error %d %s" % (e.args[0], e.args[1])
    
print json.dumps(result)
    
