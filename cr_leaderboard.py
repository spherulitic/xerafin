#!/usr/bin/python
import MySQLdb as mysql

print "Content-type: text/html\n\n"
print "<html><head></head>"
print "<body>"

try:
  with mysql.connect("localhost", "slipkin_clipe", "xev1ous#", "slipkin_xerafin") as con:
	if con is None:
		print "Database connection failed\n"
	else:
		print "Database Connected"
		con.execute("create table if not exists leaderboard (userid varchar(50), dateStamp date, questionsAnswered integer, startScore integer)")
		con.execute("select count(*) from leaderboard")
		print "Table created successfully. {0} rows returned.".format(con.fetchone()[0])
except Exception, e: print repr(e)
#
print "</body></html>"
