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
#		con.execute("drop table user_prefs")
#		con.execute("create table user_prefs (userid varchar(50), studyOrderIndex integer, closet integer, newWordsAtOnce integer, reschedHrs integer, showNumSolutions varchar(1))")
#		con.execute("alter table user_prefs add cb0max integer");
		con.execute("update user_prefs set cb0max = 200");
		con.execute("select count(*) from user_prefs")
		print "Table created successfully. {0} rows returned.".format(con.fetchone()[0])
except Exception, e: print repr(e)
#
print "</body></html>"
