#!/usr/bin/python

import xerafinLib as xl
import MySQLdb as mysql
import sqlite3 as lite
#import dawg_python as dawg

#userid = "10157462952395078"  # me
#userid = "825060375517"  # Randi
#userid = "10101000691374160"  # Andy
#userid = "10100189451539674" # Quinn
#userid = "10154123090647333" # Calum
#userid = "10155392297839115" # Geoff
#newWordsAtOnce = 4

print "Content-type: text/html\n\n"
print "<html><head>"
print "<title>CGI Test</title>"
print "</head><body>"

#d = dawg.DAWG().load('alpha.dawg')
#d = dawg.DAWG()

#for key in d.iterkeys(u'AABB'):
#  print key + "<br>"

try:
#  pass
#  with lite.connect(xl.getDBFile(userid)) as con:
#    cur = con.cursor()
#    xl.setPrefs(userid=userid, studyOrderIndex=1)
#    print str(xl.getPrefs("studyOrderIndex", userid))
#    print str(xl.getFromStudyOrder(4, userid, cur))

##    xl.insertIntoNextAdded(["INJ", "AZ"], cur)
#    cur.execute("select * from next_added")
#    for row in cur.fetchall():
#      print row[0] + "<br>"
#  print str(xl.getDots('ZUPPAS'))
#
#  nextBingo = xl.getBingoFromCardbox(userid)
#  for alpha in xl.getSubanagrams(nextBingo):
#    words = xl.getAnagrams(alpha)
#    auxInfo = xl.getAuxInfo(alpha, userid)
#    result = { "alpha": alpha, "words": words, "auxInfo": auxInfo }
#    print str(result) + "<br>"    
#  print xl.setPrefs2("cb0max", userid, "50")
#  print xl.setPrefs2("reschedHrs", userid, "240")
#  print xl.setPrefs2("newWordsAtOnce", userid, "4")
#  print xl.setPrefs2("closet", userid, "5")

  with mysql.connect("localhost", "slipkin_clipe", "xev1ous#", "slipkin_xerafin") as con:
#    con.execute("select userid, name from login")
#    con.execute("select * from user_prefs where userid = %s" % userid)
    con.execute("show columns from user_prefs")
    for row in con.fetchall():
      print str(row) + "<br>"

#    con.execute("alter ignore table leaderboard add unique index ldbd_idx (userid, datestamp)")

#    print "<br><BR>"
#    con.execute("select * from leaderboard where dateStamp = CURDATE()")
#    for row in con.fetchall():
#      print str(row) + "<br>"
#     con.execute("select cb0max from user_prefs where userid = %s" % userid)
#     print con.fetchone()[0]
#    con.execute("select * from login")
#    for row in con.fetchall():
#      print str(row) + '<br>'
#    print "count %s" % con.fetchone()[0]
#    command = "select name, photo, sum(questionsAnswered), min(startScore), userid from leaderboard join login using (userid) where dateStamp >= curdate() - interval 7 day group by name, photo, userid"
#    con.execute(command)
#    for row in con.fetchall():
#      print "row"
#      print "%s %s %s %s" % (row[0], row[1], row[2], row[3])

except Exception as ex:
  template = "An exception of type {0} occured. Arguments:\n{1!r}"
  message = template.format(type(ex).__name__, ex.args)
  print message

print "<br>yay<br>"
print "</body></html>"

