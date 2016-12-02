#!/usr/bin/python

import MySQLdb as mysql
import time

print "Content-type: text/html\n\n"
print "<html><head></head>"
print "<body>"

command = "select name, photo, timeStamp, message from chat join login on chat.userid = login.userid order by timeStamp desc"

with mysql.connect("localhost", "slipkin_clipe", "xev1ous#", "slipkin_xerafin") as con:
    if con is None:
      print "Chat Database Connection Failed"
    else:
      try:
        con.execute(command)
        for row in con.fetchall():
          print "chatDate %s name %s chat text %s<br>" % (row[2], row[0], row[3])
      except mysql.Error, e:
        error["status"] = "MySQL error %d %s " % (e.args[0], e.args[1])
      except:
        error["status"] = "Chat DB Failure"

print "</body></html>"

