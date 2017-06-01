#!/usr/bin/python

import xerafinLib as xl
import json, sys

#userid = "10157462952395078"
params = json.load(sys.stdin)
userid = params["userid"]
alpha = params["alpha"]
result = {"alpha": alpha }
error = {"status": "success"}

try:
  result["aux"] = xl.getAuxInfo(alpha, userid)
except:
  error["status"] = "DB Failure"

print "Content-type: application/json\n\n"
print json.dumps([result, error])


