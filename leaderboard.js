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
    showLeaderboardData(leaderboardData.today.sort(sortByAnswered),
      leaderboardData.myRank.today); };
    if (periodList.value == 2){
    leaderboardPanel = "yesterday";
    showLeaderboardData(leaderboardData.yesterday.sort(sortByAnswered),
      leaderboardData.myRank.yesterday); }
    if (periodList.value == 3){
    leaderboardPanel = "lastWeek";
    showLeaderboardData(leaderboardData.lastWeek.sort(sortByAnswered),
      leaderboardData.myRank.lastWeek); };
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
  var d = {userid: userid}
  $.ajax({type: "POST",
          url: "getLeaderboardStats.py",
          data: JSON.stringify(d),
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
    showLeaderboardData(leaderboardData.today.sort(sortByAnswered), 
            leaderboardData.myRank.today);
  else if (leaderboardPanel == "yesterday")
    showLeaderboardData(leaderboardData.yesterday.sort(sortByAnswered),
            leaderboardData.myRank.yesterday);
  else if (leaderboardPanel == "lastWeek")
    showLeaderboardData(leaderboardData.lastWeek.sort(sortByAnswered),
            leaderboardData.myRank.lastWeek);
}

function hideLeaderboard() {
  document.getElementById('middleArea').style.display = 'none';
  $('#middleArea').html("");
}

function showLeaderboardData(data, myRank) {
  var MAX_TOP_PLAYERS = 10 // leaderboard should show the top x players
             // if there is an x+1th player, it's me; show with myRank
  showLeaderboardHeader();
  var getOrdinal = function(n) {
    var s=["th","st","nd","rd"], v=n%100;
    return (s[(v-20)%10]||s[v]||s[0]);
  }
  for (var x=0;x<data.length;x++) {
    var row = document.createElement('tr'); 
    document.getElementById('lbTableBody').appendChild(row);
    if (x==0){row.style.fontWeight='bold';};
    var col=[];
    var columnInfo = [(x+1)+"<sup>"+getOrdinal(x+1)+"</sup>",'<img src="'+data[x].photo+'" style="height:30px;" title="'+data[x].name+'">',data[x].name, data[x].answered, data[x].score];  
    for (var y=1;y<6;y++){
      col[y] = document.createElement("td");
      col[y].innerHTML = columnInfo[y-1];
      console.log (col[y].innerHTML);
      row.appendChild(col[y]);
    }
    /** Exceptions to loop **/
    col[1].className+=' lbTableRank';
    col[2].style.borderRight = 'solid 0px';
    col[3].style.borderLeft = 'solid 0px';
    col[3].style.width = '45%';
    col[3].style.textAlign = 'left'; 
    if (x>MAX_TOP_PLAYERS){col[1].innerHTML = (myRank)+"<sup>"+getOrdinal(x+1)+"</sup>";}  
    if (username==data[x].name){row.style.background="#5ab";} //*Cheap hack to highlight user.  Bug if 2 people with the same name are in the rankings *//   
  }
  var footNote=[];
  var rowFoot = document.createElement("tr");
  for (var y=1;y<6;y++){
    footNote[y] = document.createElement("td");
    rowFoot.appendChild(footNote[y]);
  } 
  document.getElementById('lbTableBody').appendChild(rowFoot);
}

function sortByAnswered(a, b) {
  return b.answered - a.answered;
}

function sortByScore(a, b) {
  return b.score - a.score;
}

