function initInvaders() {
    /** AJaX call to unlock questions from previous game **/
    var d = { user: userid };
    $.ajax({
        type: "POST",
        data: JSON.stringify(d),
        url: "newQuiz.py",
        success: initInvaders2,
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("Error, status = " + textStatus + " error: " + errorThrown);
            initInvaders2();
        }
    });
}


function initInvaders2() {

  console.log("Starting Invaders");
  COLOR_LIST = [ "black", "azure", "mediumorchid", "palegreen", "yellowgreen", "khaki", "salmon", "hotpink", "crimson", "magenta", "orange", "peachpuff", "mistyrose", "floralwhite" ] // maximum number of anagrams is 13
  ALPHA_HEIGHT = 17;
  LETTER_WIDTH = 13;
  FALL_SPEED = 50.0; // ms per pixel
  WORD_FREQ = 8000; // new word freq in ms
  currentScore = 0;
  personalHighScore = 0;
  dailyHighScore = 0;
  invaderStatus = 'finished';
  invadersAlphas = [ ];
  explosions = [ ];
  nextAlphaTimer_inv = -1;
  clearAnswersTimer_inv = -1;
  gettingWord_inv = false;
  explosion_sound = new Audio('explosion_sm.wav');

  // run newQuiz before everything starts to unlock stuff

  var d = { userid: userid };
  $.ajax({type: "POST",
         data: JSON.stringify(d),
         url: "getInvaderHighScores.py",
         success: function(response, responseStatus) {
                      result = response[0];
                      personalHighScore = result.personal;
                      dailyHighScore = result.daily.score; },
	 error: function(jqXHR, textStatus, errorThrown) {
	      console.log("Error, status = " + textStatus + " error: " + errorThrown); 
              }} );

  // in case a quiz was underway
  stopScrollTimer();
  resetHookWidthsQuiz();
  var gameArea = document.getElementById("gameArea");
  $('#gameArea').empty();
 
  var bgMusic = document.createElement("audio");
  bgMusic.src = "invadersMusic.ogg";
  bgMusic.autoplay = false;
  bgMusic.loop = true;
  bgMusic.controls = false;
  bgMusic.id = "invadersMusic";

  gameArea.appendChild(bgMusic);
  // NOTE: localStorage can only store strings, not booleans!
  if (localStorage.musicEnabled == "true") {
      bgMusic.play(); }

  var canvas = document.createElement("canvas");
  canvas.id = "invadersCanvas";
//  canvas.width = $(window).width()/3.7;
//  canvas.height = $(window).height()/2;
  INVW = 360;
  INVH = 360;
  canvas.width = INVW;
  canvas.height = INVH;
  canvas.style = "border: 1px;";
  canvas.onclick = function (e) {
         pos = getPosition_inv(e);
         // toggle through music+sound, sound only, all muted
         if (e.x > 340 && e.y > 340) {
            if (localStorage.musicEnabled == "true") {
                localStorage.musicEnabled = "false";
                document.getElementById("invadersMusic").pause();
                localStorage.soundEnabled = "true";
            } else if (localStorage.soundEnabled == "true") {
                        localStorage.soundEnabled = "false"; 
                   } else { localStorage.musicEnabled = "true";
                          localStorage.soundEnabled = "true";
                          document.getElementById("invadersMusic").play();
                   }
              drawSoundIcon_inv();
            }
         for(var i=0;i<invadersAlphas.length;i++) {
            if(invadersAlphas[i].leftx<=pos.x && pos.x <= invadersAlphas[i].leftx+invadersAlphas[i].width &&
               invadersAlphas[i].y-invadersAlphas[i].height<=pos.y && pos.y <= invadersAlphas[i].y) {
                  if (invadersAlphas[i].active) 
                     invadersAlphas[i].timeout = 0; // clicking marks it wrong
                  displayWord_inv(invadersAlphas[i], invadersAlphas[i].words);
                  break;
               }
         }
       };
  ctx = canvas.getContext('2d');
  explosionImg = new Image();
  explosionImg.src = "explosion_sprite.png";
  invaderBgImg = new Image();
  invaderBgImg.onload = function() { ctx.drawImage(invaderBgImg, 0, 0); 
	  ctx.textAlign = 'center';
	  ctx.font = '20px courier';
	  ctx.fillStyle = 'red';
	  ctx.fillText('CARDBOX', 180, 70);
	  ctx.fillText('INVADERS', 180, 95);
	  // 20 pt courier, each letter is 12px across
	  ctx.font = '16px courier';
          ctx.fillText("Don't let your cardbox", 180, 180);
          ctx.fillText(" fill the screen", 180, 200);
          ctx.fillText('Click an alphagram to', 180, 240);
          ctx.fillText('mark wrong and see answers', 180, 260);
	  ctx.fillText('Press Enter to Begin', 180, 300);
          drawSoundIcon_inv();
          var invaderIcon = new Image();
          invaderIcon.onload = function () { ctx.drawImage(invaderIcon, 240, 50, 40, 40); }
          invaderIcon.src = "cardboxInvaders2.png";
};
  invaderBgImg.src = "nightsky.png";

  

  var showWordsRow = document.createElement("div");
  showWordsRow.id = "showWordsRow";
  showWordsRow.style = "width: 100%; height: 150px; display: inline-block; text-align: center; padding: 5px;";

var showWordsTable = document.createElement("table");
  showWordsTable.id = "showWordsInv";
  showWordsTable.style = "width: 100%; display: inline-block; text-align: center;";
  showWordsRow.appendChild(showWordsTable);

  var buttonBoxPause = document.createElement("div");
  buttonBoxPause.id = "buttonBox1";
  buttonBoxPause.style = "width: 25%; display: inline-block; text-align: right;";

  
  var pauseButton = document.createElement("button");
  pauseButton.id = "pauseButton";
  pauseButton.innerHTML = "Pause";
  pauseButton.style.margin = "5 auto";
  pauseButton.style.padding = "5px";
  buttonBoxPause.appendChild(pauseButton);
  pauseButton.onclick = function() { if (invaderStatus == "started") {
                                        invaderStatus = "paused";
                                        endGame_inv(false, true); // save high scores, don't reset or send chat
                                        document.getElementById("pauseButton").innerHTML = "Resume"; }
                           else if (invaderStatus == "paused") {
                                        invaderStatus = "started";
                                        document.getElementById("pauseButton").innerHTML = "Pause";
                                        requestAnimationFrame(function(timestamp) {
                                           animateAlphas_inv(timestamp, timestamp, timestamp); }); } };

  var buttonBoxReset = document.createElement("div");
  buttonBoxReset.id = "buttonBox2";
  buttonBoxReset.style = "width: 25%; display: inline-block; text-align: left;";
  
  var resetButton = document.createElement("button");
  resetButton.id = "resetButton";
  resetButton.innerHTML = "Reset";
  resetButton.style.margin = "5 auto";
  resetButton.style.padding = "5px";
  resetButton.onclick = function() { endGame_inv(true, false); };
  buttonBoxReset.appendChild(resetButton);

  var answerBoxRow = document.createElement("div");
  answerBoxRow.id = "answerBoxRow";
  answerBoxRow.style = "width: 100%; display: inline-block; text-align: center;";

  var answerBox = document.createElement("input");
  answerBox.type = "text";
  answerBox.id = "answerBox";
  answerBox.disabled = false;
  answerBox.className += "quizAnswerBox";
  answerBox.style.width = "75%"; // overriding the class for now
  answerBox.style.textAlign = "center";
  var answerBoxField = document.createElement("div");
  answerBoxField.style = "width: 50%; display: inline-block; text-align: center;";
  answerBoxField.appendChild(answerBox);

  answerBoxRow.appendChild(buttonBoxPause);
  answerBoxRow.appendChild(answerBoxField);
  answerBoxRow.appendChild(buttonBoxReset);

  gameArea.appendChild(canvas);
  gameArea.appendChild(answerBoxRow);
  gameArea.appendChild(showWordsRow);

  answerBox.focus();
 
  $('#answerBox').on("keypress", function(e) {if(e.ctrlKey) {$(this).val("");
                                   } else if (e.which === 13 || e.which == 32) {
                                              submitInvadersAnswer(); }});

}

function getPosition_inv(event) {
  var x = event.x;
  var y = event.y;

  var canvas = document.getElementById("invadersCanvas");
  var rect = canvas.getBoundingClientRect();
  x -= rect.left;
  y -= rect.top;

  return { x: x, y: y }

}

function submitInvadersAnswer() {

  console.log("Submit Answer");
  if (invaderStatus == 'paused') {
    document.getElementById("pauseButton").innerHTML = "Pause"; }
  if (invaderStatus == 'finished' || invaderStatus == 'paused') {
    invaderStatus = 'started';
    ctx.font = '20px courier';
    requestAnimationFrame(function(timestamp) {
        animateAlphas_inv(timestamp, timestamp, timestamp);
    });
  } else if (invaderStatus == 'started')  {
     var ans = answerBox.value.toUpperCase().trim();
     var found = false;
     console.log("Answer submitted: " + ans);
     answerBox.value = "";
     alphas:
     for (var i=0;i<invadersAlphas.length;i++) {
       if (!invadersAlphas[i].active)
          continue;
       answers:
       for(var j=0;j<invadersAlphas[i].answers.length;j++) {
          if (ans == invadersAlphas[i].answers[j]) {
             // possible race condition with mult answers searched at once?
             displayWord_inv(invadersAlphas[i], [ans]);
             invadersAlphas[i].answers = invadersAlphas[i].answers.filter(function(el) {return (el != ans); });
             found = true;
             break alphas;
          }
       }
      }
      if (found) {
       $('#answerBox').css('background', 'lightgreen'); 
      } else { $('#answerBox').css('background', 'yellow'); }
      setTimeout(function() { $('#answerBox').css('background', 'url("b34.png") repeat');}, 200);
    }
}
    
function getAlpha_inv() {

// also need to lock words as we grab them

  var d = { numQuestions: 1, user: userid, lock: true };
  $.ajax({ type: "POST",
         url: "getQuestion.py",
         data: JSON.stringify(d),
       success: function (response, responseStatus) {
              var r = response[0];
              var question = r.questions;
              var words = r.words;
              var cardbox = r.aux[0].cardbox;
              var alphagram = Object.keys(question)[0];
              if (r.getFromStudyOrder) 
                prepareNewWords();
              var newAlpha = new alpha_inv(alphagram, words, cardbox);        
              invadersAlphas.push(newAlpha);
              gettingWord_inv = false;
              },
       error: function(jqXHR, textStatus, errorThrown) {
                  console.log("Error status = " + textStatus + " Error Thrown " + errorThrown); }});

}

function noCollision(a, b) {
if (a.leftx < b.leftx + b.width  && a.leftx + a.width > b.leftx && a.y < b.y + b.height && a.y + a.height > b.y) 
   return false;
else return true;
}

function markAsCorrect_inv(alphaObj) {

  currentScore++;
  // mark as correct in cardbox
  if (currentScore > personalHighScore) {
    personalHighScore = currentScore; }
  if (currentScore > dailyHighScore) {
    dailyHighScore = currentScore; }
  var d = {user: userid, question: alphaObj.alphagram, correct: true, cardbox: alphaObj.cardbox, incrementQ: true};
  slothSubmitQuestion(d);

}

function markAsIncorrect_inv(alphaObj) {

   var  d = {user: userid, 
         question: alphaObj.alphagram, 
          correct: false, 
          cardbox: alphaObj.cardbox, 
       incrementQ: true};
   slothSubmitQuestion(d);
   console.log(alphaObj.alphagram + " marked wrong.");
   displayWord_inv(alphaObj, alphaObj.words);
}

function animateAlphas_inv(previousTime, currentTime, lastWordTime) {

    if (!document.getElementById("invadersCanvas"))  {
    // we have navigated away from the screen mid-game
         endGame_inv(false, false);
         return; }
    if (invaderStatus != "started") 
         return;
   
    var activeAlphas = invadersAlphas.filter(function(el) { return el.active; });
    if ((activeAlphas.length == 0 || currentTime-lastWordTime > WORD_FREQ) && !gettingWord_inv) {
       getAlpha_inv();
       gettingWord_inv = true;
       lastWordTime = currentTime; }

    if (gettingWord_inv) lastWordTime = currentTime;

    // need to skip the rest gracefully when invadersAlphas is empty


    if (invadersAlphas.length == 0) {
          requestAnimationFrame(function(timestamp) {
              animateAlphas_inv(currentTime, timestamp, lastWordTime);
          });
          return;
       }
       

    // deal with any completed questions

    for (var i=0;i<invadersAlphas.length;i++) {
       if (invadersAlphas[i].answers.length == 0) {
         markAsCorrect_inv(invadersAlphas[i]);
         // the explosion image is centered in a 64x64 square
         // so we want the center of the animation frame to be the alpha X,Y
         var newExplosion = explosion_inv({x: invadersAlphas[i].x-32, y: invadersAlphas[i].y-60});
         explosions.push(newExplosion);
         if (localStorage.soundEnabled == "true") 
            explosion_sound.play();
         delete invadersAlphas[i]; } }
    invadersAlphas = invadersAlphas.filter(Boolean);

    // clear the screen
    ctx.drawImage(invaderBgImg, 0, 0);

    // display the explosions
      for(i=0;i<explosions.length;i++) {
         explosions[i].render(currentTime-previousTime);
         if (explosions[i].done)
            delete explosions[i]
         }
      explosions = explosions.filter(Boolean); 
        
  
    // display the alphagrams
       ctx.font = "20px courier";
       ctx.textAlign = "center";
 
    for (i=0;i<invadersAlphas.length;i++) {
       if (invadersAlphas[i].active) {
       ctx.fillStyle = COLOR_LIST[invadersAlphas[i].answers.length];
       } else {
       ctx.fillStyle = "grey";
       ctx.fillRect(invadersAlphas[i].leftx, invadersAlphas[i].y-ALPHA_HEIGHT+2, invadersAlphas[i].alphagram.length*LETTER_WIDTH, ALPHA_HEIGHT);
       ctx.fillStyle = COLOR_LIST[0]; }
//       ctx.fillText(invadersAlphas[i].alphagram, invadersAlphas[i].x, invadersAlphas[i].y);
       ctx.fillText(alphaSortMethod(invadersAlphas[i].alphagram, Number(localStorage.gAlphaSortInput)), invadersAlphas[i].x, invadersAlphas[i].y);
    }

    // display high scores
       ctx.fillStyle = "white";
       ctx.font = "14px courier";
       ctx.textAlign = "left";
       ctx.fillText("Score: " + currentScore, 1, INVH-2);
       ctx.fillText("High: " + personalHighScore, 101, INVH-2);
       ctx.fillText("Daily High: " + dailyHighScore, 201, INVH-2);
       drawSoundIcon_inv();
    // check for collisions, update positions
    for (i=invadersAlphas.length-1;i>=0;i--) {
       var clear = true;
       for(var j=i-1;j>=0;j--) 
         clear = clear && noCollision(invadersAlphas[i], invadersAlphas[j]);
       if (!clear && invadersAlphas[i].y - invadersAlphas[i].height <= 0) { // game over
         invaderStatus = "gameover";
         document.getElementById("showWordsInv").innerHTML = "<tr><td>*** GAME OVER ***";
         endGame_inv(false, false);
         return;
       } 
       if (clear && invadersAlphas[i].y < INVH-25) {
          var deltay = (currentTime-previousTime)/FALL_SPEED;
          if (deltay > 1.0) {
            invadersAlphas[i].y += 1.0;
          } else { invadersAlphas[i].y += deltay; }
       }
       if(invadersAlphas[i].timeout <= 0 && invadersAlphas[i].active == true) {
          markAsIncorrect_inv(invadersAlphas[i]);
          invadersAlphas[i].active = false; }
       else if (currentTime-previousTime > 50) 
               invadersAlphas[i].timeout -= 50;
            else invadersAlphas[i].timeout -= (currentTime-previousTime);
    } 
    requestAnimationFrame(function(timestamp) {
        animateAlphas_inv(currentTime, timestamp, lastWordTime);
    });
}
  
function alpha_inv(alphagram, answers, cardbox) {

  // answers is an object: { "WORD": [ aux info ... ], etc }
  this.width = alphagram.length * LETTER_WIDTH;
  this.height = ALPHA_HEIGHT; 
  this.leftx = (Math.round(Math.random() * ((INVW/LETTER_WIDTH) - alphagram.length)) * LETTER_WIDTH);
  this.x = this.leftx + this.width/2;
  this.y = 1.0;
  this.alphagram = alphagram;
  this.answers = Object.keys(answers);
  this.words = this.answers.slice();
  this.wordAuxInfo = answers;
  this.cardbox = cardbox;
  this.timeout = 60000; // 60 seconds
  this.active = true;

}

function endGame_inv (restart, pause) {
  
  var d;
  if (currentScore >= personalHighScore || currentScore >= dailyHighScore) {
  d = { userid: userid, score: currentScore };
  $.ajax({type: "POST",
         data: JSON.stringify(d),
         url: "setInvaderHighScores.py",
         success: function(response, responseStatus) {
                      result = response[0];
                      personalHighScore = result.personal;
                      dailyHighScore = result.daily.score; },
	 error: function(jqXHR, textStatus, errorThrown) {
	      console.log("Error, status = " + textStatus + " error: " + errorThrown); 
              }} );
   }

   if (currentScore >= dailyHighScore && !pause) {
     submitChat(username + " has set a new high score of " + currentScore + " for today in Cardbox Invaders!", true, 2);
   }
         
   if (restart) 
     initInvaders();

}

function displayWord_inv(alphaObj, words) {

console.log("displaying " + words[0]);
var table = document.getElementById("showWordsInv");
while(table.rows[0]) table.deleteRow(0);
for (var x=0;x<words.length;x++) {
  var data = getTableLineData(words[x], eval("alphaObj.wordAuxInfo." + words[x]));
  var row = table.insertRow(-1);
  var cells = [ ];
  var cellClassList = [" wordTableLeftHook", " wordTableInnerLeft", " wordTableWord", " wordTableInnerRight", " wordTableRightHook", " wordTableDefinition"];

for(var i=0;i<6;i++) {
  cells[i] = row.insertCell(i);
  cells[i].className += cellClassList[i];
  cells[i].innerHTML = data[i];
  }
}
  clearTimeout(clearAnswersTimer_inv);
  clearAnswersTimer_inv = setTimeout(function () { t = document.getElementById("showWordsInv");
                                                   while(t.rows[0]) t.deleteRow(0);}, 5000);
}

function explosion_inv (options) {

  var that = {};
  // ctx is the Invaders canvas
  // The image we have is 8x8 frames, 512x512 pixels
  // Whole animation will last ~2 seconds; 30ms per frame
  console.log("Explosion created");
  that.context = ctx;
  that.frame = 0;
  that.timeElapsed = 0;
  that.width = 64;
  that.height = 64;
  that.x = options.x;
  that.y = options.y;
  that.numberOfFrames = 64;
  that.done = false;
  that.image = explosionImg;
  that.render = function(tick) { 
                  that.done = (that.frame >= that.numberOfFrames);
                  if (!that.done) {
                  that.context.drawImage( that.image, 
                                          (that.frame%8)*64, Math.trunc(that.frame/8)*64,  // source X, Y
                                          that.width, that.height,  // source width, height
                                          that.x, that.y, //canvas x, y
                                          that.width, that.height); // canvas width, height
                  that.timeElapsed += tick;
                  that.frame = Math.trunc(that.timeElapsed/30);
                 }
                 return 0;
                 };
  return that;
}

function drawSoundIcon_inv () {

          var soundIcon;
          if (localStorage.musicEnabled == "true")
             soundIcon = "🎵";
          else if (localStorage.soundEnabled == "true")
             soundIcon = "🔈";
          else soundIcon = "🔇";
     
          ctx.beginPath();
          ctx.rect(INVW-30, INVH-25, 30, 25);
          ctx.fillStyle = "black";
          ctx.fill();
          ctx.fillStyle = "white";
          ctx.fillText(soundIcon, INVW-20, INVH-2); 
}
