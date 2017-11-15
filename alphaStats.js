function showAlphaStats (alpha) {

  localStorage.middleDefault = 3;
  d = { userid: userid, alpha: alpha };
  $.ajax({type: "POST",
          url: "getAuxInfo.py",
          data: JSON.stringify(d),
          success: displayAlphaStats,
          error: function(jqXHR, textStatus, errorThrown) {
          console.log("Error getting alphagram stats, status = " + textStatus + " error: " + errorThrown);
          } } );

}

function createAlphaStatsTable() {

  $('#middleArea').html("");
  document.getElementById('middleArea').style.display = 'inherit';
  
  /** Element Initialisation **/
  var lbHeader = document.createElement("div");
  var button1 = document.createElement('button');
  var button2 = document.createElement('button');
  var headerText1 = document.createElement('div');
  var cardboxTable = document.createElement("table");
  var headerCol = document.createElement('thead');
  var headerRow1 = document.createElement('tr');
  var headerCell1 = document.createElement('th');
 
  /** Initial Styling **/
  lbHeader.className += ' lbHeader';
  headerText1.className+= ' tableHeaderDark';
  button1.className += ' tableButtonDark';
  button2.className += ' tableButtonDark';
  button1.style.cssFloat = 'right';
  button2.style.cssFloat = 'left';
  cardboxTable.className += " lbTable";
  cardboxTable.style.width = "80%";
  
   
  /** IDs **/
  lbHeader.id = "lbHeader";
  cardboxTable.id = "alphaTable";

  /** Hide / Refresh Buttons **/
  button2.onclick = function() {showAlphaStats(document.getElementById("currentAlpha").value);};
  button1.onclick = hideAlphaStats;  
  button1.innerHTML = '✘';
  button2.innerHTML = '↻';

  /** Title Div **/
  
  headerText1.innerHTML = 'Alphagram Info';

  /** Components of Area Added **/
  document.getElementById('middleArea').appendChild(lbHeader);
  lbHeader.appendChild(button1);
  lbHeader.appendChild(button2);
  lbHeader.appendChild(headerText1); 
  document.getElementById('middleArea').appendChild(cardboxTable);
 
  /** Unorganised **/
 
  var tableBody = document.createElement('tbody');
  tableBody.id = 'alphaTableBody';
  cardboxTable.appendChild(tableBody);

}

function getCardboxNumberDropdown(alpha) {

  /** Cardbox Number List Box Initialisation **/
  var periodList = document.createElement('select');
  for(var x=0;x<20;x++) {
    cbOption = document.createElement("option");
    cbOption.text = String(x);
    cbOption.value = x;
    periodList.add(cbOption);
  }

/** Actions when list box value changes **/
  periodList.onchange = function() { 
    var d = { user: userid,
              question: alpha,
              correct: (periodList.value>0),
              cardbox: periodList.value-1,
              incrementQ: false };
        $.ajax({
                type: "POST",
                url: "submitQuestion.py",
                data: JSON.stringify(d),
                success: function(response, responseStatus) {
                    console.log("Question " + alphagram + " updated in cardbox.");
                    var aux = response[0].aux;
                    var dueDate = new Date(aux.nextScheduled * 1000);
                    $('#alphaStatsDueDate').html(formatDateForDisplay(dueDate));  
                },  
                error: function(jqXHR, textStatus, errorThrown) {
                console.log("Error: question " + alphagram + " could not be updated.");
                }   
    }); 
  };
  periodList.style.width='25%';
  periodList.id = 'alphaStatsCardbox';
  return periodList;
  }
  

function displayAlphaStats (response, responseStatus) {
  createAlphaStatsTable();
  var alpha = response[0].alpha;
  var aux = response[0].aux;
  console.log("Alphagram Stats for " + alpha);
  console.log(aux);  
        var row = document.createElement("tr");
        var alphaTableBody = document.getElementById("alphaTableBody");
        alphaTableBody.appendChild(row);
        var col1 = document.createElement("td");
        var col2 = document.createElement("td");
        col1.innerHTML = "Alphagram";
        var textbox = document.createElement("input");
        textbox.type = "text";
        textbox.maxlength = 15;
        textbox.className = "quizAnswerBox";
        textbox.id = "currentAlpha";
        textbox.value = alpha;
        col2.onchange = function() {
                    var inputValue = document.getElementById("currentAlpha").value;
                    if(inputValue) {
                 showAlphaStats(toAlpha(inputValue.toUpperCase()));
        }};
        col2.append(textbox);
        row.appendChild(col1);
        row.appendChild(col2);

	row = document.createElement("tr");
        alphaTableBody.appendChild(row);
        var col1 = document.createElement("td");
        var col2 = document.createElement("td");
        col1.innerHTML = "Cardbox";
        if(!jQuery.isEmptyObject(aux)) {
           var dropdown = getCardboxNumberDropdown(alpha);
           dropdown.value = aux.cardbox;
           col2.appendChild(dropdown); }
        else {
           
           var button = document.createElement("button");
           button.innerHTML = "Add to Cardbox";
           button.onclick = function() { addToCardboxFromStats(alpha); };
           col2.appendChild(button);
        }
        row.appendChild(col1);
        row.appendChild(col2);

        row = document.createElement("tr");
        alphaTableBody.appendChild(row);
        col1 = document.createElement("td");
        col2 = document.createElement("td");
        col1.innerHTML = "Next Scheduled";
        if (!jQuery.isEmptyObject(aux)) {
           var dueDate = new Date(aux.nextScheduled * 1000);
           col2.innerHTML = formatDateForDisplay(dueDate);  
           col2.id = 'alphaStatsDueDate';
        }
        row.appendChild(col1);
        row.appendChild(col2);

        /* Footer Row */
        row = document.createElement("tr");
        document.getElementById('alphaTableBody').appendChild(row);
}

function hideAlphaStats() {
  localStorage.middleDefault = 0;
  document.getElementById('middleArea').style.display = 'none';
  $('#middleArea').html("");
}

function addToCardboxFromStats(word) {

   var alpha = toAlpha(word);
   if (confirm("Click OK to add " + alpha + " to your Cardbox.")) {
      var d = {user: userid, question: alpha};
      $.ajax({type: "POST", 
              data: JSON.stringify(d),
               url: "addQuestionToCardbox.py",
           success: addedToCardboxFromStats,
             error:  function(jqXHR, textStatus, errorThrown) {
              console.log("Error adding " + alpha + ", status = " + textStatus + " error: " + errorThrown); 
              }} );
       }   
}

function addedToCardboxFromStats(response, responseStatus) {
   if (response[1].status == "success") {
      showAlphaStats(response[0].question);
   } else if (response[1].status == "Invalid Alphagram") {
      alert("Could not add to cardbox: Invalid Alphagram"); 
   } else { alert("Error adding to your Cardbox. Please try again."); }
}
