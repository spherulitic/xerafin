function startQuiz() {
    
    /** Initialisation Variables **/
    
    alphagram = "";
    totalAnswers = 0;
    textFocus = true;
    incorrectAnswerFlag = false;
    incrementQ = true;
    correctProgress = 0;
    correctState = 0;
    console.log("Starting Quiz");
    correctPercent = 0.0;
    lastAlphaState = 0;
    
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
    var sessionHeaderClasses = ['', ' quizSessionTableHCardbox', ' quizSessionTableHDue', '', ' quizSessionTableHCorrect']
    var sessionContentCell = [];
    var sessionContentContent = ['<span id="questionsComplete">' + localStorage.qQCounter + '</span>', '<span id="cardboxNumber"></span>', 
    '<span id="dueDate"></span>', '<span id="sessionScore">' + localStorage.qQAlpha + '</span>', '<span id="correctPercent">' + correctPercent.toFixed(2) + '%' + '</span>'];
    for (var i = 0; i < 5; i++) {
        sessionHeaderCell[i] = document.createElement('th');
        sessionHeaderCell[i].innerHTML = sessionHeaderContent[i];
        sessionHeaderCell[i].className += sessionHeaderClasses[i];
        sessionContentCell[i] = document.createElement('td');
        sessionContentCell[i].innerHTML = sessionContentContent[i];
        sessionHeader.appendChild(sessionHeaderCell[i]);
        sessionContent.appendChild(sessionContentCell[i]);
    }
    sessionHeaderCell[4].title = '% of questions answered correctly this session.';
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
    var buttonRow = document.createElement("div");
    var counterReset = document.createElement("button");
    var shuffleButton = document.createElement("button");
    var skipButton = document.createElement("button");
    
    /** Styling & ID initialisation **/
    alphaSuper.id = "alphaSuper";
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
    markAsCorrect.className += ' quizButton quizButtonCorrect';
    markAsCorrect.title = "Mark as Correct";
    markAsCorrect.innerHTML = '&#10004;';
    markAsCorrect.onclick='';
    nextQuestion.id = "nextQuestion";
    nextQuestion.className += ' quizButton quizButtonNext';
    nextQuestion.innerHTML = '&#10144;';
    nextQuestion.style.display = 'none';
    nextQuestion.title = "Next Question";
    markAsIncorrect.id = 'markAsIncorrect';
    markAsIncorrect.title = "Mark as Incorrect";
    markAsIncorrect.className += ' quizButton quizButtonIncorrect';
    markAsIncorrect.innerHTML = '✘';
    markAsIncorrect.onclick='';
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
    buttonRow.id = "buttonRow";
    buttonRow.style.display = 'inline-block';
    buttonRow.style.width = '100%';
    buttonRow.style.marginTop = '20px';
    buttonRow.style.textAlign = 'center';
    
    counterReset.id = "counterReset";
    counterReset.innerHTML = "Reset Counters";
    counterReset.style.cssFloat = 'right';
    shuffleButton.id = "shuffleButton";
    shuffleButton.innerHTML = "Shuffle";
    shuffleButton.style.cssFloat = 'left';
    skipButton.innerHTML = 'Skip';
    skipButton.id = 'skipButton';
    
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
    gameArea.appendChild(buttonRow);
    buttonRow.appendChild(shuffleButton);
    buttonRow.appendChild(counterReset);
    buttonRow.appendChild(skipButton);
    if ((Number(localStorage.gAlphaDisplay))==1) {
        alphagramLabel.style.fontSize='2.8em';
        alphagramLabel.style.lineHeight='0em';
        alphagramLabel.style.paddingTop='0.8em';
        alphagramLabel.style.paddingBottom='0.8em';
        }
    /** Event Listeners **/
    $('#nextQuestion').click(function() {
        textFocus = false;
        getQuestion();
    });
    $('#counterReset').click(function() {
        localStorage.qQCounter = '0';
        localStorage.qQCorrect = '0';
        localStorage.qQAlpha = '0';
        $('#questionsComplete').html(Number(localStorage.qQCounter));
        $('#sessionScore').html(Number(localStorage.qQAlpha));
        $('#correctPercent').html('0.00%');
    });
    $('#shuffleButton').click(function() {
        if ((Number(localStorage.gAlphaDisplay))==0) {stringToTiles(alphaShuffle(alphagram), '#alphagram')
       }
        else {$('#alphagram').html(alphaShuffle(alphagram));}       
    });
    $('#skipButton').click(skipQuestion);
    markAsIncorrect.addEventListener("click", function(e) {
        submitQuestion(false)
    });
    answerBox.addEventListener("keypress", function(e) {
        if (e.which === 13) {
            //	re-enable this in getQuestion() so it happens after the 
            //	asynchronous call finishes
            $(this).attr("disabled", "disabled");
            submitAnswer();
        }
    });
    $('#answerBox').keypress("m",function(e) {
        if(e.ctrlKey) 
        $(this).val("");
    });
    $('#answerBox').keypress(function(e) {
        if (e.which == 32) {
           if (quizState !== "finished"){
                $(this).attr("disabled", "disabled");
                submitAnswer();
            }
        }
    });
    window.addEventListener('resize', function(event){
        if ( $( "#tileContainer" ).length ){
            var subAlpha = '';
            $.each($('#tileContainer').find('[id^=tile]'), function() {
            subAlpha += $(this).text();
            stringToTiles(subAlpha, '#alphagram');
        })
        }
    })  
    $('#markAsCorrect').on('click', null , true, submitQuestion);
    /** AJaX call to get question **/
    /** newQuiz.py refreshes the quiz, ie, you start to get things
 *  from the lowest cardbox again **/
    var d = {
        user: userid
    };
    $.ajax({
        type: "POST",
        data: JSON.stringify(d),
        url: "newQuiz.py",
        success: getQuestion,
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("Error, status = " + textStatus + " error: " + errorThrown);
            getQuestion();
        }
    });
}

function getQuestion() {
    $('#nextQuestion').off("click");
    var d = {
        numQuestions: 1,
        user: userid
    };
    $.ajax({
        type: "POST",
        url: "getQuestion.py",
        data: JSON.stringify(d),
        success: displayQuestion,
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("Error, status = " + textStatus + " error: " + errorThrown)
            if (typeof scrollTimer !== 'undefined' && scrollTimer !== null )
                clearInterval(scrollTimer);
            $('#alphagram').html('Connection Error');
            $('#answerBox').removeAttr("disabled", "disabled");
            $('#nextQuestion').click(function() {
                textFocus = false;
                getQuestion();
            });
        }
    });
    correctState = 0;
   
}

function displayQuestion(response, responseStatus) {
    console.log("Question Response");
    if (typeof scrollTimer !== 'undefined' && scrollTimer !== null )
        clearInterval(scrollTimer);
    var r = response[0];
    console.log(r);
    var question = r.questions;
    wordData = r.words;
    aux = r.aux[0];
    if (r.getFromStudyOrder) {
        d = {
            userid: userid
        };
        $.ajax({
            type: "POST",
            url: "prepareNewWords.py",
            data: JSON.stringify(d),
            success: function(response, responseStatus) {
                console.log("Next Added table prepared.");
                console.log(response);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("Error preparing Next Added");
            }
        });
    }
    if (Object.keys(question)[0] == alphagram && quizState == "finished") {
        setTimeout(getQuestion, 700)
        // the previous question took too long
        // to submit, so we need to wait to get a fresh one
        $('#answerBox').val("Loading Question ...");
    } else {
        correctProgress = 0;
        
        document.getElementById('shuffleButton').disabled = false;
        document.getElementById('skipButton').disabled = false;
        alphagram = Object.keys(question)[0];
        answers = eval("question." + alphagram);
        allAnswers = answers.slice();
        hookWidth = 0;
        for (i=0;i<allAnswers.length;i++){   
            $('#leftHook').html(addLineBreaks(eval('wordData.'+allAnswers[i]+'[0]'), 7));
            var x=$('#leftHook').width();
            if (x>hookWidth){hookWidth=x;}
            $('#leftHook').html(addLineBreaks(eval('wordData.'+allAnswers[i]+'[1]'), 7));
            var x=$('#leftHook').width();
            if (x>hookWidth){hookWidth=x;}
        }       
        $('#rightHook').width(hookWidth);
        $('#leftHook').width(hookWidth);
        $('#leftHook').html('');
        document.getElementById('nextQuestion').disabled = false;
        if ((Number(localStorage.gAlphaDisplay))==0) {
            stringToTiles(alphaSortMethod(alphagram, Number(localStorage.gAlphaSortInput)), '#alphagram');
            $('#alphaSuper').css('background', '#5ab');
        }
        else {
            $('#alphagram').html(alphaSortMethod(alphagram, Number(localStorage.gAlphaSortInput)));
            $('#alphaSuper').css('background', 'url("b42.png") repeat');
        } 
        
        $('#leftHook').html("&nbsp;");
        $('#rightHook').html("&nbsp;");
        $('#correctAnswers').html("");
        $('#wrongAnswers').html("");
        $('#answerBox').val("");
        $('#answerBox').removeAttr("disabled", "disabled");
        $('#nextQuestion').click(function() {
            textFocus = false;
            document.getElementById('nextQuestion').disabled = true;
            getQuestion();
        });
        if (textFocus)
            $('#answerBox').focus();
        textFocus = true;
        var dueDate = new Date(aux.nextScheduled * 1000);
        $('#dueDate').html(formatDateForDisplay(dueDate));
        $('#cardboxNumber').html(aux.cardbox);
        if (localStorage.qQCounter > 0)
            correctPercent = (localStorage.qQCorrect / localStorage.qQCounter) * 100;
        $('#correctPercent').html(correctPercent.toFixed(2) + '%');
        totalAnswers = Object.keys(wordData).length;
        $('#answerAmount').html('<b>Answers:</b> ' + correctProgress + '  of ' + totalAnswers);
        $('#nextQuestion').hide();
        $('#markAsCorrect').show();
        $('#markAsIncorrect').show();
        quizState = "started";
        incorrectAnswerFlag = false;
        incrementQ = true;
    }
}

function submitAnswer() {
    
    if (quizState == "finished") {
        getQuestion();
    } 
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
            else {
                console.log("Incorrect Answer");
                if ($.inArray(answer, allAnswers) >= 0 || toAlpha(answer) != alphagram)
                    $('#answerBox').css('background', 'yellow');
                else {
                    $('#answerBox').css('background', 'red');
                    incorrectAnswerFlag = true;
                    document.getElementById("wrongAnswers").innerHTML += answer + " ";
                }
                setTimeout(function() {
                    $('#answerBox').css('background', 'url("b34.png") repeat');
                }, 200);
            }
            document.getElementById("answerBox").value = "";
        }
        $('#answerBox').removeAttr("disabled", "disabled");
        $('#answerBox').focus();
    }
}
function checkMilestones(answered) {
    var ranges = [[50, 49, 301], [100, 301, 1001], [200, 1001, 50000]]
    for (var i = 0; i < ranges.length; i++) {
        if ((answered % (ranges[i][0]) == 0) && (answered > ranges[i][1]) && (answered < ranges[i][2])) {
            submitChat(username + " has completed <b>" + answered + "</b> alphagrams today!", true);
        }
    }
}
function adjustAlphaChange(corrected, states) {
    var adjustment = [[0 - aux.cardbox, 0 - aux.cardbox - 1], [1, (aux.cardbox + 1)]];
    var a = (corrected) ? 1 : 0;
    localStorage.qQAlpha = Number(localStorage.qQAlpha) + adjustment[a][states];
}

function skipQuestion() {
    document.getElementById('skipButton').disabled = true;
    var d = {user: userid, question: alphagram};
    $.ajax({ type: "POST",
             url: "delayQuestion.py",
             data: JSON.stringify(d),
            success: function(response, responseStatus) { 
                      console.log(alphagram + " delayed. ");
                      getQuestion(); },
         error: function(jqXHR, textStatus, errorThrown) {
            document.getElementById('skipButton').disabled = false;
            console.log("Error: question " + alphagram + " could not be updated. " + errorThrown + " " + textStatus);
             }});
}


function submitQuestion(correct) {
    document.getElementById('shuffleButton').disabled = true;
    document.getElementById('skipButton').disabled = true;
    var failFlag = false;
    d = {
        user: userid,
        question: alphagram,
        correct: correct,
        cardbox: aux.cardbox,
        incrementQ: incrementQ
    };
    $.ajax({
        type: "POST",
        url: "submitQuestion.py",
        data: JSON.stringify(d),
        success: function(response, responseStatus) {
            console.log("Question " + alphagram + " updated in cardbox.");
            if ((response[0].qAnswered !== null ) ) {
                if (incrementQ) {
                    checkMilestones(response[0].qAnswered);
                    incrementQ = false;
                }
            } 
            else {
                failFlag = true;
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("Error: question " + alphagram + " could not be updated.");
            failFlag = true;
        }
    });
    if (failFlag) {
        failFlag = false;
        submitQuestion(correct);
    }
    if (correct) {
        //console.log("Correct Question");
        $('#alphaSuper').css('background', '#8ABD22');
        $('#markAsCorrect').hide();
        $('#markAsIncorrect').show();
        $('#nextQuestion').show();
        $('#nextQuestion').css('float', 'left');
        if (correctState == 0) {
            if (incrementQ) {
                localStorage.qQCounter++;
            }
        }
        adjustAlphaChange(correct, correctState);
        correctState = 1;
        localStorage.qQCorrect++;
    } 
    else {
        //console.log("Incorrect Question");
        $('#alphaSuper').css('background', '#DD5337');
        $('#markAsIncorrect').hide();
        $('#markAsCorrect').show();
        $('#nextQuestion').show();
        $('#nextQuestion').css('float', 'right');
        if (correctState == 0) {
            if (incrementQ) {
                localStorage.qQCounter++;
            }
        } else {
            localStorage.qQCorrect--;
        }
        adjustAlphaChange(correct, correctState);
        correctState = 1;
    }
    quizState = "finished";
    correctPercent = (localStorage.qQCorrect / localStorage.qQCounter) * 100;
    $('#correctPercent').html(correctPercent.toFixed(2) + '%');
    $('#questionsComplete').html(localStorage.qQCounter);
    $('#sessionScore').html(localStorage.qQAlpha);
    
    for (var x = 0; x < answers.length; x++) {
        displayAnswer(answers[x]);
    }
    answers = [];
    var temp = getWordWithHook(Object.keys(wordData)[0])
    var maxWidths = hookWidth;
    var counter = 0;
    $('#rightHook').width(hookWidth);
    $('#leftHook').width(hookWidth);
    temp[0] = addLineBreaks(temp[0], 7);
    temp[2] = addLineBreaks(temp[2], 7);
    if ((Number(localStorage.gAlphaDisplay))==0) {stringToTiles(temp[1], '#alphagram')}
    else {$('#alphagram').html(temp[1]);}
    $('#leftHook').html(temp[0]);
    $('#rightHook').html(temp[2]);
    /**maxWidths = Math.max($('#rightHook').width(), $('#leftHook').width());**/
   
    console.log(hookWidth);
    if (typeof scrollTimer !== 'undefined' && scrollTimer !== null )
        clearInterval(scrollTimer);
        scrollTimer = setInterval(function() {
        var temp2 = getWordWithHook(allAnswers[counter % allAnswers.length]);
        temp2[0] = addLineBreaks(temp2[0], 7);
        temp2[2] = addLineBreaks(temp2[2], 7);
        $('#rightHook').width(hookWidth);
        $('#leftHook').width(hookWidth);
        if ((Number(localStorage.gAlphaDisplay))==0) {stringToTiles(temp2[1], '#alphagram')}
        else {$('#alphagram').html(temp2[1]);}
        $('#leftHook').html(temp2[0]);
        $('#rightHook').html(temp2[2]);
        /**maxWidths = Math.max($('#rightHook').width(), $('#leftHook').width());**/
       
        counter++;
    }, 2500);
    $('#nextQuestion').show();
}

function displayAnswer(answer) {
    var x = document.getElementById("correctAnswers");
    var dot = "&#183;";
    /** Find row number to insert new answer into **/
    if (document.getElementById("correctAnswers").rows.length > 0) {
        for (var z = 0; z < x.rows.length; z++) {
            if (answer.toUpperCase() < x.rows[z].cells[2].innerHTML) {
                y = z;break;
            } 
            else {y = -1;}
        }
    } 
    else {y = -1;}
    /** create row **/
    var row = x.insertRow(y);
    var cells = [];
    for (var i = 0; i < 6; i++) {
        cells[i] = row.insertCell(i);
    }
    /** clear previously highlighted word and highlight new answer **/
    for (var i = 0; i < x.rows.length; i++) {
        if (document.getElementById("correctAnswers").rows[i].classList.contains('wordTableHighlight')) 
        {document.getElementById("correctAnswers").rows[i].classList.remove('wordTableHighlight');}
    }
    if (quizState !== "finished") {row.className += ' wordTableHighlight';} 
    else {row.className += ' wordTableHighlightWrong';}
    /**Insert Data**/
    data = eval("wordData." + answer);
    var cellClass = [" wordTableLeftHook", " wordTableInnerLeft", " wordTableWord", " wordTableInnerRight", " wordTableRightHook", " wordTableDefinition"];
    var cellContent = [data[0], (data[3][0] ? dot : ""), answer, (data[3][1] ? dot : ""), data[1], data[2]];
    for (var i = 0; i < 6; i++) {
        cells[i].className += cellClass[i];
        cells[i].innerHTML = cellContent[i];
    }
}

function toAlpha(word) {
    return word.split('').sort().join('');
}

function getWordWithHook(word) {
    var result = [eval("wordData." + word)[0], word, eval("wordData." + word)[1]];
    if (result[0] == "") {
        result[0] == "&nbsp;"
    }
    if (result[2] == "") {
        result[2] == "&nbsp;"
    }
    return result;

}

function formatDateForDisplay(d) {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear() + " " + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();

}

function isSubAlpha(a1, a2) {
    // is a1 a sub alphagram of a2
    var idx = 0;
    var result = true;
    for (var x = 0; x < a1.length && result; x++) {
        result = result && ((idx = a2.indexOf(a1.charAt(x), idx)) > -1);
        idx++;
    }
    return result;
}

function getDivisor(item, divideBy) {
    if (divideBy !== 0) {
        return Math.ceil(item.length / divideBy);
    }
}

function addLineBreaks(item, divideBy) {
    var divisor = getDivisor(item, divideBy);
    if (divisor > 1) {
        var splitUp = item;
        var splitPos = Math.ceil(item.length / divisor);
        for (var i = 1; i < divisor; i++) {
            splitUp = splitUp.substr(0, (i * splitPos) + (4 * (i - 1))) + '<br>' + splitUp.substr((i * splitPos) + (4 * (i - 1)));
        }
        return splitUp;
    }
    return item;
}
function alphaSortVC(content, type) {
    var consonants = content.replace(/[aeiou]/ig, '');
    var vowels = content.replace(/[bcdfghjklmnpqrstvwxyz]/ig, '');
    if (type === 0) {
        return vowels + consonants;
    } 
    else {
        return consonants + vowels;
    }
}
function alphaShuffle(content) {
    return content.split('').sort(function() {
        return 0.5 - Math.random()
    }).join('');
}
function alphaSortMethod(content, type) {
    var output = content;
    switch (type) {
    case 0: output = content; break;
    case 1: output = alphaSortVC(content, 0);break;
    case 2: output = alphaSortVC(content, 1);break;
    case 3: output = alphaShuffle(content);break;
    default:output = content;break;
    }
    return output;
}
function drawTile (input,size){
    var tileValue = [1, 3, 3, 2, 1, 4, 2, 4, 1, 8, 5, 1, 3, 1, 1, 3, 10, 1, 1, 1, 1, 4, 4, 8, 4, 10];
}
function stringToTiles(input, parent) {
    var tileLetter = input.split('');
    var tileValue = [1, 3, 3, 2, 1, 4, 2, 4, 1, 8, 5, 1, 3, 1, 1, 3, 10, 1, 1, 1, 1, 4, 4, 8, 4, 10];
    var tiles = [];
    $(parent).html("");
     $(parent).css('width',$('#alphaSuper').width()-$('#leftHook').width()-$('#rightHook').width());
    var tileContainer = document.createElement('div');


    var x = getActiveUserDimensions ($(parent).width()-(tileLetter.length*4),40,tileLetter.length,1,1,1);
    $(parent).width(tileLetter.length*x.picWidth+ (tileLetter.length*4));
    for (i = 0; i < tileLetter.length; i++) {      
        tiles[i] = document.createElement('div');
        tiles[i].className += ' xeraTiles';
        tiles[i].id = 'tile' + i;
        tiles[i].style.width = x.picWidth+'px';
        tiles[i].style.height = tiles[i].style.width;
        tiles[i].style.fontSize = (x.picWidth*(2/3)) + 'px';
        tiles[i].style.lineHeight = (x.picWidth)  + 'px';
        tiles[i].style.verticalAlign = 'middle';
        tiles[i].innerHTML = tileLetter[i];
        tileContainer.appendChild(tiles[i]);
        
        /** div for tile values, right hand side, bottom relative (width of parent - width of div - 0.2em, value tileValue[String.fromCharCode(tileLetter[i])-64];**/
    }
   
    /**$("alphagram").empty("tileContainer");**/
    $(parent).append(tileContainer);
    tileContainer.id = 'tileContainer';
    tileContainer.style.verticalAlign = 'middle';
     $( function() {
        $( "#tileContainer" ).sortable(
        {placeholder: 'quizPlaceholder', tolerance: 'touch'});
        $( "#tileContainer" ).sortable( "option", "disabled", false );
        $( "#tileContainer" ).disableSelection();
       } );
     window.addEventListener('resize', function(event){displayUserArray(usersArray)});
}
