function initSloth(question) {

//  console.log("initSloth " + question);
if (typeof slothTimer !== 'undefined' && slothTimer !== null)
  clearInterval(slothTimer);
if (typeof question !== 'undefined') {
  slothQuestion = question;
  initSloth2(); }
else {
  d = { user: userid };
  $.ajax({type: "POST",
         data: JSON.stringify(d),
         url: "getNextBingo.py",
         success: populateSlothQuestion,
	 error: function(jqXHR, textStatus, errorThrown) {
	      console.log("Error getting bingo, status = " + textStatus + " error: " + errorThrown); 
              }} );

   } }

function populateSlothQuestion(response, responseStatus) {
//  console.log(response);
  slothQuestion = response[0].alpha;
  initSloth2();
 }
 
function initSloth2() { 

  console.log("Starting Sloth for " + slothQuestion);
  var gameArea = document.getElementById("gameArea");
  $('#gameArea').empty();

  var alphagramLabel = document.createElement("H1");
  alphagramLabel.id = "slothAlphagram";
  alphagramLabel.style.width = "100%";
  alphagramLabel.style.textAlign = "center";

  var startButton = document.createElement("button");
  startButton.id = "startButton";
  startButton.innerHTML = "Start";
  startButton.style.margin = "0 auto";
  startButton.style.padding = "5px";
  startButton.style.display = "none";

  var timerLabel = document.createElement("div");
  timerLabel.id = "timerLabel";
  timerLabel.style.width = "100%";
  timerLabel.style.textAlign = "center";

  var timerText = document.createElement("h4");
  timerText.id = "timerText";
  timerText.style.display = "none";

  timerLabel.appendChild(startButton);
  timerLabel.appendChild(timerText);

  var progressBar = document.createElement("div");
  var progressDone = document.createElement("div");
  var progressLabel = document.createElement("div");
  progressBar.style.position = "relative";
  progressBar.style.width = "100%";
  progressBar.style.height = "30px";
  progressBar.style.backgroundColor = "lightgray";
  progressBar.style.margin = "5px";
  progressDone.style.position = "absolute";
  progressDone.style.width = "0%";
  progressDone.style.height = "100%";
  progressDone.style.backgroundColor = "green";
  progressDone.id = "progressDone";
  progressBar.appendChild(progressLabel);
  progressBar.appendChild(progressDone);
  progressBar.style.fontWeight = 'bold';
  progressBar.style.textAlign = 'center';
  progressLabel.id = 'progressLabel';
  progressLabel.innerHTML = '0%';
  progressLabel.style.width = '100%';
  progressLabel.style.position = 'absolute';
  progressBar.style.zIndex = "0";
  progressDone.style.zIndex = "1";
  progressLabel.style.zIndex = "2";

  var answerBox = document.createElement("input");
  answerBox.type = "text";
  answerBox.id = "answerBox";
  answerBox.style.display = "block";
  answerBox.style.width = "60%"
  answerBox.style.margin = "auto";
  answerBox.disabled = true;
  answerBox.addEventListener("keypress", function(e) {
	if (e.which === 13) { submitSlothAnswer(); }  });

  var answerField = document.createElement("table");
  var answerFieldBody = document.createElement("tbody");
  answerField.appendChild(answerFieldBody);
  answerFieldBody.id = "answerField";
  answerField.style.width = "100%";
		
  gameArea.appendChild(alphagramLabel);
  gameArea.appendChild(timerLabel);
  gameArea.appendChild(progressBar);
  gameArea.appendChild(answerBox);
  gameArea.appendChild(answerField);
  $('#startButton').on("click", startSloth);

  var d = { user: userid, alpha: slothQuestion };
  $.ajax({type: "POST",
         data: JSON.stringify(d),
         url: "getSlothData.py",
         success: setupSloth,
	 error: function(jqXHR, textStatus, errorThrown) {
	      console.log("Error, status = " + textStatus + " error: " + errorThrown); 
              }} );
}

function setupSloth (response, responseStatus) {
//  console.log(response)
//  console.log("setup sloth");
  document.getElementById("startButton").style.display = "block";
  slothData = response[0];
  console.log("Sloth Data");
  console.log(slothData);
var  tmpWordlist = [ ];
  for (var x=0;x<slothData.length;x++)
    for (var y=0;y<slothData[x].words.length;y++)
      tmpWordlist.push(slothData[x].words[y])
  
 var wordlist = tmpWordlist.sort(function f (a,b) {
    return a.length < b.length || (a.length == b.length && a < b) ? -1 : a.length > b.length || (a.length == b.length && a > b) ? 1 : 0  });
  var NUMROWS = 6;
  totalScore = 0;
  slothScore = 0;
  slothTimerCount = Math.max(180, wordlist.length*3);
  var tableRows = Math.ceil(wordlist.length / NUMROWS);
  var answerField = document.getElementById("answerField");
  for (var x=0;x<tableRows;x++) {
    var tr = document.createElement('tr');
    answerField.appendChild(tr);
    var idx = x;
    for (var i=0;i<NUMROWS;i++) 
      if (idx < wordlist.length) {
        var td = document.createElement('td');
        td.className = "slothTD";
        td.style.border = 'solid 1px';
        tr.appendChild(td);
        var span = document.createElement('span');
        td.appendChild(span);
        span.style.visibility = "hidden";
        span.style.fontWeight = 'bold';
        span.id = wordlist[idx];
        span.innerHTML = wordlist[idx];
        totalScore += Math.pow(wordlist[idx].length,2);
        idx += tableRows
    }
  }
}

function startSloth () {

  // start the timer
//  console.log("start sloth");
  document.getElementById("startButton").style.display = 'none';
  $('#timerText').css('display', 'initial');
  $('#slothAlphagram').html(slothQuestion);
  document.getElementById('answerBox').disabled = false;
  slothTimer = setInterval(updateSlothTimer, 1000);

}

function slothTimerExpire () {
//  console.log("Sloth Timer Expire");
  var wd;
  var d;
  if (slothScore / totalScore >= 0.6)
    submitSlothChat();
  $('#answerBox').attr("disabled", "disabled");
  $('#startButton').html("Next Word");
  $('#startButton').off('click');
  $('#startButton').on('click', function f(e) { initSloth(); } );
  $('#startButton').css('display', 'initial');
  $('#timerText').css('display', 'none');
  for (var x=0; x<slothData.length; x++) {
    if ( $.isEmptyObject(slothData[x].auxInfo) ) {
      // not in cardbox
      for(var y=0;y<slothData[x].words.length;y++) {
        wd = document.getElementById(slothData[x].words[y]).parentNode;
        wd.title = "Click to add cardbox";
        wd.onclick = function () {addToCardbox(this.firstChild.id);}; 
        wd.style.backgroundColor = "SkyBlue";
       } 
    } else {
    var allCorrect = true;
    for(var y=0;y<slothData[x].words.length;y++) 
      allCorrect = allCorrect && (document.getElementById(slothData[x].words[y]).style.visibility == 'visible');
    if (allCorrect && slothData[x].auxInfo.difficulty == 4) {
      // correct and due in future
//      console.log(slothData[x].alpha + " is correct and due in the future.");
      d = { user: userid, question: slothData[x].alpha, correct: true, cardbox: slothData[x].auxInfo.cardbox-1, incrementQ: false };
      slothSubmitQuestion(d);
      for(var y=0;y<slothData[x].words.length;y++) {
        wd = document.getElementById(slothData[x].words[y]).parentNode;
        wd.title = "Not due - rescheduled";
        wd.style.backgroundColor = "LightGreen"; }
      }
    else if (allCorrect && slothData[x].auxInfo.difficulty != 4) {
      // correct and due now
//      console.log(slothData[x].alpha + " is correct and due now.");
      d = { user: userid, question: slothData[x].alpha, correct: true, cardbox: slothData[x].auxInfo.cardbox, incrementQ: true };
      slothSubmitQuestion(d);
      for(var y=0;y<slothData[x].words.length;y++) {
        var nextCardbox = slothData[x].auxInfo.cardbox + 1;
        wd = document.getElementById(slothData[x].words[y]).parentNode;
        wd.title = "Moved up to cardbox " + nextCardbox;
        wd.style.backgroundColor = "DarkSeaGreen"; }
      }
    else { // not correct 
      if (slothData[x].alpha == slothQuestion) {
      d = { user: userid, question: slothData[x].alpha, correct: false, cardbox: slothData[x].auxInfo.cardbox, incrementQ: true };
      slothSubmitQuestion(d);
      for(var y=0;y<slothData[x].words.length;y++) {
        wd = document.getElementById(slothData[x].words[y]).parentNode;
        wd.title = "Moved to cardbox 0";
        wd.style.backgroundColor = "pink"; }
//        console.log(slothData[x].alpha + " is not correct"); 
    }
    } 
    } 
    }  // end for loop

  var tds = document.querySelectorAll('#answerField td');
  for (var x=0; x<tds.length; x++) {
    if (tds[x].firstChild.style.visibility == 'hidden') {
      tds[x].firstChild.style.color = 'FireBrick';
      tds[x].firstChild.style.fontWeight = 'normal';
      tds[x].firstChild.style.visibility = 'visible';
    }
  }
}

function updateSlothTimer() {
//  console.log("update sloth timer " + slothTimerCount);
  var min = Math.floor(slothTimerCount/60);
  var sec = slothTimerCount%60;
  $('#timerText').html(min + ":" + (sec<10?'0'+sec:sec));
  if (slothTimerCount == 0) {
    clearInterval(slothTimer);
    slothTimerExpire();
  }
  else slothTimerCount--;
}


function submitSlothAnswer () {

    var answer = $.trim($('#answerBox').val().toUpperCase());
    $('#answerBox').val("");
    e = document.getElementById(answer);
    if (e) {
      if (e.style.visibility == 'visible')
         $('#answerBox').css('background-color', 'Khaki');
      else {
      $('#answerBox').css('background-color', 'LightGreen');
      e.style.visibility = 'visible';
      slothScore += Math.pow(answer.length, 2);
      var progress = Math.round((slothScore/totalScore)*100) + '%';
      
      $('#progressDone').css('width', progress);
      $('#progressLabel').html(progress);
      if (slothScore == totalScore) {
         clearInterval(slothTimer);
         slothTimerExpire(); }
      }
    } else { 
       if (isSubAlpha(toAlpha(answer), slothQuestion))
          $('#answerBox').css('background-color', 'LightPink');
       else
          $('#answerBox').css('background-color', 'Khaki');
    }
    setTimeout(function() { $('#answerBox').css('background-color', 'white');}, 100);
    $('#answerBox').focus();
}

function slothSubmitQuestion(d) {

      $.ajax({type: "POST",
         data: JSON.stringify(d),
         url: "submitQuestion.py",
         success: function(response) { console.log(d.question + " updated.");
			console.log(response); },
	 error: function(jqXHR, textStatus, errorThrown) {
	      console.log("Error getting bingo, status = " + textStatus + " error: " + errorThrown); 
              }} );
}

function submitSlothChat() {
  var x = 'initSloth("' + slothQuestion + '")';
  var link = "<a href='#' onclick='" + x + "'>Click here</a>";
  submitChat(username + " has completed " + slothQuestion + " on Subword Sloth with a score of " + $('#progressLabel').html() + ". " + link + " to try and beat it!", true);
  }

function addToCardbox(word) {

  var alpha = toAlpha(word); 
  if (confirm("Click OK to add " + alpha + " to your cardbox.")) {

      var d = {user: userid, question: alpha};
      $.ajax({type: "POST",
         data: JSON.stringify(d),
         url: "addQuestionToCardbox.py",
         success: addedToCardbox,
	 error: function(jqXHR, textStatus, errorThrown) {
	      console.log("Error adding " + alpha + ", status = " + textStatus + " error: " + errorThrown); 
              }} );
}
}

function addedToCardbox(response, responseStatus) {

  if (response[1].status == "success") { 
    var alphaAdded = response[0].question;
    for (var x=0; x<slothData.length; x++) {
      if(slothData[x].alpha == alphaAdded) {
       for(var y=0;y<slothData[x].words.length;y++) {
        wd = document.getElementById(slothData[x].words[y]).parentNode;
        wd.removeAttribute("onclick");
        wd.style.backgroundColor = "SandyBrown";
        wd.title = "Added to Cardbox";
      }}}}
   else alert("Error adding " + response[0].question + " to Cardbox. Please try again.");
} 

