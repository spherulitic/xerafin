function showLeaderboardHeader () {
  $('#middleArea').html("");
  document.getElementById('middleArea').style.display = 'inherit';
  var lbTable = document.createElement("table");
  lbTable.id = "lbTable";
  lbTable.style.border = 'solid 1px';
  lbTable.style.width = '100%';
  lbTable.style.borderSpacing = '2px';
  document.getElementById('middleArea').appendChild(lbTable);
  var headerCol = document.createElement('thead');
  var headerRow1 = document.createElement('tr');
  var headerCell1 = document.createElement('th');
  headerCell1.colSpan = 3;
  headerCell1.style.textAlign = 'center';
  var headerText1 = document.createElement('H4');
  headerText1.innerHTML = 'Daily Leaders';
  headerText1.style.margin = 'auto';
  headerText1.style.display = 'inline';
  var button1 = document.createElement('button');
  var button2 = document.createElement('button');
  button1.onclick = hideLeaderboard;
  button2.onclick = showLeaderboard;
  button1.style.cssFloat = 'left';
  button2.style.cssFloat = 'right';
  button1.innerHTML = 'Hide';
  button2.innerHTML = 'Refresh';
  headerCell1.appendChild(button1);
  headerCell1.appendChild(headerText1);
  headerCell1.appendChild(button2);
  headerRow1.appendChild(headerCell1);

  var headerRow3 = document.createElement('tr');
  headerCell1 = document.createElement('th');
  headerCell1.colSpan = 3;
  headerCell1.style.textAlign = 'center';
  button1 = document.createElement('button');
  button2 = document.createElement('button');
  var button3 = document.createElement('button');
  button1.onclick = function() { 
    leaderboardPanel = "today";
    showLeaderboardData(leaderboardData.today.sort(sortByAnswered)); };
  button3.onclick = function() { 
    leaderboardPanel = "yesterday";
    showLeaderboardData(leaderboardData.yesterday.sort(sortByAnswered)); };
  button2.onclick = function() { 
    leaderboardPanel = "lastWeek";
    showLeaderboardData(leaderboardData.lastWeek.sort(sortByAnswered)); };
  button1.style.cssFloat = 'left';
  button2.style.cssFloat = 'right';
  button1.innerHTML = 'Today';
  button3.innerHTML = 'Yesterday';
  button2.innerHTML = 'Last Week';
  headerCell1.appendChild(button1);
  headerCell1.appendChild(button3);
  headerCell1.appendChild(button2);
  headerRow3.appendChild(headerCell1);
  
  var headerRow2 = document.createElement('tr');
  headerCell1 = document.createElement('th');
  headerCell2 = document.createElement('th');
  headerCell3 = document.createElement('th');
  headerCell1.style.textAlign = 'center';
  headerCell2.style.textAlign = 'center';
  headerCell3.style.textAlign = 'center';
  headerCell1.style.width = '50%';
  headerCell2.style.width = '25%';
  headerCell1.innerHTML = 'Name';
  headerCell2.innerHTML = 'Questions Done';
  headerCell3.innerHTML = 'Cardbox Score';
  headerRow2.appendChild(headerCell1);
  headerRow2.appendChild(headerCell2);
  headerRow2.appendChild(headerCell3);

  headerCol.appendChild(headerRow1);
  headerCol.appendChild(headerRow3);
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
for (var x=0;x<data.length;x++) {
  var row = document.createElement('tr'); 
  document.getElementById('lbTableBody').appendChild(row);
  var col1 = document.createElement("td");
  var col2 = document.createElement("td");
  var col3 = document.createElement("td");
  col1.style.border = 'solid 1px';
  col2.style.border = 'solid 1px';
  col3.style.border = 'solid 1px';
  col1.style.padding = '2px';
  col2.style.padding = '2px';
  col3.style.padding = '2px';
  col1.innerHTML = '<img src="'+data[x].photo+'" title="'+data[x].name+'">'+data[x].name;
  col2.innerHTML = data[x].answered;
  col3.innerHTML = data[x].score;
  row.appendChild(col1);
  row.appendChild(col2);
  row.appendChild(col3);
}
}

function sortByAnswered(a, b) {
  return b.answered - a.answered;
}

function sortByScore(a, b) {
  return b.score - a.score;
}

