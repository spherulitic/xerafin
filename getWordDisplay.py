#!/usr/bin/python

import xerafinLib as xl
import json, sys

#userid = "10157462952395078"
params = json.load(sys.stdin)
word = params["word"]
result = { }
error = {"status": "success"}

try:
  result["hooks"] = xl.getHooks(word)
  result["definition"] = xl.getDef(word)
  result["innerHooks"] = xl.getDots(word)
except:
  error["status"] = "DB Failure"

print "Content-type: application/json\n\n"
print json.dumps([result, error])


