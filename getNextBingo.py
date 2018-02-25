#!/usr/bin/python

import xerafinLib as xl
import json, sys
import updateActive as ua

params = json.load(sys.stdin)
userid = params["user"]
try:
  cardbox = int(params["cardbox"])
except:
  cardbox = 0
#userid = "10157462952395078"  # me
ua.updateActive(userid)
error = {"status": "success"}
result = { } 

try:

  result["alpha"] = xl.getBingoFromCardbox(userid, cardbox)
#  result["alpha"] = 'ILLOTXY'

except Exception as ex:
  template = "An exception of type {0} occured. Arguments:\n{1!r}"
  message = template.format(type(ex).__name__, ex.args)
  error["status"] =  message

print "Content-type: application/json\n\n"
print json.dumps([result, error])


