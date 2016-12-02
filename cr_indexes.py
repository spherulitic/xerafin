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
#		con.execute("create index alpha_idx on words(alphagram)")
		con.execute("create index word_idx on words(word)")
		print "Indexes created."
except Exception, e: print repr(e)
#
print "</body></html>"
