function initUserPrefs() {

 // ajax call to get user prefs
 var d = { userid: userid };
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
  var prefs = response[0]
  $( "#gameArea" ).html("");
  var p1 = document.createElement("h3");
      p1.innerHTML = "User Preferences";
  var p2 = document.createElement("p");
  var s21 = document.createElement("span");
      s21.innerHTML = "Xerafin will give you words that are due in order from cardbox 0 through cardbox ";
  var i1 = document.createElement("select");
      i1.id = "closetInput";
      i1.setAttribute("onchange", "prefsChangeCloset(this.value)");
      for (var x=4;x<21;x++) {
        var o = document.createElement("option");
        o.text = x.toString();
        o.value = x;
        i1.add(o);
        if (x == parseInt(prefs.closet))
          i1.selectedIndex = x-4;
      }      
  p2.appendChild(s21);
  p2.appendChild(i1);
  var p3 = document.createElement("p");
  var s31 = document.createElement("span");
      s31.innerHTML = " Then it will give you words scheduled in the near future. For each hour you work ahead, it will give you 10 words which are overdue in cardbox ";
  var s32 = document.createElement("span");
      s32.id = "closetValue";
      s32.innerHTML = parseInt(prefs.closet) + 1;
  var s33 = document.createElement("span");
      s33.innerHTML = " or higher.";   
  p3.appendChild(s31);
  p3.appendChild(s32);
  p3.appendChild(s33);
  
  var p4 = document.createElement("p");
  var s41 = document.createElement("span");
      s41.innerHTML = "After ";
  var i41 = document.createElement("input");
      i41.id = "reschedHrsInput";
      i41.setAttribute("type", "text");
      i41.maxlength = 3;
      i41.size = 3;
      i41.value = prefs.reschedHrs;
  var s42 = document.createElement("span");
      s42.innerHTML = " hours, it will add ";
  var i42 = document.createElement("input");
      i42.id = "newWordsAtOnceInput";
      i42.setAttribute("type", "text");
      i42.maxlength = 3;
      i42.size = 3;
      i42.value = prefs.newWordsAtOnce;
  var s43 = document.createElement("span");
      s43.innerHTML = " words for each additional hour you work ahead, as long as cardbox 0 has fewer than ";
  var i43 = document.createElement("input");
      i43.id = "cb0maxInput";
      i43.setAttribute("type", "text");
      i43.maxlength = 4;
      i43.size = 4;
      i43.value = prefs.cb0max;
  var s44 = document.createElement("span");
      s44.innerHTML = " questions in it.";
  p4.appendChild(s41);
  p4.appendChild(i41);
  p4.appendChild(s42);
  p4.appendChild(i42);
  p4.appendChild(s43);
  p4.appendChild(i43);
  p4.appendChild(s44);

  var p6 = document.createElement("p");
  var s61 = document.createElement ("span");
  s61.innerHTML = "All quiz alphagrams will be arranged ";
  var i6 = document.createElement("select");
  
  var i6Options = ['Alphabetically','Vowels First','Consonants First', 'Randomly'];
      i6.id = "alphaSortInput";
      for (var x=0;x<i6Options.length;x++) {
        var op = document.createElement("option");
        op.text = i6Options[x];
        op.value = x;
        i6.add(op);
      }      
      i6.value = Number(localStorage.gAlphaSortInput);
      i6.onchange = function () {localStorage.gAlphaSortInput = i6.value;}
  p6.appendChild(s61);
  p6.appendChild(i6);
  
  var p7 = document.createElement("p");
  var s71 = document.createElement ("span");
  s71.innerHTML = "Alphagrams are to be displayed as ";

  var i7 = document.createElement("select");
  var i7Options = ['Tiles','Capital Letters'];
      i7.id = "alphaSortInput";
      for (var x=0;x<i7Options.length;x++) {
        var op = document.createElement("option");
        op.text = i7Options[x];
        op.value = x;
        i7.add(op);
      }      
      i7.value = Number(localStorage.gAlphaDisplay);
      i7.onchange = function () {localStorage.gAlphaDisplay = i7.value;}
  p7.appendChild(s71);
  p7.appendChild(i7);
 
  var p8 = document.createElement("p");
  var s81 = document.createElement ("span");
  s81.innerHTML = "In Sloth, quiz on ";

  var i8 = document.createElement("select");
  var i8Options = ['All Subanagrams' ,'Some Subanagrams'];
      i8.id = "slothSetup";
      for (var x=0;x<i8Options.length;x++) {
        var op = document.createElement("option");
        op.text = i8Options[x];
        op.value = x;
        i8.add(op);
      }      
      i8.value = Number(localStorage.gSlothPref);
      i8.onchange = function () {localStorage.gSlothPref = i8.value;}
  p8.appendChild(s81);
  p8.appendChild(i8);
 
  i5 = document.createElement("button");
  i5.innerHTML = "Save";
  i5.setAttribute("onclick", "setPrefs()");
  document.getElementById('gameArea').appendChild(p1);
  document.getElementById('gameArea').appendChild(p2);
  document.getElementById('gameArea').appendChild(document.createElement("br"));
  document.getElementById('gameArea').appendChild(p3);
  document.getElementById('gameArea').appendChild(document.createElement("br"));
  document.getElementById('gameArea').appendChild(p4);
  document.getElementById('gameArea').appendChild(document.createElement("br"));
  document.getElementById('gameArea').appendChild(p6);
  document.getElementById('gameArea').appendChild(p7);
  document.getElementById('gameArea').appendChild(p8);
  document.getElementById('gameArea').appendChild(document.createElement("br"));
  document.getElementById('gameArea').appendChild(i5);
  }

function setPrefs() {
var d = {user: userid, newWordsAtOnce: $('#newWordsAtOnceInput').val(),
         reschedHrs: $('#reschedHrsInput').val(),
         cb0max: $('#cb0maxInput').val(), closet: $('#closetInput').val()};
console.log(d);
 $.ajax({type: "POST", 
         url: "setUserPrefs.py",
         data: JSON.stringify(d),
         success: function(response) {
            if (response.status == "success") {initUserPrefs();}
            else alert("Error setting user prefs: " + response.status);},
         error: function(jqXHR, textStatus, errorThrown) {
           console.log("Error setting user prefs. Status: " + textStatus + "  Error: " + errorThrown); 
           alert("Error setting user prefs: " + errorThrown);
                   }
});



}

function prefsChangeCloset(c) {
 $('#closetValue').html(parseInt(c)+1);
}
