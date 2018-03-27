#!/usr/bin/python

import json, sys
import MySQLdb as mysql
import xerafinLib as xl
import xerafinSetup as xs
import datetime
import time

def getUsersByPeriod (period):
  try:
    if period in ["today", "yesterday"]:
      dateMask = {"today": "curdate()", "yesterday": "curdate() - interval 1 day"}
      command = "select count(*) from leaderboard where dateStamp = {0}".format(dateMask[period])
      con.execute(command)
    elif period == "eternity":
      command = "select count(distinct userid) from leaderboard"
      con.execute(command)
    elif period == "sevenDays":
      command = "select count(distinct userid) from leaderboard where dateStamp >= curdate() - interval 7 day"
      con.execute(command)
    else:
      dateMask = {"thisWeek": "%Y%u", "lastWeek": "%Y%u", "thisMonth": "%Y%m", "thisYear": "%Y"}
      if period == "lastWeek":
        datePeriod = "curdate() - interval 7 day"
      else:
        datePeriod = "curdate()"
      command = "select count(distinct userid) from leaderboard where DATE_FORMAT(dateStamp, %s) = DATE_FORMAT({0}, %s)".format(datePeriod)
      con.execute(command, (dateMask[period], dateMask[period]))
    return con.fetchone()[0] 
  except:
    return 0

try:
  params = json.load(sys.stdin)
except:
  params = { }

try:
  me = params["userid"]
except:
  me = "0"

try: 
  getLeaderboard = params["leaderboard"]
except:
  getLeaderboard = False

try:
  timeframe = params["timeframe"]
except:
  timeframe = "all"

try:
  getGlobal = params["globe"]
except:
  getGlobal = False

try:
  getSiteRecords = params["siterecords"]
except:
  getSiteRecords = False

try: 
  getUserRecords = (params["userrecords"] and me != "0")
except:
  getUserRecords = False 

try:
  getUserRank = (params["userrank"] and me != "0")
except:
  getUserRank = False

try:
  getUserTotals = (params["usertotals"] and me != "0")
except:
  getUserTotals = False

try:
  getIndivRecords = params["indivrecords"]
except:
  getIndivRecords = False

result = { }
error = { }

if getLeaderboard:
  leaderboard = { } 
  leaderboard["myRank"] = { }
  leaderboard["users"] = { }

  try:
    with xs.getMysqlCon() as con:

  #### 
  #### TODAY
  ####
      if timeframe in ["today", "all"]:
        leaderboard["users"]["today"] = getUsersByPeriod("today")
        leaderboard["today"] = [ ]
        command = "select name, photo, questionsAnswered, userid from leaderboard join login using (userid) where dateStamp = curdate() order by questionsAnswered desc limit 10"
        con.execute(command)
        meTopTen = False
        i = 1
        for row in con.fetchall():
          if row[3] == me:
            meTopTen = True
            leaderboard["myRank"]["today"] = i
          leaderboard["today"].append({"name": row[0], "photo": row[1], "answered": row[2]})
          i = i + 1
        if not meTopTen:
          command = "select name, photo, questionsAnswered from leaderboard join login using (userid) where dateStamp = curdate() and userid = %s"
          con.execute(command, me)
          row = con.fetchone()
          if row is not None: 
            myAnswered = row[2]
            leaderboard["today"].append({"name": row[0], "photo": row[1], "answered": myAnswered })
            command = "select count(*) from leaderboard join login using (userid) where dateStamp = curdate() and questionsAnswered > %s"
            con.execute(command, myAnswered)
            row = con.fetchone()
            leaderboard["myRank"]["today"] = row[0]+1
        command = "select count(*) from leaderboard where dateStamp = curdate()"
          
  ####
  #### YESTERDAY
  ####

      if timeframe in ["yesterday", "all"]:
        leaderboard["users"]["yesterday"] = getUsersByPeriod("yesterday")
        leaderboard["yesterday"] = [ ]
        command = "select name, photo, questionsAnswered, userid from leaderboard join login using (userid) where dateStamp = curdate() - interval 1 day order by questionsAnswered desc limit 10"
        con.execute(command)
        meTopTen = False
        i = 1
        for row in con.fetchall():
          if row[3] == me:
            leaderboard["myRank"]["yesterday"] = i
            meTopTen = True
          leaderboard["yesterday"].append({"name": row[0], "photo": row[1], "answered": row[2]})
          i = i+1
        if not meTopTen:
          command = "select name, photo, questionsAnswered from leaderboard join login using (userid) where dateStamp = curdate() - interval 1 day and userid = %s"
          con.execute(command, me)
          row = con.fetchone()
          if row is not None: 
            myAnswered = row[2]
            leaderboard["yesterday"].append({"name": row[0], "photo": row[1], "answered": myAnswered })
            command = "select count(*) from leaderboard join login using (userid) where dateStamp = curdate() - interval 1 day and questionsAnswered > %s"
            con.execute(command, myAnswered)
            row = con.fetchone()
            leaderboard["myRank"]["yesterday"] = row[0]+1
         
  ####
  #### LAST SEVEN DAYS
  ####
      if timeframe in ["sevenDays", "all"]:
        leaderboard["users"]["sevenDays"] = getUsersByPeriod("sevenDays")
        leaderboard["sevenDays"] = [ ] 
        command = "select name, photo, sum(questionsAnswered), userid from leaderboard join login using (userid) where dateStamp >= curdate() - interval 7 day group by name, photo, userid order by sum(questionsAnswered) desc limit 10"
        con.execute(command)
        meTopTen = False
        i = 1
        for row in con.fetchall():
          if row[3] == me:
            leaderboard["myRank"]["sevenDays"] = i
            meTopTen = True
          leaderboard["sevenDays"].append({"name": row[0], "photo": row[1], "answered": int(row[2])})
          i = i + 1
        if not meTopTen:
          command = "select name, photo, sum(questionsAnswered) from leaderboard join login using (userid) where dateStamp >= curdate() - interval 7 day and userid = %s group by name, photo"
          con.execute(command, me)
          row = con.fetchone()
          if row is not None: 
            myAnswered = int(row[2])
            leaderboard["sevenDays"].append({"name": row[0], "photo": row[1], "answered": myAnswered })
            command = "select userid from leaderboard where dateStamp >= curdate() - interval 7 day group by userid having sum(questionsAnswered) > %s"
            con.execute(command, myAnswered)
            leaderboard["myRank"]["sevenDays"] = con.rowcount+1
   ### This (current) week
      if timeframe in ["thisWeek", "all"]:
        leaderboard["users"]["thisWeek"] = getUsersByPeriod("thisWeek")
        leaderboard["thisWeek"] = [ ] 
        command = "select name, photo, sum(questionsAnswered), userid from leaderboard join login using (userid) where DATE_FORMAT(dateStamp, '%Y%u') = DATE_FORMAT(curdate(), '%Y%u') group by name, photo, userid order by sum(questionsAnswered) desc limit 10"
        con.execute(command)
        meTopTen = False
        i = 1
        for row in con.fetchall():
          if row[3] == me:
            leaderboard["myRank"]["thisWeek"] = i
            meTopTen = True
          leaderboard["thisWeek"].append({"name": row[0], "photo": row[1], "answered": int(row[2])})
          i = i + 1
        if not meTopTen:
          command = "select name, photo, sum(questionsAnswered) from leaderboard join login using (userid) where DATE_FORMAT(dateStamp, '%%Y%%u') = DATE_FORMAT(curdate(), '%%Y%%u') and userid = %s group by name, photo"
          con.execute(command, me)
          row = con.fetchone()
          if row is not None: 
            myAnswered = int(row[2])
            leaderboard["thisWeek"].append({"name": row[0], "photo": row[1], "answered": myAnswered })
            command = "select userid from leaderboard where DATE_FORMAT(dateStamp, '%%Y%%u') = DATE_FORMAT(curdate(), '%%Y%%u') group by userid having sum(questionsAnswered) > %s"
            con.execute(command, myAnswered)
            leaderboard["myRank"]["thisWeek"] = con.rowcount+1
        
   ### Last week
      if timeframe in ["lastWeek", "all"]:
        leaderboard["users"]["lastWeek"] = getUsersByPeriod("lastWeek")
        leaderboard["lastWeek"] = [ ] 
        command = "select name, photo, sum(questionsAnswered), userid from leaderboard join login using (userid) where DATE_FORMAT(dateStamp, '%Y%u') = DATE_FORMAT(curdate() - interval 7 day, '%Y%u') group by name, photo, userid order by sum(questionsAnswered) desc limit 10"
        con.execute(command)
        meTopTen = False
        i = 1
        for row in con.fetchall():
          if row[3] == me:
            leaderboard["myRank"]["lastWeek"] = i
            meTopTen = True
          leaderboard["lastWeek"].append({"name": row[0], "photo": row[1], "answered": int(row[2])})
          i = i + 1
        if not meTopTen:
          command = "select name, photo, sum(questionsAnswered) from leaderboard join login using (userid) where DATE_FORMAT(dateStamp, '%%Y%%u') = DATE_FORMAT(curdate() - interval 7 day, '%%Y%%u') and userid = %s group by name, photo"
          con.execute(command, me)
          row = con.fetchone()
          if row is not None: 
            myAnswered = int(row[2])
            leaderboard["lastWeek"].append({"name": row[0], "photo": row[1], "answered": myAnswered })
            command = "select userid from leaderboard where DATE_FORMAT(dateStamp, '%%Y%%u') = DATE_FORMAT(curdate() - interval 7 day, '%%Y%%u') group by userid having sum(questionsAnswered) > %s"
            con.execute(command, myAnswered)
            leaderboard["myRank"]["lastWeek"] = con.rowcount+1
        
      # This Month
      if timeframe in ["thisMonth", "all"]:
        leaderboard["users"]["thisMonth"] = getUsersByPeriod("thisMonth")
        leaderboard["thisMonth"] = [ ] 
        command = "select name, photo, sum(questionsAnswered), userid from leaderboard join login using (userid) where DATE_FORMAT(dateStamp, '%Y%m') = DATE_FORMAT(curdate(), '%Y%m') group by name, photo, userid order by sum(questionsAnswered) desc limit 10"
        con.execute(command)
        meTopTen = False
        i = 1
        for row in con.fetchall():
          if row[3] == me:
            leaderboard["myRank"]["thisMonth"] = i
            meTopTen = True
          leaderboard["thisMonth"].append({"name": row[0], "photo": row[1], "answered": int(row[2])})
          i = i + 1
        if not meTopTen:
          command = "select name, photo, sum(questionsAnswered) from leaderboard join login using (userid) where DATE_FORMAT(dateStamp, '%%Y%%m') = DATE_FORMAT(curdate(), '%%Y%%m') and userid = %s group by name, photo"
          con.execute(command, me)
          row = con.fetchone()
          if row is not None: 
            myAnswered = int(row[2])
            leaderboard["thisMonth"].append({"name": row[0], "photo": row[1], "answered": myAnswered })
            command = "select userid from leaderboard where DATE_FORMAT(dateStamp, '%%Y%%m') = DATE_FORMAT(curdate(), '%%Y%%m') group by userid having sum(questionsAnswered) > %s"
            con.execute(command, myAnswered)
            leaderboard["myRank"]["thisMonth"] = con.rowcount+1
        
      # This Year
      if timeframe in ["thisYear", "all"]:
        leaderboard["users"]["thisYear"] = getUsersByPeriod("thisYear")
        leaderboard["thisYear"] = [ ] 
        command = "select name, photo, sum(questionsAnswered), userid from leaderboard join login using (userid) where DATE_FORMAT(dateStamp, '%Y') = DATE_FORMAT(curdate(), '%Y') group by name, photo, userid order by sum(questionsAnswered) desc limit 10"
        con.execute(command)
        meTopTen = False
        i = 1
        for row in con.fetchall():
          if row[3] == me:
            leaderboard["myRank"]["thisYear"] = i
            meTopTen = True
          leaderboard["thisYear"].append({"name": row[0], "photo": row[1], "answered": int(row[2])})
          i = i + 1
        if not meTopTen:
          command = "select name, photo, sum(questionsAnswered) from leaderboard join login using (userid) where DATE_FORMAT(dateStamp, '%%Y') = DATE_FORMAT(curdate(), '%%Y') and userid = %s group by name, photo"
          con.execute(command, me)
          row = con.fetchone()
          if row is not None: 
            myAnswered = int(row[2])
            leaderboard["thisYear"].append({"name": row[0], "photo": row[1], "answered": myAnswered })
            command = "select userid from leaderboard where DATE_FORMAT(dateStamp, '%%Y') = DATE_FORMAT(curdate(), '%%Y') group by userid having sum(questionsAnswered) > %s"
            con.execute(command, myAnswered)
            leaderboard["myRank"]["thisYear"] = con.rowcount+1

  except Exception as ex: 
    template = "Leaderboard: An exception of type {0} occured. Arguments:\n{1!r}"
    message = template.format(type(ex).__name__, ex.args)
    error["status"] = message

  result["leaderboard"] = leaderboard

if getGlobal:
  globe = {"questions": { }, "users": { } }
  try:
    with xs.getMysqlCon() as con:
  #     Today's sitewide totals
      command = "select sum(questionsAnswered), count(distinct userid) from leaderboard where dateStamp = curdate()"
      con.execute(command)
      row = con.fetchone()
      if row is not None:
        todayQuestions = int(row[0])
        todayUsers = row[1]
      else:
        todayQuestions = 0
        todayUsers = 0
      globe["questions"]["today"] = todayQuestions
      globe["users"]["today"] = todayUsers
      
  #     at EOD, the summary isn't populated with previous day's total immediately
  #     yesterday's sitewide totals
      command = "select sum(questionsAnswered), count(distinct userid) from leaderboard where dateStamp = curdate() - interval 1 day"
      con.execute(command)
      row = con.fetchone()
      if row is not None:
        yesterdayQuestions = int(row[0])
        yesterdayUsers = row[1]
      else:
        yesterdayQuestions = 0
        yesterdayUsers = 0
      globe["questions"]["yesterday"] = yesterdayQuestions
      globe["users"]["yesterday"] = yesterdayUsers

      # Weekly totals

      if time.strftime("%A") == "Monday":
        thisWeekQuestions = todayQuestions
      elif time.strftime("%A") == "Tuesday":
        thisWeekQuestions = todayQuestions + yesterdayQuestions
      else:
        command = "select sum(questionsAnswered) from lb_summary where period = 'DAY' and dateStamp < curdate() - interval 1 day and DATE_FORMAT(dateStamp, '%Y%u') = DATE_FORMAT(curdate(), '%Y%u')"
        con.execute(command)
        row = con.fetchone()
        if row is not None:
          thisWeekQuestions = int(row[0]) + yesterdayQuestions + todayQuestions
        else:
          thisWeekQuestions = yesterdayQuestions + todayQuestions
      globe["questions"]["thisWeek"] = thisWeekQuestions
      globe["users"]["thisWeek"] = getUsersByPeriod("thisWeek")
      
      # Monthly totals
      
      if time.strftime("%d") == "01":
        thisMonthQuestions = todayQuestions
      elif time.strftime("%d") == "02":
        thisMonthQuestions = todayQuestions + yesterdayQuestions
      else:
        command = "select sum(questionsAnswered) from lb_summary where period = 'DAY' and dateStamp < curdate() - interval 1 day and DATE_FORMAT(dateStamp, '%Y%m') = DATE_FORMAT(curdate(), '%Y%m')"
        con.execute(command)
        row = con.fetchone()
        if row is not None:
          thisMonthQuestions = int(row[0]) + yesterdayQuestions + todayQuestions
        else:
          thisMonthQuestions = yesterdayQuestions + todayQuestions
      globe["questions"]["thisMonth"] = thisMonthQuestions
      globe["users"]["thisMonth"] = getUsersByPeriod("thisMonth")

      # Annual totals

      if time.strftime("%m") == "01":
        thisYearQuestions = thisMonthQuestions
        thisYearUsers = thisMonthUsers
      else:
        command = "select sum(questionsAnswered) from lb_summary where period = 'MONTH' and DATE_FORMAT(dateStamp, '%Y') = DATE_FORMAT(curdate(), '%Y')"
        con.execute(command)
        row = con.fetchone()
        if row is not None:
          thisYearQuestions = int(row[0]) + thisMonthQuestions
        else:
          thisYearQuestions = thisMonthQuestions

      globe["questions"]["thisYear"] = thisYearQuestions
      globe["users"]["thisYear"] = getUsersByPeriod("thisYear")

      # Eternity totals

      command = "select sum(questionsAnswered) from lb_summary where period = 'YEAR'"
      con.execute(command)
      row = con.fetchone()
      if row is not None:
        eternityQuestions = int(row[0]) + thisYearQuestions
      else:
        eternityQuestions = thisYearQuestions

      globe["questions"]["eternity"] = eternityQuestions
      globe["users"]["eternity"] = getUsersByPeriod("eternity")

  except Exception as ex: 
    template = "Globe: An exception of type {0} occured. Arguments:\n{1!r}"
    message = template.format(type(ex).__name__, ex.args)
    error["status"] = message

  result["globe"] = globe

if getSiteRecords:
  siterecords = {"maxUsers": { }, "maxQuestions": { } }
  try:
    with xs.getMysqlCon() as con:
      for period in ['DAY', 'WEEK', 'MONTH', 'YEAR']:
        command = "select dateStamp, questionsAnswered from lb_summary where period = %s order by questionsAnswered desc, dateStamp desc limit 1"
        con.execute(command, period)
        row = con.fetchone()
        siterecords["maxQuestions"][period.lower()] = {"date": str(row[0]), "questions": row[1]}
         
        command = "select dateStamp, numUsers from lb_summary where period = %s order by numUsers desc, dateStamp desc limit 1"
        con.execute(command, period)
        row = con.fetchone()
        siterecords["maxUsers"][period.lower()] = {"date": str(row[0]), "users": row[1]}

      command = "select dateStamp, questionsAnswered from lb_summary where DATE_FORMAT(dateStamp, '%a') = DATE_FORMAT(curdate(), '%a') and period = 'DAY' order by questionsAnswered desc, dateStamp desc limit 1"
      con.execute(command)
      row = con.fetchone()
      if row is not None:
        siterecords["maxQuestions"]["weekday"] = {"date": str(row[0]), "questions": row[1]}
        
      command = "select dateStamp, numUsers from lb_summary where DATE_FORMAT(dateStamp, '%a') = DATE_FORMAT(curdate(), '%a') and period = 'DAY' order by numUsers desc, dateStamp desc limit 1"
      con.execute(command)
      row = con.fetchone()
      if row is not None:
        siterecords["maxUsers"]["weekday"] = {"date": str(row[0]), "users": row[1]}


      # format dates
      for d in ["maxQuestions", "maxUsers"]:
        for e in [("year", "%Y"), ("month", "%b %Y"), ("week", "%d %b %Y"), ("day", "%d %b %Y"), ("weekday", "%d %b %Y")]:
          dt = datetime.datetime.strptime(siterecords[d][e[0]]["date"], "%Y-%m-%d").date()
          siterecords[d][e[0]]["date"] = dt.strftime(e[1])
          if e[0] == "week":
            week = datetime.timedelta(days=6)
            dt = dt + week
            siterecords[d][e[0]]["dateEnd"] = dt.strftime(e[1])
          if e[0] == "weekday":
            siterecords[d][e[0]]["weekday"] = dt.strftime("%A")

  except Exception as ex: 
    template = "Siterecords: An exception of type {0} occured. Arguments:\n{1!r}"
    message = template.format(type(ex).__name__, ex.args)
    error["status"] = message

  result["siterecords"] = siterecords

if getUserRecords:
  userrecords = { }
  try:
    with xs.getMysqlCon() as con:

      command = "select dateStamp, questionsAnswered from leaderboard where DATE_FORMAT(dateStamp, '%%a') = DATE_FORMAT(curdate(), '%%a') and userid = %s order by questionsAnswered desc, dateStamp desc limit 1"
      con.execute(command, me)
      row = con.fetchone()
      if row is not None:
        userrecords["weekday"] = {"date": str(row[0]), "questions": row[1]}

      command = "select dateStamp, questionsAnswered from leaderboard where userid = %s order by questionsAnswered desc, dateStamp desc limit 1"
      con.execute(command, me)
      row = con.fetchone()
      if row is not None:
        userrecords["day"] = {"date": str(row[0]), "questions": row[1]}

      command = "select min(dateStamp), sum(questionsAnswered) from leaderboard where userid = %s group by DATE_FORMAT(dateStamp, '%%u%%Y') order by sum(questionsAnswered) desc, min(dateStamp) desc limit 1"
      con.execute(command, me)
      row = con.fetchone()
      if row is not None:
        userrecords["week"] = {"date": str(row[0]), "questions": int(row[1])}
      
      command = "select min(dateStamp), sum(questionsAnswered) from leaderboard where userid = %s group by DATE_FORMAT(dateStamp, '%%m%%Y') order by sum(questionsAnswered) desc, min(dateStamp) desc limit 1"
      con.execute(command, me)
      row = con.fetchone()
      if row is not None:
        userrecords["month"] = {"date": str(row[0]), "questions": int(row[1])}
      
      command = "select min(dateStamp), sum(questionsAnswered) from leaderboard where userid = %s group by DATE_FORMAT(dateStamp, '%%Y') order by sum(questionsAnswered) desc, min(dateStamp) desc limit 1"
      con.execute(command, me)
      row = con.fetchone()
      if row is not None:
        userrecords["year"] = {"date": str(row[0]), "questions": int(row[1])}
      
        
      # format dates
      for e in [("year", "%Y"), ("month", "%b %Y"), ("week", "%d %b %Y"), ("day", "%d %b %Y"), ("weekday", "%d %b %Y")]:
          dt = datetime.datetime.strptime(userrecords[e[0]]["date"], "%Y-%m-%d").date()
          userrecords[e[0]]["date"] = dt.strftime(e[1])
          if e[0] == "week":
            week = datetime.timedelta(days=6)
            dt = dt + week
            userrecords[e[0]]["dateEnd"] = dt.strftime(e[1])
          if e[0] == "weekday":
            userrecords[e[0]]["weekday"] = dt.strftime("%A")

  except Exception as ex: 
    template = "Userrecords: An exception of type {0} occured. Arguments:\n{1!r}"
    message = template.format(type(ex).__name__, ex.args)
    error["status"] = message

  result["userrecords"] = userrecords

if getUserRank:
  userrank = {"myRank": { }, "users": { } }
  PLUSMINUS = 5
  
  try:
    with xs.getMysqlCon() as con:

      # TODAY
      if timeframe in ["today", "all"]:
        userrank["users"]["today"] = getUsersByPeriod("today")
        userrank["today"] = [ ]
        command = "select questionsAnswered from leaderboard where userid = %s and dateStamp = curdate()"
        con.execute(command, me)
        try:
          myAnswered = con.fetchone()[0]
        except:
          myAnswered = 0
        command = "select count(*) from leaderboard where dateStamp = curdate() and questionsAnswered > %s"
        con.execute(command, myAnswered)
        row = con.fetchone()
        userrank["myRank"]["today"] = row[0]+1
        myrank = userrank["myRank"]["today"]
  
        command = "select name, photo, questionsAnswered, userid from leaderboard join login using (userid) where dateStamp = curdate() order by questionsAnswered desc limit %s"
        con.execute(command, max(myrank+PLUSMINUS, 11))
        allResults = con.fetchall()
  
        if myrank+PLUSMINUS > len(allResults):
          rangeStart = max(0, len(allResults)-(2*PLUSMINUS)-1)
        else:
          rangeStart = max(0, myrank-PLUSMINUS-1)
        rangeEnd = min(len(allResults),max(myrank+PLUSMINUS+1,11))
  
        r = rangeStart+1
  
        for row in allResults[rangeStart:rangeEnd]:
          userrank["today"].append({"name": row[0], "photo": row[1], "answered": row[2], "rank": r})
          r = r+1

      # YESTERDAY
      if timeframe in ["yesterday", "all"]:
        userrank["users"]["yesterday"] = getUsersByPeriod("yesterday")
        userrank["yesterday"] = [ ] 
        command = "select questionsAnswered from leaderboard where userid = %s and dateStamp = curdate() - interval 1 day"
        con.execute(command, me)
        try:
          myAnswered = con.fetchone()[0]
        except:
          myAnswered = 0
        command = "select count(*) from leaderboard where dateStamp = curdate() - interval 1 day and questionsAnswered > %s"
        con.execute(command, myAnswered)
        row = con.fetchone()
        userrank["myRank"]["yesterday"] = row[0]+1
        myrank = userrank["myRank"]["yesterday"]
  
        command = "select name, photo, questionsAnswered, userid from leaderboard join login using (userid) where dateStamp = curdate() - interval 1 day order by questionsAnswered desc limit %s"
        con.execute(command, max(myrank+PLUSMINUS, 11))
        allResults = con.fetchall()
        if myrank+PLUSMINUS > len(allResults):
          rangeStart = max(0, len(allResults)-(2*PLUSMINUS)-1)
        else:
          rangeStart = max(0, myrank-PLUSMINUS-1)
        rangeEnd = min(len(allResults),max(myrank+PLUSMINUS+1,11))
        r = rangeStart+1
  
        for row in allResults[rangeStart:rangeEnd]:
          userrank["yesterday"].append({"name": row[0], "photo": row[1], "answered": row[2], "rank": r})
          r = r+1

      # LAST WEEK
      if timeframe in ["sevenDays", "all"]:
        userrank["users"]["sevenDays"] = getUsersByPeriod("sevenDays")
        userrank["sevenDays"] = [ ]
        command = "select sum(questionsAnswered) from leaderboard where userid = %s and dateStamp >= curdate() - interval 7 day"
        con.execute(command, me)
        try:
          myAnswered = int(con.fetchone()[0])
        except:
          myAnswered = 0
  
        command = "select userid from leaderboard where dateStamp >= curdate() - interval 7 day group by userid having sum(questionsAnswered) > %s"
        con.execute(command, myAnswered)
        myrank = con.rowcount+1
        userrank["myRank"]["sevenDays"] = myrank
        command = "select name, photo, sum(questionsAnswered), userid from leaderboard join login using (userid) where dateStamp >= curdate() - interval 7 day group by name, photo, userid order by sum(questionsAnswered) desc limit %s"
        con.execute(command, max(myrank+PLUSMINUS, 11))
        allResults = con.fetchall()
        if myrank+PLUSMINUS > len(allResults):
          rangeStart = max(0, len(allResults)-(2*PLUSMINUS)-1)
        else:
          rangeStart = max(0, myrank-PLUSMINUS-1)
        rangeEnd = min(len(allResults),max(myrank+PLUSMINUS+1,11))
        r = rangeStart+1
  
        for row in allResults[rangeStart:rangeEnd]:
          userrank["sevenDays"].append({"name": row[0], "photo": row[1], "answered": int(row[2]), "rank": r})
          r = r+1
      
      # THIS (CURRENT) WEEK
      if timeframe in ["thisWeek", "all"]:
        userrank["users"]["thisWeek"] = getUsersByPeriod("thisWeek")
        userrank["thisWeek"] = [ ]
        command = "select sum(questionsAnswered) from leaderboard where userid = %s and DATE_FORMAT(dateStamp, '%%Y%%u') = DATE_FORMAT(curdate(), '%%Y%%u')"
        con.execute(command, me)
        try:
          myAnswered = int(con.fetchone()[0])
        except:
          myAnswered = 0
  
        command = "select userid from leaderboard where DATE_FORMAT(dateStamp, '%%Y%%u') = DATE_FORMAT(curdate(), '%%Y%%u') group by userid having sum(questionsAnswered) > %s"
        con.execute(command, myAnswered)
        myrank = con.rowcount+1
        userrank["myRank"]["thisWeek"] = myrank
        command = "select name, photo, sum(questionsAnswered), userid from leaderboard join login using (userid) where DATE_FORMAT(dateStamp, '%%Y%%u') = DATE_FORMAT(curdate(), '%%Y%%u') group by name, photo, userid order by sum(questionsAnswered) desc limit %s"
        con.execute(command, max(myrank+PLUSMINUS, 11))
        allResults = con.fetchall()
        if myrank+PLUSMINUS > len(allResults):
          rangeStart = max(0, len(allResults)-(2*PLUSMINUS)-1)
        else:
          rangeStart = max(0, myrank-PLUSMINUS-1)
        rangeEnd = min(len(allResults),max(myrank+PLUSMINUS+1,11))
        r = rangeStart+1
  
        for row in allResults[rangeStart:rangeEnd]:
          userrank["thisWeek"].append({"name": row[0], "photo": row[1], "answered": int(row[2]), "rank": r})
          r = r+1
      
      # LAST WEEK
      if timeframe in ["lastWeek", "all"]:
        userrank["users"]["lastWeek"] = getUsersByPeriod("lastWeek")
        userrank["lastWeek"] = [ ]
        command = "select sum(questionsAnswered) from leaderboard where userid = %s and DATE_FORMAT(dateStamp, '%%Y%%u') = DATE_FORMAT(curdate() - interval 7 day, '%%Y%%u')"
        con.execute(command, me)
        try:
          myAnswered = int(con.fetchone()[0])
        except:
          myAnswered = 0
  
        command = "select userid from leaderboard where DATE_FORMAT(dateStamp, '%%Y%%u') = DATE_FORMAT(curdate() - interval 7 day, '%%Y%%u') group by userid having sum(questionsAnswered) > %s"
        con.execute(command, myAnswered)
        myrank = con.rowcount+1
        userrank["myRank"]["lastWeek"] = myrank
        command = "select name, photo, sum(questionsAnswered), userid from leaderboard join login using (userid) where DATE_FORMAT(dateStamp, '%%Y%%u') = DATE_FORMAT(curdate() - interval 7 day, '%%Y%%u') group by name, photo, userid order by sum(questionsAnswered) desc limit %s"
        con.execute(command, max(myrank+PLUSMINUS, 11))
        allResults = con.fetchall()
        if myrank+PLUSMINUS > len(allResults):
          rangeStart = max(0, len(allResults)-(2*PLUSMINUS)-1)
        else:
          rangeStart = max(0, myrank-PLUSMINUS-1)
        rangeEnd = min(len(allResults),max(myrank+PLUSMINUS+1,11))
        r = rangeStart+1
  
        for row in allResults[rangeStart:rangeEnd]:
          userrank["lastWeek"].append({"name": row[0], "photo": row[1], "answered": int(row[2]), "rank": r})
          r = r+1
      
      # THIS MONTH
      if timeframe in ["thisMonth", "all"]:
        userrank["users"]["thisMonth"] = getUsersByPeriod("thisMonth")
        userrank["thisMonth"] = [ ]
        command = "select sum(questionsAnswered) from leaderboard where userid = %s and DATE_FORMAT(dateStamp, '%%Y%%m') = DATE_FORMAT(curdate(), '%%Y%%m')"
        con.execute(command, me)
        try:
          myAnswered = int(con.fetchone()[0])
        except:
          myAnswered = 0
  
        command = "select userid from leaderboard where DATE_FORMAT(dateStamp, '%%Y%%m') = DATE_FORMAT(curdate(), '%%Y%%m') group by userid having sum(questionsAnswered) > %s"
        con.execute(command, myAnswered)
        myrank = con.rowcount+1
        userrank["myRank"]["thisMonth"] = myrank
        command = "select name, photo, sum(questionsAnswered), userid from leaderboard join login using (userid) where DATE_FORMAT(dateStamp, '%%Y%%m') = DATE_FORMAT(curdate(), '%%Y%%m') group by name, photo, userid order by sum(questionsAnswered) desc limit %s"
        con.execute(command, max(myrank+PLUSMINUS, 11))
        allResults = con.fetchall()
        if myrank+PLUSMINUS > len(allResults):
          rangeStart = max(0, len(allResults)-(2*PLUSMINUS)-1)
        else:
          rangeStart = max(0, myrank-PLUSMINUS-1)
        rangeEnd = min(len(allResults),max(myrank+PLUSMINUS+1,11))
        r = rangeStart+1
  
        for row in allResults[rangeStart:rangeEnd]:
          userrank["thisMonth"].append({"name": row[0], "photo": row[1], "answered": int(row[2]), "rank": r})
          r = r+1
      

      # THIS YEAR
      if timeframe in ["thisYear", "all"]:
        userrank["users"]["thisYear"] = getUsersByPeriod("thisYear")
        userrank["thisYear"] = [ ]
        command = "select sum(questionsAnswered) from leaderboard where userid = %s and DATE_FORMAT(dateStamp, '%%Y') = DATE_FORMAT(curdate(), '%%Y')"
        con.execute(command, me)
        try:
          myAnswered = int(con.fetchone()[0])
        except:
          myAnswered = 0
  
        command = "select userid from leaderboard where DATE_FORMAT(dateStamp, '%%Y') = DATE_FORMAT(curdate(), '%%Y') group by userid having sum(questionsAnswered) > %s"
        con.execute(command, myAnswered)
        myrank = con.rowcount+1
        userrank["myRank"]["thisYear"] = myrank
        command = "select name, photo, sum(questionsAnswered), userid from leaderboard join login using (userid) where DATE_FORMAT(dateStamp, '%%Y') = DATE_FORMAT(curdate(), '%%Y') group by name, photo, userid order by sum(questionsAnswered) desc limit %s"
        con.execute(command, max(myrank+PLUSMINUS, 11))
        allResults = con.fetchall()
        if myrank+PLUSMINUS > len(allResults):
          rangeStart = max(0, len(allResults)-(2*PLUSMINUS)-1)
        else:
          rangeStart = max(0, myrank-PLUSMINUS-1)
        rangeEnd = min(len(allResults),max(myrank+PLUSMINUS+1,11))
        r = rangeStart+1
  
        for row in allResults[rangeStart:rangeEnd]:
          userrank["thisYear"].append({"name": row[0], "photo": row[1], "answered": int(row[2]), "rank": r})
          r = r+1
      

  except Exception as ex: 
    template = "Userrank: An exception of type {0} occured. Arguments:\n{1!r}"
    message = template.format(type(ex).__name__, ex.args)
    error["status"] = message

  result["userrank"] = userrank

if getUserTotals:
  usertotals = { }
  
  try:
    with xs.getMysqlCon() as con:
    
      # Today
      command = "select questionsAnswered from leaderboard where dateStamp = curdate() and userid = %s"
      con.execute(command, me)
      row = con.fetchone()
      if row is not None:
        todayQuestions = row[0]
      else:
        todayQuestions = 0
      
      # Yesterday
      command = "select questionsAnswered from leaderboard where dateStamp = curdate() - interval 1 day and userid = %s"
      con.execute(command, me)
      row = con.fetchone()
      if row is not None:
        yesterdayQuestions = row[0]
      else:
        yesterdayQuestions = 0
 
      # This week

      if time.strftime("%A") == "Monday":
        thisWeekQuestions = todayQuestions
      elif time.strftime("%A") == "Tuesday":
        thisWeekQuestions = todayQuestions + yesterdayQuestions
      else:
        command = "select sum(questionsAnswered) from leaderboard where DATE_FORMAT(dateStamp, '%%Y%%u') = DATE_FORMAT(curdate(), '%%Y%%u') and userid = %s"
        con.execute(command, me)
        row = con.fetchone()
        if row is not None:
          thisWeekQuestions = int(row[0])
        else:
          thisWeekQuestions = 0
      
      # This month
      if time.strftime("%d") == "01":
        thisMonthQuestions = todayQuestions
      elif time.strftime("%d") == "02":
        thisMonthQuestions = todayQuestions + yesterdayQuestions
      else:
        command = "select sum(questionsAnswered) from leaderboard where DATE_FORMAT(dateStamp, '%%Y%%m') = DATE_FORMAT(curdate(), '%%Y%%m') and userid = %s"
        con.execute(command, me)
        row = con.fetchone()
        if row is not None:
          thisMonthQuestions = int(row[0])
        else:
          thisMonthQuestions = 0

      if time.strftime("%m") == "01":
        thisYearQuestions = thisMonthQuestions
      else:
        command = "select sum(questionsAnswered) from leaderboard where DATE_FORMAT(dateStamp, '%%Y') = DATE_FORMAT(curdate(), '%%Y') and userid = %s"
        con.execute(command, me)
        row = con.fetchone()
        if row is not None:
          thisYearQuestions = int(row[0])
        else:
          thisYearQuestions = 0

      command = "select  sum(questionsAnswered) from leaderboard where userid = %s"
      con.execute(command, me)
      row = con.fetchone()
      if row is not None:
        eternityQuestions = int(row[0])
      else:
        eternityQuestions = 0

    usertotals["questions"] = {"today": todayQuestions, "yesterday": yesterdayQuestions, "thisWeek": thisWeekQuestions, "thisMonth": thisMonthQuestions, "thisYear": thisYearQuestions, "eternity": eternityQuestions}
  
  except Exception as ex: 
    template = "Usertotals: An exception of type {0} occured. Arguments:\n{1!r}"
    message = template.format(type(ex).__name__, ex.args)
    error["status"] = message

  result["usertotals"] = usertotals


if getIndivRecords:
  indivrecords = { }

  try:
    with xs.getMysqlCon() as con:
      for x in ["day", "weekday"]:
        if x == "day":
          command = "select name, photo, questionsAnswered, dateStamp from leaderboard join login using (userid) order by questionsAnswered desc limit 1"
        elif x == "weekday":
          command = "select name, photo, questionsAnswered, dateStamp from leaderboard join login using (userid) where DATE_FORMAT(dateStamp, '%a') = DATE_FORMAT(curdate(), '%a') order by questionsAnswered desc limit 1"
        else:
          pass #shouldn't happen
        con.execute(command)
        row = con.fetchone()
        indivrecords[x]= {"name": row[0], "photo": row[1], "answered": row[2], "date": str(row[3])}

      for x in ["week", "month", "year", "eternity"]:
        if x == "eternity":
          command = "select name, photo, sum(questionsAnswered), null from leaderboard join login using (userid) group by name, photo, userid order by sum(questionsAnswered) desc limit 1"
          con.execute(command)
        else:
          if x == "week":
            datemask = "%Y%u"
          elif x == "month":
            datemask = "%Y%m"
          elif x == "year":
            datemask = "%Y"
          else:
            pass # shouldn't happen
          command = "select name, photo, sum(questionsAnswered), min(dateStamp) from leaderboard join login using (userid) group by name, photo, userid, DATE_FORMAT(dateStamp, %s) order by sum(questionsAnswered) desc limit 1"
          con.execute(command, datemask)

        row = con.fetchone()
        indivrecords[x]= {"name": row[0], "photo": row[1], "answered": int(row[2]), "date": str(row[3])}

      for e in [("year", "%Y"), ("month", "%b %Y"), ("week", "%d %b %Y"), ("day", "%d %b %Y"), ("weekday", "%d %b %Y")]:
        dt = datetime.datetime.strptime(indivrecords[e[0]]["date"], "%Y-%m-%d").date()
        indivrecords[e[0]]["date"] = dt.strftime(e[1])
        if e[0] == "week":
          week = datetime.timedelta(days=6)
          dt = dt + week
          indivrecords[e[0]]["dateEnd"] = dt.strftime(e[1])
        if e[0] == "weekday":
          indivrecords[e[0]]["weekday"] = dt.strftime("%A")

  except Exception as ex: 
    template = "Indiv Records: An exception of type {0} occured. Arguments:\n{1!r}"
    message = template.format(type(ex).__name__, ex.args)
    error["status"] = message

  result["indivrecords"] = indivrecords

print "Content-type: application/json\n\n"
print json.dumps([result, error])

