function showLeaderboardHeader () {

  $('#middleArea').html("");
  document.getElementById('middleArea').style.display = 'inherit';

  /** Initialisation of Header Region **/
  var lbHeader = document.createElement("div");
  lbHeader.id = "lbHeader";
  lbHeader.className += ' lbHeader';
  document.getElementById('middleArea').appendChild(lbHeader);

  /** Hide / Refresh Buttons **/
  var button1 = document.createElement('button');
  var button2 = document.createElement('button');
  button1.onclick = hideLeaderboard;
  button2.onclick = showLeaderboard;
  button1.className += ' tableButtonDark';
  button2.className += ' tableButtonDark';
  button1.style.cssFloat = 'right';
  button2.style.cssFloat = 'left';
  button1.innerHTML = '✘';
  button2.innerHTML = '↻';

  /** Title Div **/
  var headerText1 = document.createElement('div');
  headerText1.className+= ' tableHeaderDark';
  headerText1.innerHTML = 'Leaderboard';
  
  /** Components of Header added **/
  lbHeader.appendChild(button1);
  lbHeader.appendChild(button2);
  lbHeader.appendChild(headerText1);
  
  /** Initialisation of Table div **/
  var lbContent = document.createElement('div');
  lbContent.margin = '0 auto';
  lbContent.id = "lbContent"
  var lbTable = document.createElement('table');
  lbTable.id = "lbTable";
  lbContent.appendChild(lbTable);
  lbTable.className += ' lbTable';
  
  var headerCol = document.createElement('thead');
  var headerCell1 = document.createElement('th');
  var header1 = document.createElement('div');

/** List Box Initialisation **/

  var periodList = document.createElement('select');
  var periodOption1 = document.createElement("option");
  periodOption1.text = "Today";
  periodOption1.value = 1;
  periodList.add(periodOption1);
  var periodOption2 = document.createElement("option");
  periodOption2.text = "Yesterday";
  periodOption2.value = 2;
  periodList.add(periodOption2);
  var periodOption3 = document.createElement("option");
  periodOption3.text = "Last 7 Days";
  periodOption3.value = 3;
  periodList.add(periodOption3);

/** Finds previous list box value and creates default is no value present **/
 
  switch (leaderboardPanel){
    case "today": periodList.value=1;break;
    case "yesterday": periodList.value=2;break;
    case "lastWeek": periodList.value=3;break;
    default: leaderboardPanel="today";periodList.value=1;
  }

/** Actions when list box value changes **/

  periodList.onchange = function() { 
    if (periodList.value == 1){
    leaderboardPanel = "today";
    showLeaderboardData(leaderboardData.today.sort(sortByAnswered)); };
    if (periodList.value == 2){
    leaderboardPanel = "yesterday";
    showLeaderboardData(leaderboardData.yesterday.sort(sortByAnswered)); }
    if (periodList.value == 3){
    leaderboardPanel = "lastWeek";
    showLeaderboardData(leaderboardData.lastWeek.sort(sortByAnswered)); };
    };

  
  document.getElementById('lbHeader').appendChild(lbTable);
  var headerRow2 = document.createElement('tr');
  headerCell1 = document.createElement('th');
  var headerCell4 = document.createElement('th');
  var headerCell5 = document.createElement('th');
  headerCell1.colSpan= "3";
  headerCell1.appendChild(periodList);
  headerCell4.innerHTML = 'questions done';
  headerCell5.innerHTML = 'cardbox score';
  headerRow2.appendChild(headerCell1);
  headerRow2.appendChild(headerCell4);
  headerRow2.appendChild(headerCell5);
  headerCol.appendChild(headerRow2);

  lbTable.appendChild(headerCol);
  var tableBody = document.createElement('tbody');
  tableBody.id = 'lbTableBody';
  lbTable.appendChild(tableBody);
  

}

function showLeaderboard () {
  $.ajax({type: "GET",
          url: "getLeaderboardStats.py",
          success: displayLeaderboardStats,
          error: function(jqXHR, textStatus, errorThrown) {
          console.log("Error getting leaderboard stats, status = " + textStatus + " error: " + errorThrown);
          } } );

   }

function displayLeaderboardStats (response, responseStatus) {
  console.log("Leaderboard Stats:");
  console.log(response);
  leaderboardData = response[0];
  if (leaderboardPanel == "today") 
    showLeaderboardData(leaderboardData.today.sort(sortByAnswered));
  else if (leaderboardPanel == "yesterday")
    showLeaderboardData(leaderboardData.yesterday.sort(sortByAnswered));
  else if (leaderboardPanel == "lastWeek")
    showLeaderboardData(leaderboardData.lastWeek.sort(sortByAnswered));
}

function hideLeaderboard() {
  document.getElementById('middleArea').style.display = 'none';
  $('#middleArea').html("");
}

function showLeaderboardData(data) {
  showLeaderboardHeader();
  var getOrdinal = function(n) {
    var s=["th","st","nd","rd"], v=n%100;
    return (s[(v-20)%10]||s[v]||s[0]);
  }
  for (var x=0;x<data.length;x++) {
    var row = document.createElement('tr'); 
    document.getElementById('lbTableBody').appendChild(row);
    if (x==0){row.style.fontWeight='bold';};
    var col1 = document.createElement("td");
    var col2 = document.createElement("td");
    var col3 = document.createElement("td");
    var col4 = document.createElement("td");
    var col5 = document.createElement("td");
    col2.style.borderRight = 'solid 0px';
    col3.style.borderLeft = 'solid 0px';
    col3.style.width = '50%';
    col3.style.textAlign = 'left';
    col1.innerHTML = (x+1)+"<sup>"+getOrdinal(x+1)+"</sup>";
    col2.innerHTML = '<img src="'+data[x].photo+'" style="height:30px;" title="'+data[x].name+'">';
    col3.innerHTML = data[x].name;
    col4.innerHTML = data[x].answered;
    col5.innerHTML = data[x].score;
    row.appendChild(col1);
    row.appendChild(col2);
    row.appendChild(col3);
    row.appendChild(col4);
    row.appendChild(col5);
    col1.className+=' lbTableRank';
  }
  var rowFoot = document.createElement("tr");
  var footNote1 =document.createElement("td");
  var footNote2 =document.createElement("td");
  var footNote3 =document.createElement("td");
  var footNote4 =document.createElement("td");
  var footNote5 =document.createElement("td");
  document.getElementById('lbTableBody').appendChild(rowFoot);
  footNote1.innerHtml='&nbsp;';
  rowFoot.appendChild(footNote1);
  rowFoot.appendChild(footNote2);
  rowFoot.appendChild(footNote3);
  rowFoot.appendChild(footNote4);
  rowFoot.appendChild(footNote5);
}

function sortByAnswered(a, b) {
  return b.answered - a.answered;
}

function sortByScore(a, b) {
  return b.score - a.score;
}

