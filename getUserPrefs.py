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
except Exception as ex:
  template = "An exception of type {0} occured. Arguments:\n{1!r}"
  message = template.format(type(ex).__name__, ex.args)
  error["status"] = message

print "Content-type: application/json\n\n"
print json.dumps([result, error])


