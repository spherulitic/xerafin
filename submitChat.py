#!/usr/bin/python

import json, sys
import xerafinChat as xChat

params = json.load(sys.stdin)
print "Content-type: application/json\n\n"

try:
  userid = unicode(params["userid"])
  message = unicode(params["chatText"])
  chatTime = int(params["chatTime"])  # Epoch * 1000 -- in milliseconds
  try:
    expire = params["expire"]
  except:
    expire = False

  result = xChat.post(userid, message, chatTime, expire)
  print json.dumps(result)
except:
  print json.dumps("Incorrect parameters")





