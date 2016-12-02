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
		con.execute("drop table words")
		con.execute("create table words (front_hooks varchar(26), word varchar(15), back_hooks varchar(26), alphagram varchar(15), definition varchar(500), probability_order integer, playability_order integer )")
		con.execute("load data local infile 'all_words.csv' into table words fields terminated by ',' enclosed by '\"' (probability_order, front_hooks, word, back_hooks, alphagram, definition, playability_order)")
		con.execute("select count(*) from words")
		print "Table created successfully. {0} rows returned.".format(con.fetchone()[0])
except Exception, e: print repr(e)
#
print "</body></html>"
