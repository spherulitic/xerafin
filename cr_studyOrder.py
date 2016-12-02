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
      print "Database Connected<br>"
      command = "create table if not exists studyOrder (studyOrderIndex int, alphagram varchar(15));"
      print "%s <br>" % command
      con.execute(command)
      con.execute("delete from studyOrder")
      con.execute("load data local infile 'studyOrder.csv' into table studyOrder fields terminated by ',' (studyOrderIndex, alphagram)")
      con.execute("select count(*) from studyOrder;")
      print "Table created successfully. {0} rows returned.".format(con.fetchone()[0])
except Exception, e: print repr(e)
print "</body></html>"

