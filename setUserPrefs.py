#!/usr/bin/python

import xerafinLib as xl
import json, sys

#userid = "10157462952395078"
#userid = "825060375517"
params = json.load(sys.stdin)
userid = params["user"]
newWordsAtOnce = int(params["newWordsAtOnce"])
reschedHrs = int(params["reschedHrs"])
closet = int(params["closet"])
cb0max = int(params["cb0max"])

result = {"status": "success" }

try:
  xl.setPrefs2("newWordsAtOnce", userid, newWordsAtOnce)
  xl.setPrefs2("reschedHrs", userid, reschedHrs)
  xl.setPrefs2("closet", userid, closet)
  xl.setPrefs2("cb0max", userid, cb0max)
except Exception as ex:
  template = "An exception of type {0} occured. Arguments:\n{1!r}"
  message = template.format(type(ex).__name__, ex.args)
  result["status"] = message

print "Content-type: application/json\n\n"
print json.dumps(result)


