#!/usr/bin/python

import xerafinLib as xl
import json, sys
import time

#userid = "10157462952395078"
params = json.load(sys.stdin)
userid = params["user"]
#numQuestions = params["numQuestions"]
numQuestions = 1
result = {"getFromStudyOrder": False }
words = { }
error = {"status": "success"}

# Gets the next question from the cardbox
# Picks a letter at random to replace with a blank
# Returns data in the same format as slothData with all valid answers
# Also returns the subanagram that was used so we can display the question

try:
  # getQuestions returns { "ALPHAGRAM": [WORD, WORD, WORD] }
  nextQuestion = xl.getQuestions(numQuestions, userid)
  nextAlphagram = nextQuestion.keys()[0] # assume there's only one question we are getting
  # these days time is so random
  now = int(time.time())
  rand = now % length(nextAlphagram)
  subAlpha = nextAlphagram[:rand] + nextAlphagram[rand+1:]
  # getBlanagramData returns a list of dicts
  # [ alpha: xxx, words: [ word, word, word], auxInfo: { ... } ]
  result["answers"] = xl.getBlanagramData(subAlpha)
  result["question"] = subAlpha

  allWords = [ word for subList in [ x["words"] for x in result["answers"]] for word in subList]

  for word in allWords:
     h = xl.getHooks(word)
     defn = unicode(xl.getDef(word), 'latin1').encode('ascii', 'xmlcharrefreplace')
     innerHooks = xl.getDots(word)
     words[word] = [ h[0], h[2], defn, innerHooks ]

  result["words"] = words
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

