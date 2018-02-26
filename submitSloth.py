#!/usr/bin/python

import json, sys
import xerafinSetup as xs
import xerafinChat as xchat

error = {"status": "success"}

try:
  params = json.load(sys.stdin)
  userid = params["userid"]
  score = int(params["score"])
  alpha = params["alpha"]
  
  with xs.getMysqlCon() as con:
    command = "select name from login where userid = %s"
    con.execute(command, userid)
    name = con.fetchone()[0]
    link = "<a href='#' onclick='initSloth(\"{0}\")'>Click here</a>".format(alpha)
    msg = "{0} has completed {1} on Subword Sloth with a score of {2}%. {3} to try and {4} it!".format(name, alpha, score, link, "equal" if score == 100 else "beat")
    error["status"] = xchat.post(u'1', msg)

except Exception as ex: 
  template = "An exception of type {0} occured. Arguments:\n{1!r}"
  message = template.format(type(ex).__name__, ex.args)
  error["status"] = message

print "Content-type: application/json\n\n"
print json.dumps(error)


