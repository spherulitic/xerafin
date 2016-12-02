#!/usr/bin/python
import cgi, json, sys, os
import xerafinLib as xl

params = cgi.FieldStorage()
userid = params.keys()[0]
inFile = params[userid].file
outFile = os.path.join(sys.path[0], 'cardboxes', "%s.db" % userid)

result = {"status": "success"}
result["status"] = outFile

f = open(outFile, 'wb')
while True:
  chunk = inFile.read(10000)
  if not chunk: break
  f.write(chunk)
f.close()
   #result["status"] = "Error: %s" % sys.exec_info()[0]

if xl.checkCardboxDatabase(userid):
  pass
else:
  result["status"] = "invalid cardbox"

print "Content-type: application/json\n\n"
print json.dumps(result)

		

