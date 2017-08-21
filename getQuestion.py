#!/usr/bin/python

import xerafinLib as xl
import json, sys

#userid = "10157462952395078"
params = json.load(sys.stdin)
userid = params["user"]
numQuestions = params["numQuestions"]
result = {"getFromStudyOrder": False }
words = { }
error = {"status": "success"}
try:
  lock = params["lock"]
except:
  lock = False

try:
  # { "ALPHAGRAM": [WORD, WORD, WORD] }
  result["questions"] = xl.getQuestions(numQuestions, userid)
  auxInfoList = [ ] 
  for key in result["questions"].keys():
    auxInfoList.append(xl.getAuxInfo(key, userid))
    for word in result["questions"][key]:
       h = xl.getHooks(word)
#       words[word] = [h[0], h[2], "Does this work"]
       defn = unicode(xl.getDef(word), 'latin1').encode('ascii', 'xmlcharrefreplace')
       innerHooks = xl.getDots(word)
       words[word] = [ h[0], h[2], defn, innerHooks ]
    if lock:
       xl.checkOut(key, userid, True)
  result["words"] = words  
  result["aux"] = auxInfoList
  if xl.getNextAddedCount(userid) < xl.getPrefs("newWordsAtOnce", userid):
    result["getFromStudyOrder"] = True

except Exception as ex:
  error["status"] = "%s, %s" % (type(ex).__name__, ex.args)

print "Content-type: application/json\n\n"
try:
  print json.dumps([result, error], ensure_ascii=False)
except Exception as ex:
  error["status"] = "%s, %s" % (type(ex).__name__, ex.args)
  print json.dumps(error)

