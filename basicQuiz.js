function startQuiz() {

/** Initialisation Variables **/
  alphagram = "";  
  textFocus = true;
  incorrectAnswerFlag = false;
  incrementQ = true;
  correctProgress = 0;
  correctState = 0;
  totalAnswers = 0;
  console.log("Starting Quiz");
  correctPercent = 0.0;
  
/** Game Div Defined and Cleared **/
  var gameArea = document.getElementById("gameArea");
  gameArea.innerHTML = "";

/** Quiz Regions Defined **/ 

/** Session Region Generation **/
  var sessionInfo = document.createElement("table");
  sessionInfo.className += ' quizSessionTable';
  var sessionScoreLabel = document.createElement("div");
  var sessionHeader = document.createElement('thead');
  var sessionContent = document.createElement('tr');
  var sessionHeaderCell = [];
  var sessionHeaderContent = ['questions', 'cardbox', 'due date', 'score', '% correct'];
  var sessionHeaderClasses = ['',' quizSessionTableHCardbox',' quizSessionTableHDue','',' quizSessionTableHCorrect']
  var sessionContentCell= [];
  var sessionContentContent = ['<span id="questionsComplete">'+questionCounter+'</span>', '<span id="cardboxNumber"></span>', 
  '<span id="dueDate"></span>', '<span id="sessionScore">0</span>', '<span id="correctPercent">'+correctPercent.toFixed(2)+'%'+'</span>'];
  for (var i=0;i<5;i++){
  	sessionHeaderCell[i]= document.createElement('th');
  	sessionHeaderCell[i].innerHTML = sessionHeaderContent[i];
  	sessionHeaderCell[i].className += sessionHeaderClasses[i];
  	sessionContentCell[i]= document.createElement('td');
  	sessionContentCell[i].innerHTML= sessionContentContent[i];
  	sessionHeader.appendChild(sessionHeaderCell[i]);
  	sessionContent.appendChild(sessionContentCell[i]);
  }
  sessionHeaderCell[4].title='% of questions answered correctly this session.';
  sessionInfo.appendChild(sessionHeader);
  sessionInfo.appendChild(sessionContent);

/** Other Regions **/

  var alphaSuper = document.createElement("div");
  var alphaContainer = document.createElement("div");
  var alphagramLabel = document.createElement("div");
  var leftHookLabel = document.createElement("div");
  var rightHookLabel = document.createElement("div");
  var markAs = document.createElement("div");
  var markAsCorrect = document.createElement("button");
  var markAsIncorrect = document.createElement("button");
  var nextQuestion = document.createElement("button");
  var answerContainer = document.createElement("div");
  var answerAmount = document.createElement("div");
  var answerBox = document.createElement("input");  
  var correctAnswers = document.createElement("table");
  var wrongAnswers = document.createElement("div");

/** Styling & ID initialisation **/  
  alphaSuper.className += " quizAlphaSuper";
  alphaContainer.id = "alphaContainer";
  alphaContainer.className += " quizAlphaContain";
  alphagramLabel.id = "alphagram";
  alphagramLabel.className += " quizAlpha";
  leftHookLabel.id = "leftHook";
  leftHookLabel.className += " quizAlphaLeft";
  rightHookLabel.id = "rightHook";
  rightHookLabel.className += " quizAlphaRight";
  leftHookLabel.innerHTML = '&nbsp;&nbsp;'
  rightHookLabel.innerHTML = '&nbsp;&nbsp;'
  markAs.className += " quizAnswerRegion"; 
  markAsCorrect.id = "markAsCorrect";
  markAsCorrect.className+=' quizButton quizButtonCorrect';
  markAsCorrect.title = "Mark as Correct";
  markAsCorrect.innerHTML='&#10004;';   
  nextQuestion.id = "nextQuestion";
  nextQuestion.className+=' quizButton quizButtonNext';
  nextQuestion.innerHTML='&#10144;';
  nextQuestion.style.display = 'none';
  nextQuestion.title = "Next Question";
  markAsIncorrect.id = 'markAsIncorrect';
  markAsIncorrect.title = "Mark as Incorrect";
  markAsIncorrect.className+=' quizButton quizButtonIncorrect';
  markAsIncorrect.innerHTML='✘';
  answerContainer.id = "answerContainer";
  answerContainer.className += " quizAnswerContain";
  answerBox.type = "text";
  answerBox.id = "answerBox";
  answerBox.maxLength = '15';
  answerBox.className += " quizAnswerBox";
  answerAmount.id = "answerAmount";
  answerAmount.className += " quizAnswerNumber"; 
  correctAnswers.id = "correctAnswers";
  correctAnswers.className += " wordTable";
  wrongAnswers.id = "wrongAnswers";
  wrongAnswers.className += " wordTableWrong"
  wrongAnswers.innerHTML = "";
/** Quiz Screen Generation **/ 
  gameArea.appendChild(alphaSuper);
  alphaSuper.appendChild(alphaContainer);
  alphaContainer.appendChild(leftHookLabel);
  alphaContainer.appendChild(alphagramLabel);
  alphaContainer.appendChild(rightHookLabel);
  gameArea.appendChild(markAs);
  markAs.appendChild(markAsCorrect);
  markAs.appendChild(nextQuestion);
  markAs.appendChild(answerContainer);
  answerContainer.appendChild(answerBox);
  answerContainer.appendChild(answerAmount);
  markAs.appendChild(markAsIncorrect);
  gameArea.appendChild(sessionInfo);  
  gameArea.appendChild(correctAnswers);
  gameArea.appendChild(wrongAnswers);
  
/** Event Listeners **/ 
  $('#nextQuestion').click(function() { textFocus = false;
                                getQuestion(); });
  markAsIncorrect.addEventListener("click", function(e) {submitQuestion(false)});
  answerBox.addEventListener("keypress", function(e) {
	if (e.which === 13) {
//	re-enable this in getQuestion() so it happens after the 
//	asynchronous call finishes
	  $(this).attr("disabled", "disabled");
	  submitAnswer();
	}  });
	$('#markAsCorrect').on('click', null, true, submitQuestion);
/** AJaX call to get question **/
/** newQuiz.py refreshes the quiz, ie, you start to get things
 *  from the lowest cardbox again **/
  var d = { user: userid };
  $.ajax({type: "POST",
         data: JSON.stringify(d),
         url: "newQuiz.py",
         success: getQuestion,
	 error: function(jqXHR, textStatus, errorThrown) {
	      console.log("Error, status = " + textStatus + " error: " + errorThrown); 
              getQuestion();  }} );
}

function getQuestion() {
  $('#nextQuestion').off("click");
  var d = { numQuestions: 1, user: userid };
  $.ajax({ type: "POST",
           url: "getQuestion.py",
	   data: JSON.stringify(d),
	   success: displayQuestion,
	   error: function(jqXHR, textStatus, errorThrown) {
	      console.log("Error, status = " + textStatus + " error: " + errorThrown)
  if (typeof scrollTimer !== 'undefined' && scrollTimer !== null)
              clearInterval(scrollTimer);
              $('#alphagram').html('Connection Error');
              $('#answerBox').removeAttr("disabled", "disabled");
              $('#nextQuestion').click(function() { textFocus = false;
                                getQuestion(); });
	      }
	 });
 }

function displayQuestion(response, responseStatus) {

  console.log("Question Response");
  if (typeof scrollTimer !== 'undefined' && scrollTimer !== null)
    clearInterval(scrollTimer);
  var r = response[0];
  console.log(r);
  var question = r.questions;
  wordData = r.words;
  aux = r.aux[0];
  if (r.getFromStudyOrder) {
    d = {userid: userid};
    $.ajax({ type: "POST",
           url: "prepareNewWords.py",
	   data: JSON.stringify(d),
	   success: function(response, responseStatus) {
		console.log("Next Added table prepared.");
		console.log(response);
		},
	   error: function(jqXHR, textStatus, errorThrown) {
			console.log("Error preparing Next Added"); }});
  }
  if (Object.keys(question)[0] == alphagram && quizState == "finished") {
    setTimeout(getQuestion, 700) // the previous question took too long
			// to submit, so we need to wait to get a fresh one
    $('#answerBox').val("Loading Question ...");
  } else {
  	correctProgress=0;
	correctState = 0;
    alphagram = Object.keys(question)[0];
    answers = eval("question." + alphagram);
    allAnswers = answers.slice();
    document.getElementById('nextQuestion').disabled = false;
    $('#alphagram').html(alphagram);
    $('#alphagram').css('color', 'black');
    $('#leftHook').html("&nbsp;");
    $('#rightHook').html("&nbsp;"); 
    $('#correctAnswers').html("");
    $('#wrongAnswers').html("");
    $('#answerBox').val("");
    $('#answerBox').removeAttr("disabled", "disabled");
    $('#nextQuestion').click(function() { textFocus = false;
    							document.getElementById('nextQuestion').disabled=true;
                                getQuestion(); });
    if (textFocus) $('#answerBox').focus();
    textFocus = true;
    var dueDate = new Date(aux.nextScheduled * 1000);
    $('#dueDate').html(formatDateForDisplay(dueDate));  
    $('#cardboxNumber').html(aux.cardbox);
	if(questionCounter>0) correctPercent = (correctCounter/questionCounter)*100;
	$('#correctPercent').html(correctPercent.toFixed(2)+'%');
    totalAnswers=Object.keys(wordData).length;
    $('#answerAmount').html('<b>Answers:</b> ' + correctProgress +'  of ' + totalAnswers);
    $('#nextQuestion').hide();
    $('#markAsCorrect').show();
    $('#markAsIncorrect').show();
    quizState = "started"; 
    incorrectAnswerFlag = false;
    incrementQ = true;
  }
}

function submitAnswer () {

  if (quizState == "finished") {
    getQuestion(); }
  else {
    answer = $.trim($('#answerBox').val().toUpperCase());
    if (answer == "") {
      // on blank answer, submit question
      submitQuestion(false);
    }
    else { 
      idx = $.inArray(answer, answers);
      if (idx > -1) {
        answers.splice(idx, 1);
        console.log("Correct Answer");
        correctProgress++; 
        $('#answerAmount').html('<b>Answers</b> ' + correctProgress + ' of ' + totalAnswers);
        displayAnswer(answer);
	if (answers.length == 0)
          submitQuestion(!incorrectAnswerFlag);
      }
      else { console.log("Incorrect Answer"); 
      if ($.inArray(answer, allAnswers) >= 0 || toAlpha(answer) != alphagram) 
        $('#answerBox').css('background', 'yellow');
      else { $('#answerBox').css('background', 'red');
             incorrectAnswerFlag = true; document.getElementById("wrongAnswers").innerHTML+=answer+" ";}
      setTimeout(function() { $('#answerBox').css('background', 'url("b34.png") repeat');}, 200);
      }
      document.getElementById("answerBox").value = "";
    }
   $('#answerBox').removeAttr("disabled", "disabled");
   $('#answerBox').focus();
  }  
}

function submitQuestion (correct) {
  d = { user: userid, question: alphagram, correct: correct, cardbox: aux.cardbox, incrementQ: incrementQ };
  $.ajax({ type: "POST",
           url: "submitQuestion.py",
	   data: JSON.stringify(d),
	   success: function(response, responseStatus) { 
		console.log("Question " + alphagram + " updated in cardbox."); 
                $('#sessionScore').html(response[0].score - startingScore);
                if (incrementQ) {
                  if ((response[0].qAnswered%50 == 0) & (response[0].qAnswered<501)) {
                  submitChat(username + " has completed <b>" + response[0].qAnswered + "</b> alphagrams today!", true); }
                  else if ((response[0].qAnswered%100 == 0) & (response[0].qAnswered>501) & (response[0].qAnswered<2001)) {
                  submitChat(username + " has completed <b>" + response[0].qAnswered + "</b> alphagrams today!", true); }
                  else if ((response[0].qAnswered%200 == 0) & (response[0].qAnswered>2001)) {
                  submitChat(username + " has completed <b>" + response[0].qAnswered + "</b> alphagrams today!", true); }
                incrementQ = false; }} ,
	   error: function(jqXHR, textStatus, errorThrown) {
		console.log("Error: question " + alphagram + " could not be updated.");
		submitQuestion(correct); } });
  
  if (correct) {
    //console.log("Correct Question");
    document.getElementById("alphagram").style.color = "green";
    $('#markAsCorrect').hide();
    $('#markAsIncorrect').show();
    $('#nextQuestion').show();
    $('#nextQuestion').css('float', 'left');
	if (correctState == 0) correctCounter++;
    correctState=1;  
  }
  else {
    //console.log("Incorrect Question");
    document.getElementById("alphagram").style.color = "red";
    $('#markAsIncorrect').hide();
    $('#markAsCorrect').show();
    $('#nextQuestion').show();
    $('#nextQuestion').css('float', 'right');
	if (correctState == 1) correctCounter--;
    correctState=0;
  }
  quizState = "finished";
  	
    if (incrementQ) { questionCounter++; }
	correctPercent = (correctCounter/questionCounter)*100;
    $('#correctPercent').html(correctPercent.toFixed(2)+'%');
    $('#questionsComplete').html(questionCounter);

  for (var x=0;x<answers.length;x++)  {
    displayAnswer(answers[x]);    
  }
  
  answers = []; 
  var temp=getWordWithHook(Object.keys(wordData)[0])
  var maxWidths=0;
  var counter = 0;
  temp[0]= addLineBreaks (temp[0], 8);
  temp[2]= addLineBreaks (temp[2], 8);
  $('#alphagram').html(temp[1]);
  $('#leftHook').html(temp[0]);
  $('#rightHook').html(temp[2]);
  maxWidths = Math.max($('#rightHook').width(), $('#leftHook').width());
  $('#rightHook').width(maxWidths);
  $('#leftHook').width(maxWidths); 
  if (typeof scrollTimer !== 'undefined' && scrollTimer !== null)
    clearInterval(scrollTimer);
  scrollTimer = setInterval(function() { 
  	var temp2=getWordWithHook(allAnswers[counter%allAnswers.length]);
  	temp2[0]= addLineBreaks (temp2[0], 8);
    temp2[2]= addLineBreaks (temp2[2], 8);  
    $('#alphagram').html(temp2[1]);
    $('#leftHook').html(temp2[0]);
    $('#rightHook').html(temp2[2]); 
  maxWidths = Math.max($('#rightHook').width(), $('#leftHook').width());
  $('#rightHook').width(maxWidths);
  $('#leftHook').width(maxWidths);
    counter++; }, 2500);
  $('#nextQuestion').show();
}

function displayAnswer(answer){ 
  var x = document.getElementById("correctAnswers");
  var dot = "&#183;";
/** Find row number to insert new answer into **/
  if (document.getElementById("correctAnswers").rows.length > 0){
		for (var z=0;z<x.rows.length;z++){	
			if (answer.toUpperCase()<x.rows[z].cells[2].innerHTML){
				y=z;break;
			}
			else {y=-1;}
		}
	}
	else {y=-1;}
/** create row **/
	var row = x.insertRow(y);
	var cells = [];
	for (var i=0;i<6;i++){	
		cells[i] = row.insertCell(i);
	}
/** clear previously highlighted word and highlight new answer **/
for (var i=0;i<x.rows.length;i++){	
	if ( document.getElementById("correctAnswers").rows[i].classList.contains('wordTableHighlight') ) {
		document.getElementById("correctAnswers").rows[i].classList.remove('wordTableHighlight');
	}
}
if (quizState !== "finished"){
	row.className += ' wordTableHighlight';	
}	
else {
	row.className += ' wordTableHighlightWrong';
}			
/**Insert Data**/
  data = eval("wordData." + answer);
  var cellClass = [" wordTableLeftHook", " wordTableInnerLeft", " wordTableWord", " wordTableInnerRight", " wordTableRightHook", " wordTableDefinition"];
  var cellContent = [data[0], (data[3][0]?dot:""), answer, (data[3][1]?dot:""), data[1], data[2]];
  for (var i=0;i<6;i++){	
  	cells[i].className += cellClass[i];
  	cells[i].innerHTML = cellContent[i];
  }  
}

function toAlpha(word) {
  return word.split('').sort().join(''); }	

function getWordWithHook(word) {
    var result = [eval("wordData." + word)[0], word, eval("wordData." + word)[1]];
    if (result[0]==""){result[0]=="&nbsp;"}
    if (result[2]==""){result[2]=="&nbsp;"}
    return result;

}

function formatDateForDisplay(d) {
    var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
   return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear() + " " + d.getHours()+":"+(d.getMinutes()<10 ? "0" : "") + d.getMinutes();

}

function isSubAlpha(a1, a2) {
  // is a1 a sub alphagram of a2
  var idx = 0;
  var result = true;
  for(var x=0; x<a1.length && result; x++) {
    result = result && ((idx = a2.indexOf(a1.charAt(x), idx)) > -1); 
    idx++;
  } 
  return result;
}

function getDivisor (item, divideBy) {
	if (divideBy !== 0){return Math.ceil(item.length/divideBy);}
}

function addLineBreaks (item, divideBy) {
	var divisor = getDivisor (item,divideBy);
	if (divisor>1){	
    	var splitUp=item;
    	var splitPos = Math.ceil(item.length/divisor);
    	for (var i=1;i<divisor;i++) {
			splitUp= splitUp.substr(0, (i*splitPos)+(4*(i-1))) + '<br>' + splitUp.substr((i*splitPos)+(4*(i-1)));
    	}
    	return splitUp;
    }
	return item;
}