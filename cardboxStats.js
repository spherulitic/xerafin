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
  var cardboxTable = document.createElement("table");
  cardboxTable.id = "cardboxTable";
  cardboxTable.style.border = 'solid 1px';
  cardboxTable.style.width = '100%';
  cardboxTable.style.borderSpacing = '2px';
  document.getElementById('middleArea').appendChild(cardboxTable);
  var headerCol = document.createElement('thead');
  var headerRow1 = document.createElement('tr');
  var headerCell1 = document.createElement('th');
  headerCell1.colSpan = 3;
  headerCell1.style.textAlign = 'center';
  var headerText1 = document.createElement('H4');
  headerText1.innerHTML = 'Cardbox Statistics';
  headerText1.style.margin = 'auto';
  headerText1.style.display = 'inline';
  var button1 = document.createElement('button');
  var button2 = document.createElement('button');
  button1.onclick = hideCardboxStats;
  button2.onclick = showCardboxStats;
  button1.style.cssFloat = 'left';
  button2.style.cssFloat = 'right';
  button1.innerHTML = 'Hide';
  button2.innerHTML = 'Refresh';
  headerCell1.appendChild(button1);
  headerCell1.appendChild(headerText1);
  headerCell1.appendChild(button2);
  headerRow1.appendChild(headerCell1);
  
  var headerRow2 = document.createElement('tr');
  headerCell1 = document.createElement('th');
  headerCell2 = document.createElement('th');
  headerCell3 = document.createElement('th');
  headerCell1.style.textAlign = 'center';
  headerCell2.style.textAlign = 'center';
  headerCell3.style.textAlign = 'center';
  headerCell1.style.width = '33%';
  headerCell2.style.width = '33%';
  headerCell1.innerHTML = 'Cardbox';
  headerCell2.innerHTML = 'Total';
  headerCell3.innerHTML = 'Currently Due';
  headerRow2.appendChild(headerCell1);
  headerRow2.appendChild(headerCell2);
  headerRow2.appendChild(headerCell3);

  headerCol.appendChild(headerRow1);
  headerCol.appendChild(headerRow2);
  cardboxTable.appendChild(headerCol);

  var tableBody = document.createElement('tbody');
  tableBody.id = 'cardboxTableBody';
  cardboxTable.appendChild(tableBody);

   }

function displayCardboxStats (response, responseStatus) {
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
        col1.style.border = 'solid 1px';
        col2.style.border = 'solid 1px';
        col3.style.border = 'solid 1px';
        col1.style.padding = '2px';
        col2.style.padding = '2px';
        col3.style.padding = '2px';
        col1.innerHTML = cardbox;
        col2.innerHTML = eval('stats.totalCards["' + cardbox + '"]');
        if (cardbox in stats.dueByCardbox)
          col3.innerHTML = eval('stats.dueByCardbox["' + cardbox + '"]');
        row.appendChild(col1);
        row.appendChild(col2);
        row.appendChild(col3);
   });
}

function hideCardboxStats() {
  document.getElementById('middleArea').style.display = 'none';
  $('#middleArea').html("");
}
