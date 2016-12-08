function initUserPrefs() {

 // ajax call to get user prefs
 d = { userid: userid };
 $.ajax({type: "POST", 
         url: "getUserPrefs.py",
         data: JSON.stringify(d),
         success: showUserPrefs,
         error: function(jqXHR, textStatus, errorThrown) {
           console.log("Error retrieving user prefs. Status: " + textStatus + "  Error: " + errorThrown); }
});

}

function showUserPrefs(response, responseStatus) {

  // get response from ajax call
  // need prefs and currently occupied cardboxes
  console.log("Prefs");
  console.log(response[0]);
  prefs = response[0]
  var prefForm = "<h3>User Preferences</h3>";
  prefForm += "<p>Xerafin will give you words that are due in order from cardbox 0 ";
  prefForm += "through cardbox <select id='closetInput'>"
  for (var x=6;x<20;x++) {
    prefForm += "<option value='"+ x + "'";
    if (x == parseInt(prefs.closet))
      prefForm += " selected";
    prefForm += ">"+ x +"</option>"; }
  prefForm += "</select>.<br><br>"
       nextCloset = prefs.closet + 1;
  prefForm += "Then it will give you words scheduled in the near future. For each hour you work ahead, it will give you 10 words which are overdue in cardbox <span id=closetValue>" + nextCloset + "</span> or higher.<br><br>";
  prefForm += "After <input type=text id='reschedHrsInput' maxlength=3 value='"+prefs.reschedHrs+"'></input> hours,"
  prefForm += " it will add <input type=text id='newWordsAtOnceInput' maxlength=3 value='"+prefs.newWordsAtOnce+"'></input>";
  prefForm += " words for each additional hour you work ahead, as long as Cardbox 0 has fewer than <input type=text id='cb0maxInput' maxlength=3 value='"+prefs.cb0max+"'> cards in it."
  $( "#gameArea" ).html(prefForm);

  }

function setPrefs() {

}

