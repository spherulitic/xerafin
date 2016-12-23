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
  progressBar.style.background = "lightgray";
  progressBar.style.margin = "5px";
  progressDone.style.position = "absolute";
  progressDone.style.width = "0%";
  progressDone.style.height = "100%";
  progressDone.style.background = "green";
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

  var answerField = document.createElement("div");
  var answerFieldBody = document.createElement("div");
  answerFieldBody.className += ' well well-sm pre-scrollable';
  answerField.appendChild(answerFieldBody);
  answerFieldBody.id = "answerField";
  answerField.style.width = "100%";
  answerField.paddingBottom = "10px";
		
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
  var minSubLength = 4;
  totalScore = 0;
  slothScore = 0;
  slothTimerCount = Math.max(180, wordlist.length*3);
  var answerField = document.getElementById("answerField");
  for (var y=slothQuestion.length;y>=minSubLength;y--){
  	var content = wordlist.filter( function( element ) {
  		return element.length == y;
	});
	if (content.length!==0){generateSlothTable (content,y)};
  }
  
}

function generateSlothTable (content,wordLength) {
	var slothColumns = [0,0,15,10,8,7,6,6,5,5,4,4,3,3,2,2];
	var slothTableHeadings = ['','','Twos','Threes','Fours','Fives','Sixes','Sevens','Eights','Nines','Tens','Elevens','Twelves','Thirteens','Fourteens','Fifteens']
	var currentTable = document.createElement('table');
	if (content.length>=slothColumns[wordLength]){
		currentTable.style.width='100%';}
	currentTable.id='slothTable'+wordLength;
	currentTable.style.borderCollapse = 'separate'; 
	currentTable.style.borderSpacing= '2px';
	var tableHeading = document.createElement('div');
	tableHeading.id='slothHeading'+wordLength;
	tableHeading.style.background='url("b42.png") repeat';
	/**tableHeading.style.background='#6ac';**/
	tableHeading.style.paddingLeft='5px';
	tableHeading.style.color='#000';
	tableHeading.style.border='1px solid #333';
	tableHeading.style.width='100%';
	tableHeading.style.fontSize='0.9em';
	tableHeading.style.fontVariant='small-caps';
	tableHeading.innerHTML=slothTableHeadings[wordLength]+' ('+content.length+')';
	document.getElementById("answerField").appendChild(tableHeading);
	var tableRows = Math.ceil(content.length / slothColumns[wordLength]);
	for (var x=0; x< tableRows; x++) {
		var tr = document.createElement('tr');
		var idx = x;
		for (var i=0;i < slothColumns[wordLength];i++) {
			if (idx < content.length) {
				var td = document.createElement('td');
        		td.className = "slothTD";
        		td.style.border = 'solid 1px #ccc';
        		td.style.fontSize = '0.85em';
        		var span = document.createElement('span');
        		span.style.visibility = "hidden";
        		span.style.fontWeight = 'bold';
        		span.id = content[idx];
        		span.innerHTML = content[idx];
       			totalScore += Math.pow(content[idx].length,2);
        		tr.appendChild(td);
        		td.appendChild(span);
        		idx += tableRows;
			}	
		}		
		currentTable.appendChild(tr);
	}
	document.getElementById("answerField").appendChild(currentTable);
} 

function startSloth () {

  // start the timer
//  console.log("start sloth");
  document.getElementById("startButton").style.display = 'none';
  $('#timerText').css('display', 'initial');
  $('#slothAlphagram').html(slothQuestion);
  document.getElementById('answerBox').disabled = false;
  $('#answerBox').focus();
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
        wd.style.background = "SkyBlue";
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
        wd.style.background = "LightGreen"; }
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
        wd.style.background = "DarkSeaGreen"; }
      }
    else { // not correct 
      if (slothData[x].alpha == slothQuestion) {
      d = { user: userid, question: slothData[x].alpha, correct: false, cardbox: slothData[x].auxInfo.cardbox, incrementQ: true };
      slothSubmitQuestion(d);
      for(var y=0;y<slothData[x].words.length;y++) {
        wd = document.getElementById(slothData[x].words[y]).parentNode;
        wd.title = "Moved to cardbox 0";
        wd.style.background = "pink"; }
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
         $('#answerBox').css('background', 'Khaki');
      else {
      $('#answerBox').css('background', 'LightGreen');
      e.style.visibility = 'visible';
      e.parentNode.style.background = "url('b34.png') repeat";
      slothScore += Math.pow(answer.length, 2);
      /**NEW**/
       document.getElementById('answerField').scrollTop = 0;
      var elem = $("#slothTable"+answer.length);
	  var offset = (elem.offset().top - elem.parent().offset().top + 20)+ (elem.outerHeight() - elem.parent().height()  - 20)  ;
      var topPos = $('#slothTable'+answer.length).position().top;
	  document.getElementById('answerField').scrollTop = offset;
	  /**Test of parameters when scrolling**/
	  /**$('#slothHeading4').html(offset+' '+topPos + ' ' + elem.parent().height() + ' ' + elem.outerHeight());**/
      /*******/
      var progress = Math.round((slothScore/totalScore)*100) + '%';
      
      $('#progressDone').css('width', progress);
      $('#progressLabel').html(progress);
      if (slothScore == totalScore) {
         clearInterval(slothTimer);
         slothTimerExpire(); }
      }
    } else { 
       if (isSubAlpha(toAlpha(answer), slothQuestion))
          $('#answerBox').css('background', 'LightPink');
       else
          $('#answerBox').css('background', 'Khaki');
    }
    setTimeout(function() { $('#answerBox').css('background', 'url("b34.png") repeat');}, 300);
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
  submitChat(username + " has completed " + slothQuestion + " on Subword Sloth with a score of " + $('#progressLabel').html() + ". " + link + " to try and beat it!", true, 1); // system userid for Subword Sloth is 1
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
        wd.style.background = "SandyBrown";
        wd.title = "Added to Cardbox";
      }}}}
   else alert("Error adding " + response[0].question + " to Cardbox. Please try again.");
} 

