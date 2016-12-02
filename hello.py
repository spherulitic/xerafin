#!/usr/bin/python
import MySQLdb as mysql
import sqlite3 as lite


con = mysql.connect("localhost", "***REMOVED***", "***REMOVED***", "***REMOVED***")
if con is None:
   print "Database connection failed\n"
else:
   cur = con.cursor()
   cur.execute("select * from test")
   data = cur.fetchall()
   con.close()

with lite.connect("xerafin.db") as con:
   cur = con.cursor()
   cur.execute("select count(*) from questions")
   data2 = cur.fetchone()

print "Content-type: text/html\n\n";
print "<html><head>";
print "<title>CGI Test</title>";
print "</head><body>";
print "<p>Test page 2 using Python</p>";
for row in data:
  print "Database result: {0}, {1}\n".format(row[0], row[1])
print "Cardbox has {0} rows.\n".format(data2[0])
print "</body></html>";

