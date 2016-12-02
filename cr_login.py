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
#		con.execute("drop table login")
#		con.execute("create table login (userid varchar(50), last_login integer, last_active integer, token varchar(500), name varchar(50), photo varchar(500))")
#                con.execute("insert into login (userid, last_login, last_active, token, name, photo) values (0, 0, 0, null, 'Xerafin', 'xerafin.png')")
		con.execute("select count(*) from login")
		print "Table created successfully. {0} rows returned.".format(con.fetchone()[0])
except Exception, e: print repr(e)
#
print "</body></html>"
