#!/usr/bin/python
import sqlite3 as lite
import time
import xerafinLib as xl
import MySQLdb as mysql
import sys

def showDatabaseStats(cur):
  print "Hello"
  cur.execute("select * from cleared_until")
  clearedUntil = time.ctime(cur.fetchone()[0])
  cur.execute("select * from new_words_at")
  newWordsAt = time.ctime(cur.fetchone()[0])
  print "Cleared until %s, next added at %s" % (clearedUntil, newWordsAt)
  print "<table><thead></thead><tbody>"

  cur.execute("select cardbox, difficulty, question, next_scheduled from questions where difficulty = -1 order by cardbox, next_scheduled")
  for row in cur.fetchall():
    print"<tr><td>%s<td>%s<td>%s<td>%s</tr>" % (row[0], row[1], row[2], time.ctime(row[3]))
    
  print "</tbody></table>"

print "Content-type: text/html\n\n"
print "<html><head></head>"
print "<body>"

#userid = 10157462952395078
userid = 825060375517
#now = 1470000000
#with lite.connect("cardboxes/%s.db" % userid) as con:
#  cur = con.cursor()
#  showDatabaseStats(cur)
#  print xl.getPrefs("closet", userid)
#  print xl.setPrefs(closet=12,userid=userid)
print "hey<br>"
with mysql.connect("localhost", "slipkin_clipe", "xev1ous#", "slipkin_xerafin") as con: 
  if con is None:
    error["status"] = "DB connection failure"
  else:
    con.execute("select word from words where alphagram = 'AEELNST'")
    for row in con.fetchall():
       print str(row) + "<br>"

print str(xl.getAnagrams('AEELNST')) + "<br>"
print str(xl.getDef('LATEENS')) + "<br>"
print str(xl.getDef('LEANEST')) + "<br>"
print str(xl.getDef('ELANETS')) + "<br>"
#  print xl.getQuestions(1, userid))
#  command = "insert into questions (question, correct, incorrect, streak, last_correct, difficulty, cardbox, next_scheduled) values (?, 0, 0, 0, 0, -1, 0, ?)"
#  x = xl.getFromStudyOrder(1, userid, cur)
#  print "X is %s<br>" % str(x)
#  try:
#    cur.execute(command, ("ABCDF", now))
#except lite.Error as e:
#  print "SQL Error: " , e.message
#except:
#  print "Unexpected error: " , sys.exec_info()[0]
#  print "first command"
#  for alpha in x:
#    cur.execute(command, (alpha, now))
#    print "alphagram %s" % alpha
 
#  try:
#    xl.makeWordsAvailable(userid, cur)
#  except: 
#    print "make words available crash"
#  showDatabaseStats(cur)
#  try:
#  print xl.setPrefs(userid=userid, studyOrderIndex = 15000)
#  except:
#    print "setPrefs crashed"

print "</body></html>"

