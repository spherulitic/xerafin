#!/usr/bin/python

import xerafinLib as xl
import json, sys

params = json.load(sys.stdin)
userid = params["user"]
result = {"status": "success" }
try:
  newWordsAtOnce = int(params["newWordsAtOnce"])
  reschedHrs = int(params["reschedHrs"])
  closet = int(params["closet"])
  cb0max = int(params["cb0max"])
  assert newWordsAtOnce > -1
  assert reschedHrs > -1
  assert closet > -1
  assert cb0max > -1
  xl.setPrefs2("newWordsAtOnce", userid, newWordsAtOnce)
  xl.setPrefs2("reschedHrs", userid, reschedHrs)
  xl.setPrefs2("closet", userid, closet)
  xl.setPrefs2("cb0max", userid, cb0max)
except ValueError:
  result["status"] = "Input must be integers."
except AssertionError:
  result["status"] = "User Preferences must be greater than zero."
except Exception as ex:
  template = "An exception of type {0} occured. Arguments:\n{1!r}"
  message = template.format(type(ex).__name__, ex.args)
  result["status"] = message

print "Content-type: application/json\n\n"
print json.dumps(result)


