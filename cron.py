#!/usr/bin/python

import xerafinSetup as xs
import time
import os, sys


#print "Content-type: text/html\n\n"
#print "<html><head>"
#print "<title>Cron Test</title>"
#print "</head><body>"
#print "Hello, world!"
#print "</body></html>"


now = int(time.time())

try:

  with xs.getMysqlCon(True) as con:
     con.execute("select count(*), sum(questionsAnswered) from leaderboard where dateStamp = curdate() - interval 1 day group by dateStamp")
     row = con.fetchone()
     users = row[0]
     questions = row[1] 

     # Add Daily Summary chat to database

     userid = u'0'
     chatTime = now * 1000
     message = 'Good job everyone! Yesterday {0} Xerafin users solved {1} alphagrams!'
     message = message.format(users, questions)
     command = "insert into chat (userid, timeStamp, message) values (%s, %s, %s)"

     con.execute(command, (userid.encode('utf8'), chatTime, message))

     # Push chat to active users
     AUTOLOGOFF = .1 # in hours
     logoffTime = now - (3600*AUTOLOGOFF) 
    
     command = "select userid from login where last_active > %s"
     con.execute(command, logoffTime)
     for row in con.fetchall():
        filename = os.path.join('chats', row[0] + '.chat')
        with open(filename, 'a') as f:
            msg = unicode(userid)+u','+unicode(chatTime)+u','+unicode(message)+u'\n'
            f.write(msg.encode('utf8'))
    
except Exception as ex:
  template = "An exception of type {0} occured. Arguments:\n{1!r}"
  message = template.format(type(ex).__name__, ex.args)
  print message

