function startQuiz() {
  alphagram = "";
  textFocus = true;
  incorrectAnswerFlag = false;
  incrementQ = true;
  console.log("Starting Quiz");
  var gameArea = document.getElementById("gameArea");
  gameArea.innerHTML = "";
  var alphagramLabel = document.createElement("H1");
  alphagramLabel.id = "alphagram";
  alphagramLabel.style.width = "100%";
  alphagramLabel.style.textAlign = "center";

  var sessionInfo = document.createElement("div");
  sessionInfo.style.width = '100%';
  var questionsCompleteLabel = document.createElement("H5");
  questionsCompleteLabel.style.width = '50%';
  questionsCompleteLabel.style.textAlign = 'left';
  questionsCompleteLabel.style.display = 'inline-block';
  questionsCompleteLabel.innerHTML = 'Complete: <span id="questionsComplete">' + questionCounter + '</span>';
  var sessionScoreLabel = document.createElement("H5");
  sessionScoreLabel.style.width = '50%';
  sessionScoreLabel.style.textAlign = 'left';
  sessionScoreLabel.style.display = 'inline-block';
  sessionScoreLabel.innerHTML = 'Score: <span id="sessionScore"></span>';
  sessionInfo.appendChild(questionsCompleteLabel);
  sessionInfo.appendChild(sessionScoreLabel);
  var auxInfo = document.createElement("div");
  auxInfo.style.width = '100%';
  var auxInfoLeft = document.createElement("H4");
  auxInfoLeft.id = "auxInfoLeft"
  auxInfoLeft.style.width = "50%";
  auxInfoLeft.style.textAlign = "left";
  auxInfoLeft.style.display = "inline-block";
  var auxInfoRight = document.createElement("H4");
  auxInfoRight.id = "auxInfoRight"
  auxInfoRight.style.width = "50%";
  auxInfoRight.style.textAlign = "right";
  auxInfoRight.style.display = "inline-block";
  var dueDateLabel = document.createElement("div");
  dueDateLabel.style.width = '100%';
  var dueDateText = document.createElement("H5");
  dueDateText.style.width = '100%';
  dueDateText.innerHTML = 'Due: <span id="dueDate"></span>';
  dueDateLabel.appendChild(dueDateText);
  var markAs = document.createElement("div");
  markAs.style.width = '100%';
  markAs.style.textAlign = 'center';
  markAs.style.verticalAlign = 'middle';
  markAs.style.overflow = 'auto';
  var markAsCorrect = document.createElement("img");
  var markAsIncorrect = document.createElement("img");
  var nextQuestion = document.createElement("img");
  markAsCorrect.style.display = "inline-block";
  markAsCorrect.src = "checkIcon.png";
  markAsCorrect.id = "markAsCorrect";
  markAsCorrect.style.cssFloat = 'left';
  markAsCorrect.style.margin = "5px";
  nextQuestion.id = "nextQuestion";
  nextQuestion.style.display = 'inline-block';
  nextQuestion.src = "nextIcon.png";
  nextQuestion.style.margin = "5px";
  $('#nextQuestion').click(function() { textFocus = false;
                                getQuestion(); });
  markAsIncorrect.src = "crossIcon.png";
  markAsIncorrect.style.cssFloat = 'right';
  markAsIncorrect.style.margin = "5px";
  markAsIncorrect.id = 'markAsIncorrect';
  markAsIncorrect.addEventListener("click", function(e) {submitQuestion(false)});
  var answerBox = document.createElement("input");
  answerBox.type = "text";
  answerBox.id = "answerBox";
  answerBox.style.display = "block";
  answerBox.style.width = "70%"
  answerBox.style.margin = "auto";
  answerBox.addEventListener("keypress", function(e) {
	if (e.which === 13) {
	  $(this).attr("disabled", "disabled");
	  submitAnswer();
//	re-enable this in getQuestion() so it happens after the 
//	asynchronous call finishes
//	  $(this).removeAttr("disabled", "disabled");
	}  });
  var correctAnswers = document.createElement("div");
  correctAnswers.id = "correctAnswers";
		
  gameArea.appendChild(alphagramLabel);
  gameArea.appendChild(sessionInfo);
  gameArea.appendChild(dueDateLabel);
  auxInfo.appendChild(auxInfoLeft);
  auxInfo.appendChild(auxInfoRight);
  gameArea.appendChild(auxInfo);
  markAs.appendChild(markAsCorrect);
  markAs.appendChild(nextQuestion);
  markAs.appendChild(markAsIncorrect);
  gameArea.appendChild(markAs);
  gameArea.appendChild(answerBox);
  gameArea.appendChild(correctAnswers);

  $('#markAsCorrect').on('click', null, true, submitQuestion);

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
  var d = { numQuestions: 1, user: userid }
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
    alphagram = Object.keys(question)[0];
    answers = eval("question." + alphagram);
    allAnswers = answers.slice();
  
    $('#alphagram').html(alphagram)
    document.getElementById("alphagram").style.color = "black";
    $('#correctAnswers').html("");
    $('#answerBox').val("");
    $('#answerBox').removeAttr("disabled", "disabled");
    $('#nextQuestion').click(function() { textFocus = false;
                                getQuestion(); });
    if (textFocus) $('#answerBox').focus();
    textFocus = true;
    var dueDate = new Date(aux.nextScheduled * 1000);
    $('#dueDate').html(formatDateForDisplay(dueDate));  
    $('#auxInfoLeft').html('<b>Cardbox:</b> ' + aux.cardbox);
    $('#auxInfoRight').html('<b>Answers:</b> ' + Object.keys(wordData).length);
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
        displayAnswer(answer);
	if (answers.length == 0)
          submitQuestion(!incorrectAnswerFlag);
      }
      else { console.log("Incorrect Answer"); 
      if ($.inArray(answer, allAnswers) >= 0 || toAlpha(answer) != alphagram) 
        $('#answerBox').css('background-color', 'Khaki');
      else { $('#answerBox').css('background-color', 'LightPink');
             incorrectAnswerFlag = true; }
      setTimeout(function() { $('#answerBox').css('background-color', 'white');}, 100);
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
                  $('#questionsComplete').html(++questionCounter);
                  if (response[0].qAnswered%50 == 0) 
                  submitChat(username + " has completed " + response[0].qAnswered + " alphagrams today!", true); }
                incrementQ = false; } ,
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
  }
  else {
    //console.log("Incorrect Question");
    document.getElementById("alphagram").style.color = "red";
    $('#markAsIncorrect').hide();
    $('#markAsCorrect').show();
    $('#nextQuestion').show();
    $('#nextQuestion').css('float', 'right');
  }
  for (var x=0;x<answers.length;x++)  {
    displayAnswer(answers[x]);
  }
  answers = []; 
  $('#alphagram').html(getWordWithHook(Object.keys(wordData)[0]));
  var counter = 0
  if (typeof scrollTimer !== 'undefined' && scrollTimer !== null)
    clearInterval(scrollTimer);
  scrollTimer = setInterval(function() { 
    $('#alphagram').html(getWordWithHook(allAnswers[counter%allAnswers.length]));
    counter++; }, 2000);
  $('#nextQuestion').show();
  quizState = "finished";
}

function displayAnswer(answer) {
  
  var x = document.getElementById("correctAnswers");
  var t = document.createElement("P");
  var dot = "&#183;";
  data = eval("wordData." + answer);
  t.innerHTML = data[0]+ "&nbsp;&nbsp;<b>"+ (data[3][0]?dot:"") + 
        answer + (data[3][1]?dot:"") + "</b>&nbsp;&nbsp;" + data[1] + 
        "&nbsp;&nbsp;&nbsp;" + data[2];
  x.insertBefore(t, x.childNodes[0]);
}

function toAlpha(word) {
  return word.split('').sort().join(''); }	

function getWordWithHook(word) {
    var result = eval("wordData." + word)[0];
    result += " " + word + " ";
    result += eval("wordData." + word)[1];
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

