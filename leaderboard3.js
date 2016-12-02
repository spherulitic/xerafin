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
  button1.style.cssFloat = 'left';
  button2.style.cssFloat = 'right';
  button1.innerHTML = 'Hide';
  button2.innerHTML = 'Refresh';

  /** Title Div **/
  var headerText1 = document.createElement('div');
  headerText1.innerHTML = '<h4>Current Leaders</h4>';
  headerText1.width="100%";
  headerText1.style.margin = '0 auto';
  headerText1.style.textAlign = 'center';

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
  periodList.style.width = "70%";
  var periodOption1 = document.createElement("option");
  periodOption1.text = "Today";
  periodOption1.value = 1;
  periodList.add(periodOption1);
  var periodOption2 = document.createElement("option");
  periodOption2.text = "Yesterday";
  periodOption2.value = 2;
  periodList.add(periodOption2);
  var periodOption3 = document.createElement("option");
  periodOption3.text = "Last Week";
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
  headerCell1.style.backgroundColor = '#e9e9e9';
  headerCell1.style.border = '0px';
  headerCell1.colSpan= "3";
  headerCell1.appendChild(periodList);
  headerCell4.innerHTML = 'Questions Done';
  headerCell5.innerHTML = 'Cardbox Score';
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
   var s=["th","st","nd","rd"],
       v=n%100;
   return n+(s[(v-20)%10]||s[v]||s[0]);
}
for (var x=0;x<data.length;x++) {
  var row = document.createElement('tr'); 
  document.getElementById('lbTableBody').appendChild(row);
  var col1 = document.createElement("td");
  var col2 = document.createElement("td");
  var col3 = document.createElement("td");
  var col4 = document.createElement("td");
  var col5 = document.createElement("td");
  col2.style.borderRight = 'solid 0px';
  col3.style.borderLeft = 'solid 0px';
  col3.style.width = '50%';
  col3.style.textAlign = 'left';
  col1.innerHTML = getOrdinal(x+1);
  col2.innerHTML = '<img src="'+data[x].photo+'" style="height:30px;" title="'+data[x].name+'">';
  col3.innerHTML = data[x].name;
  col4.innerHTML = data[x].answered;
  col5.innerHTML = data[x].score;
  row.appendChild(col1);
  row.appendChild(col2);
  row.appendChild(col3);
  row.appendChild(col4);
  row.appendChild(col5);
}
}

function sortByAnswered(a, b) {
  return b.answered - a.answered;
}

function sortByScore(a, b) {
  return b.score - a.score;
}

