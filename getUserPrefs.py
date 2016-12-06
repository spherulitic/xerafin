#!/usr/bin/python

import xerafinLib as xl
import json, sys

#userid = "10157462952395078"
#userid = "825060375517"
params = json.load(sys.stdin)
userid = params["userid"]
result = { }
error = {"status": "success"}

try:
  result = xl.getAllPrefs(userid)
except:
  error["status"] = "Error retrieving prefs"

print "Content-type: application/json\n\n"
print json.dumps([result, error])


