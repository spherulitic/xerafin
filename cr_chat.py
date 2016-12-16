#!/usr/bin/python
import xerafinSetup as xs

print "Content-type: text/html\n\n"
print "<html><head></head>"
print "<body>"

try:
  with xs.getMysqlCon() as con:
	if con is None:
		print "Database connection failed\n"
	else:
		print "Database Connected"
		con.execute("drop table chat")
		con.execute("create table chat (userid varchar(50), timeStamp bigint, message varchar(1000))")
		con.execute("select count(*) from chat")
		print "Table created successfully. {0} rows returned.".format(con.fetchone()[0])
except Exception, e: print repr(e)
#
print "</body></html>"
