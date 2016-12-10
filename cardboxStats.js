function showCardboxStats () {

  d = { userid: userid };
  $.ajax({type: "POST",
          url: "getCardboxStats.py",
          data: JSON.stringify(d),
          success: displayCardboxStats,
          error: function(jqXHR, textStatus, errorThrown) {
          console.log("Error getting cardbox stats, status = " + textStatus + " error: " + errorThrown);
          } } );

}

function createCardboxStatsTable() {

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
  cardboxTable.id = "cardboxTable";

  /** Hide / Refresh Buttons **/
  button2.onclick = showCardboxStats;
  button1.onclick = hideCardboxStats;  
  button1.innerHTML = '✘';
  button2.innerHTML = '↻';

  /** Title Div **/
  
  headerText1.innerHTML = 'Cardbox Info';

  /** Components of Area Added **/
  document.getElementById('middleArea').appendChild(lbHeader);
  lbHeader.appendChild(button1);
  lbHeader.appendChild(button2);
  lbHeader.appendChild(headerText1); 
  document.getElementById('middleArea').appendChild(cardboxTable);
 

  /** List Box Initialisation **/

  var periodList = document.createElement('select');
  var periodOption1 = document.createElement("option");
  periodOption1.text = "Due Now";
  periodOption1.value = 1;
  periodList.add(periodOption1);
  var periodOption2 = document.createElement("option");
  periodOption2.text = "Next 24 Hrs";
  periodOption2.value = 2;
  periodList.add(periodOption2);
  var periodOption3 = document.createElement("option");
  periodOption3.text = "Next 7 Days";
  periodOption3.value = 3;
  periodList.add(periodOption3);

  /** Finds previous list box value and creates default if no value present **/
 
  switch (cardboxStatsPanel){
    case "dueNow": periodList.value=1;break;
    case "dueToday": periodList.value=2;break;
    case "dueThisWeek": periodList.value=3;break;
    default: cardboxStatsPanel="dueNow";periodList.value=1;break;
  }

/** Actions when list box value changes **/
  periodList.onchange = function() { 
    switch(periodList.value){
      case '1': cardboxStatsPanel= "dueNow";break;
      case '2': cardboxStatsPanel= "dueToday";break;
      case '3': cardboxStatsPanel= "dueThisWeek";break;
      default: cardboxStatsPanel= "dueNow";break;
    }
    showCardboxStats();
  };
  periodList.style.width='80%';
  
  /** Unorganised **/
 
  var headerRow2 = document.createElement('tr');
  headerCell1 = document.createElement('th');
  headerCell2 = document.createElement('th');
  headerCell3 = document.createElement('th');
  headerCell1.style.width = '40%';
  headerCell2.style.width = '20%';
  headerCell1.innerHTML = 'Cardbox';
  headerCell2.innerHTML = 'Total';
  headerCell1.style.textAlign = 'center';
  headerCell2.style.textAlign = 'center';
  headerCell3.style.textAlign = 'center';
  headerRow2.appendChild(headerCell1);
  headerRow2.appendChild(headerCell2);
  headerRow2.appendChild(headerCell3);
  headerCell3.appendChild(periodList);
  headerCol.appendChild(headerRow2);
  cardboxTable.appendChild(headerCol);
  var tableBody = document.createElement('tbody');
  tableBody.id = 'cardboxTableBody';
  cardboxTable.appendChild(tableBody);

}

function displayCardboxStats (response, responseStatus) {
  var cardboxTotal=0;
  var dueTotal=0;
  console.log("Cardbox Stats:");
  createCardboxStatsTable();
  stats = response[0];
  console.log(stats);  
  arrayOfCardboxes = Object.keys(stats.totalCards).sort(function(a,b) {
			return parseInt(a) - parseInt(b); });
  arrayOfCardboxes.forEach(function(cardbox) {
	var row = document.createElement("tr");
        document.getElementById('cardboxTableBody').appendChild(row);
        var col1 = document.createElement("td");
        var col2 = document.createElement("td");
        var col3 = document.createElement("td");
        col1.innerHTML = cardbox;
        col2.innerHTML = eval('stats.totalCards["' + cardbox + '"]');
        cardboxTotal+= eval(col2.innerHTML);
        if (cardbox in eval('stats.dueByCardbox.'+cardboxStatsPanel)){
          col3.innerHTML = eval('stats.dueByCardbox.'+cardboxStatsPanel+'["' + cardbox + '"]');
          dueTotal+=eval(col3.innerHTML);}
        row.appendChild(col1);
        row.appendChild(col2);
        row.appendChild(col3);
   });
  var rowFoot = document.createElement("tr");
  var footNote1 =document.createElement("td");
  var footNote2 =document.createElement("td");
  var footNote3 =document.createElement("td");
  footNote1.style.color = "#eee";
  footNote2.style.color = "#eee";
  footNote3.style.color = "#eee";
  footNote1.innerHTML='Total';
  footNote2.innerHTML=cardboxTotal;
  footNote3.innerHTML=dueTotal;
  document.getElementById('cardboxTableBody').appendChild(rowFoot);
  rowFoot.appendChild(footNote1);
  rowFoot.appendChild(footNote2);
  rowFoot.appendChild(footNote3);
}

function hideCardboxStats() {
  document.getElementById('middleArea').style.display = 'none';
  $('#middleArea').html("");
}
