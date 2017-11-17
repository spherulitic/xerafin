function initPhantasy() {
    /** AJaX call to unlock questions from previous game **/
    var d = { user: userid };
    $.ajax({
        type: "POST",
        data: JSON.stringify(d),
        url: "newQuiz.py",
        success: initPhantasy2,
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("Error, status = " + textStatus + " error: " + errorThrown);
            initInvaders2();
        }
    });
}


function initPhantasy2() {

  console.log("Starting Phantasy");
  COLOR_LIST = [ "black", "azure", "mediumorchid", "palegreen", "yellowgreen", "khaki", "salmon", "hotpink", "crimson", "magenta", "orange", "peachpuff", "mistyrose", "floralwhite" ] // maximum number of anagrams is 13
  gameState = "intro"; // "intro", "menu", "battle"

  // in case a quiz was underway
  stopScrollTimer();
  resetHookWidthsQuiz();
  var gameArea = document.getElementById("gameArea");
  $('#gameArea').empty();
 
  var canvas = document.createElement("canvas");
  canvas.id = "phantasyCanvas";
  INVW = 360;
  INVH = 360;
  ANSWER_Y = 275;
  answer_x = 5;
  canvas.width = INVW;
  canvas.height = INVH;
  canvas.style = "border: 1px;";
  canvas.tabIndex = "1";
  canvas.onclick = function (e) {
         document.getElementById("phantasyCanvas").focus();
       };
  canvas.addEventListener('keydown', function(e) {
              if (e.keyCode == 32)
                 e.preventDefault();
              switch(gameState) {
              case "intro" :
                  gameState = "menu";
                  break;
              }
              }
  );

  // init player object
  ctx = canvas.getContext('2d');
  var playerIdle = new Image();
  playerIdle.src = "images/phantasy/idle.png";

  player = { 
  playerIdle: playerIdle,
  timer: 0,
  state: "idle",
  display: function(elapsed) {
      switch(this.state) {
      case "idle":
           var frame = Math.trunc(this.timer/83)%10; // 83 ms per frame ~ 12 fps 
           ctx.drawImage( this.playerIdle, 
                          frame*60, // 10 frames horizonal, 60px each
                          0, // one row
                          60, 72, // sprite is 60x72
                          20, 150, // canvas x, y
                          60, 72); // size on canvas
           this.timer += elapsed;
           break;
       }}
   };
         
  phantasyBgImg = new Image();
  phantasyBgImg.onload = function() { requestAnimationFrame(function(now) {animationLoop_ph(now, now);})};
  
  phantasyBgImg.src = "images/phantasybackground.png";


  gameArea.appendChild(canvas);
}

function animationLoop_ph (previousTime, currentTime) {

  if (!document.getElementById("phantasyCanvas")) {
      // we have navigated away from the screen mid-game
      endGame_ph();
      return; }
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, 360, 360);
      ctx.drawImage(phantasyBgImg, 0, 0); 
  switch(gameState) {
    case "intro":
        ctx.textAlign = "center";
 ctx.font         = '68px Alegreya SC';
        var g = ctx.createLinearGradient(0, 0, INVW, 0);
        g.addColorStop("0.0", "orange");
        g.addColorStop("0.5", "magenta");
        g.addColorStop("1.0", "orange");
        ctx.fillStyle = g;
        ctx.fillText("Phantasy", INVW/2, 120);
        ctx.fillText("Cardbox", INVW/2, 170);
        ctx.fillStyle = "orange";
        ctx.font = "20px Alegreya SC";
        ctx.fillText("Press Any Key To Begin", INVW/2, 250);
        break;
     case "menu":
        player.display(currentTime-previousTime);
        break;
     }
  requestAnimationFrame(function (now) { animationLoop_ph(currentTime, now);});   
}

//    var activeAlphas = invadersAlphas.filter(function(el) { return el.active; });
//    if ((activeAlphas.length == 0 || currentTime-lastWordTime > WORD_FREQ) && !gettingWord_inv) {
//       getAlpha_inv();
//       gettingWord_inv = true;
//       lastWordTime = currentTime; }
//
//    if (gettingWord_inv) lastWordTime = currentTime;
//
//    // need to skip the rest gracefully when invadersAlphas is empty
//
//
//    if (invadersAlphas.length == 0) {
//          requestAnimationFrame(function(timestamp) {
//              animateAlphas_inv(currentTime, timestamp, lastWordTime);
//          });
//          return;
//       }
//       
//
//    // deal with any completed questions
//
//    for (var i=0;i<invadersAlphas.length;i++) {
//       if (invadersAlphas[i].answers.length == 0) {
//         markAsCorrect_inv(invadersAlphas[i]);
//         // the explosion image is centered in a 64x64 square
//         // so we want the center of the animation frame to be the alpha X,Y
//         var newExplosion = explosion_inv({x: invadersAlphas[i].x-32, y: invadersAlphas[i].y-60});
//         explosions.push(newExplosion);
//         if (localStorage.soundEnabled == "true") 
//            explosion_sound.play();
//         delete invadersAlphas[i]; } }
//    invadersAlphas = invadersAlphas.filter(Boolean);
//
//    // clear the screen
//    ctx.drawImage(invaderBgImg, 0, 0);
//
//    // display the explosions
//      for(i=0;i<explosions.length;i++) {
//         explosions[i].render(currentTime-previousTime);
//         if (explosions[i].done)
//            delete explosions[i]
//         }
//      explosions = explosions.filter(Boolean); 
//        
//  
//    // display the alphagrams
//       ctx.font = "20px courier";
//       ctx.textAlign = "center";
// 
//    for (i=0;i<invadersAlphas.length;i++) {
//       if (invadersAlphas[i].active) {
//       ctx.fillStyle = COLOR_LIST[invadersAlphas[i].answers.length];
//       } else {
//       ctx.fillStyle = "grey";
//       ctx.fillRect(invadersAlphas[i].leftx, invadersAlphas[i].y-ALPHA_HEIGHT+2, invadersAlphas[i].alphagram.length*LETTER_WIDTH, ALPHA_HEIGHT);
//       ctx.fillStyle = COLOR_LIST[0]; }
////       ctx.fillText(invadersAlphas[i].alphagram, invadersAlphas[i].x, invadersAlphas[i].y);
//       ctx.fillText(alphaSortMethod(invadersAlphas[i].alphagram, Number(localStorage.gAlphaSortInput)), invadersAlphas[i].x, invadersAlphas[i].y);
//    }
//
//    // display high scores
//       ctx.fillStyle = "white";
//       ctx.font = "14px courier";
//       ctx.textAlign = "left";
//       ctx.fillText("Score: " + currentScore, 1, INVH-2);
//       ctx.fillText("High: " + personalHighScore, 101, INVH-2);
//       ctx.fillText("Daily High: " + dailyHighScore, 201, INVH-2);
//       drawSoundIcon_inv();
//    // check for collisions, update positions
//    for (i=invadersAlphas.length-1;i>=0;i--) {
//       var clear = true;
//       for(var j=i-1;j>=0;j--) 
//         clear = clear && noCollision(invadersAlphas[i], invadersAlphas[j]);
//       if (!clear && invadersAlphas[i].y - invadersAlphas[i].height <= 0) { // game over
//         invaderStatus = "gameover";
//         document.getElementById("showWordsInv").innerHTML = "<tr><td>*** GAME OVER ***";
//         endGame_inv(false, false);
//         return;
//       } 
//       if (clear && invadersAlphas[i].y < INVH-25) {
//          var deltay = (currentTime-previousTime)/FALL_SPEED;
//          if (deltay > 1.0) {
//            invadersAlphas[i].y += 1.0;
//          } else { invadersAlphas[i].y += deltay; }
//       }
//       if(invadersAlphas[i].timeout <= 0 && invadersAlphas[i].active == true) {
//          markAsIncorrect_inv(invadersAlphas[i]);
//          invadersAlphas[i].active = false; }
//       else if (currentTime-previousTime > 50) 
//               invadersAlphas[i].timeout -= 50;
//            else invadersAlphas[i].timeout -= (currentTime-previousTime);
//    } 
//    requestAnimationFrame(function(timestamp) {
//        animateAlphas_inv(currentTime, timestamp, lastWordTime);
//    });
//}


//function submitInvadersAnswer() {
//
//  console.log("Submit Answer");
//  if (invaderStatus == 'paused') {
//    document.getElementById("pauseButton").innerHTML = "Pause"; }
//  if (invaderStatus == 'finished' || invaderStatus == 'paused') {
//    invaderStatus = 'started';
//    ctx.font = '20px courier';
//    requestAnimationFrame(function(timestamp) {
//        animateAlphas_inv(timestamp, timestamp, timestamp);
//    });
//  } else if (invaderStatus == 'started')  {
//     var ans = answerBox.value.toUpperCase().trim();
//     var found = false;
//     console.log("Answer submitted: " + ans);
//     answerBox.value = "";
//     alphas:
//     for (var i=0;i<invadersAlphas.length;i++) {
//       if (!invadersAlphas[i].active)
//          continue;
//       answers:
//       for(var j=0;j<invadersAlphas[i].answers.length;j++) {
//          if (ans == invadersAlphas[i].answers[j]) {
//             // possible race condition with mult answers searched at once?
//             displayWord_inv(invadersAlphas[i], [ans]);
//             invadersAlphas[i].answers = invadersAlphas[i].answers.filter(function(el) {return (el != ans); });
//             found = true;
//             break alphas;
//          }
//       }
//      }
//      if (found) {
//       $('#answerBox').css('background', 'lightgreen'); 
//      } else { $('#answerBox').css('background', 'yellow'); }
//      setTimeout(function() { $('#answerBox').css('background', 'url("images/b34.png") repeat');}, 200);
//    }
//}
//    
//function getAlpha_inv() {
//
//// also need to lock words as we grab them
//
//  var d = { numQuestions: 1, user: userid, lock: true };
//  $.ajax({ type: "POST",
//         url: "getQuestion.py",
//         data: JSON.stringify(d),
//       success: function (response, responseStatus) {
//              var r = response[0];
//              var question = r.questions;
//              var words = r.words;
//              var cardbox = r.aux[0].cardbox;
//              var alphagram = Object.keys(question)[0];
//              if (r.getFromStudyOrder) 
//                prepareNewWords();
//              var newAlpha = new alpha_inv(alphagram, words, cardbox);        
//              invadersAlphas.push(newAlpha);
//              gettingWord_inv = false;
//              },
//       error: function(jqXHR, textStatus, errorThrown) {
//                  console.log("Error status = " + textStatus + " Error Thrown " + errorThrown); }});
//
//}
//
//function markAsCorrect_inv(alphaObj) {
//
//  currentScore++;
//  // mark as correct in cardbox
//  if (currentScore > personalHighScore) {
//    personalHighScore = currentScore; }
//  if (currentScore > dailyHighScore) {
//    dailyHighScore = currentScore; }
//  var d = {user: userid, question: alphaObj.alphagram, correct: true, cardbox: alphaObj.cardbox, incrementQ: true};
//  slothSubmitQuestion(d);
//
//}
//
//function markAsIncorrect_inv(alphaObj) {
//
//   var  d = {user: userid, 
//         question: alphaObj.alphagram, 
//          correct: false, 
//          cardbox: alphaObj.cardbox, 
//       incrementQ: true};
//   slothSubmitQuestion(d);
//   console.log(alphaObj.alphagram + " marked wrong.");
//   displayWord_inv(alphaObj, alphaObj.words);
//}
//
//  
//function alpha_inv(alphagram, answers, cardbox) {
//
//  // answers is an object: { "WORD": [ aux info ... ], etc }
//  this.width = alphagram.length * LETTER_WIDTH;
//  this.height = ALPHA_HEIGHT; 
//  this.leftx = (Math.round(Math.random() * ((INVW/LETTER_WIDTH) - alphagram.length)) * LETTER_WIDTH);
//  this.x = this.leftx + this.width/2;
//  this.y = 1.0;
//  this.alphagram = alphagram;
//  this.answers = Object.keys(answers);
//  this.words = this.answers.slice();
//  this.wordAuxInfo = answers;
//  this.cardbox = cardbox;
//  this.timeout = 60000; // 60 seconds
//  this.active = true;
//
//}
//
//function endGame_inv (restart, pause) {
//  
//  var d;
//  if (currentScore >= personalHighScore || currentScore >= dailyHighScore) {
//  d = { userid: userid, score: currentScore };
//  $.ajax({type: "POST",
//         data: JSON.stringify(d),
//         url: "setInvaderHighScores.py",
//         success: function(response, responseStatus) {
//                      result = response[0];
//                      personalHighScore = result.personal;
//                      dailyHighScore = result.daily.score; 
//
//                      if (currentScore >= dailyHighScore && !pause) {
//                            submitChat(username + " has set a new high score of " + currentScore + " for today in Cardbox Invaders!", true, 2);
//                      }
//                  },
//	 error: function(jqXHR, textStatus, errorThrown) {
//	      console.log("Error, status = " + textStatus + " error: " + errorThrown); 
//              }} );
//   }
//
//         
//   if (restart) 
//     initInvaders();
//
//}
//
//function displayWord_inv(alphaObj, words) {
//
//console.log("displaying " + words[0]);
//var table = document.getElementById("showWordsInv");
//while(table.rows[0]) table.deleteRow(0);
//for (var x=0;x<words.length;x++) {
//  var data = getTableLineData(words[x], eval("alphaObj.wordAuxInfo." + words[x]));
//  var row = table.insertRow(-1);
//  var cells = [ ];
//  var cellClassList = [" wordTableLeftHook", " wordTableInnerLeft", " wordTableWord", " wordTableInnerRight", " wordTableRightHook", " wordTableDefinition"];
//
//for(var i=0;i<6;i++) {
//  cells[i] = row.insertCell(i);
//  cells[i].className += cellClassList[i];
//  cells[i].innerHTML = data[i];
//  }
//}
//  clearTimeout(clearAnswersTimer_inv);
//  clearAnswersTimer_inv = setTimeout(function () { t = document.getElementById("showWordsInv");
//                                                   while(t.rows[0]) t.deleteRow(0);}, 5000);
//}
//
//function explosion_inv (options) {
//
//  var that = {};
//  // ctx is the Invaders canvas
//  // The image we have is 8x8 frames, 512x512 pixels
//  // Whole animation will last ~2 seconds; 30ms per frame
//  console.log("Explosion created");
//  that.context = ctx;
//  that.frame = 0;
//  that.timeElapsed = 0;
//  that.width = 64;
//  that.height = 64;
//  that.x = options.x;
//  that.y = options.y;
//  that.numberOfFrames = 64;
//  that.done = false;
//  that.image = explosionImg;
//  that.render = function(tick) { 
//                  that.done = (that.frame >= that.numberOfFrames);
//                  if (!that.done) {
//                  that.context.drawImage( that.image, 
//                                          (that.frame%8)*64, Math.trunc(that.frame/8)*64,  // source X, Y
//                                          that.width, that.height,  // source width, height
//                                          that.x, that.y, //canvas x, y
//                                          that.width, that.height); // canvas width, height
//                  that.timeElapsed += tick;
//                  that.frame = Math.trunc(that.timeElapsed/30);
//                 }
//                 return 0;
//                 };
//  return that;
//}
