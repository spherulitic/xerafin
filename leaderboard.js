
function initLeaderboard(){
	showLeaderboardHeader();
	showLeaderboard(0,0);
}
function showLeaderboardHeader () {
	if (!document.getElementById("pan_3")) {
		panelData = {	"contentClass" : "lbContent",
					"title": "Rankings",
					"tooltip": "<p style='text-align:left'>Leaderboard will update automatically every 5 minutes.  Using the Refresh button will also reset this timer.</p><p style='text-align:left'>No known bugs at present</p>"
					};
		generatePanel(3,panelData,"middleArea", initLeaderboard, hideLeaderboard);

		/** List Box Initialisation **/
		gGenerateListBox ("rankList", [["Leaderboard",1],["My Rank",2]], "content_pan_3");
		gGenerateListBox ("periodList", [["Today",1],["Yesterday",2],["Last 7 Days",3], ["This Week",4], ["Last Week",5], ["This Month",6], ["This Year", 7]], "content_pan_3");

		/** Finds previous list box value and creates default if no value present **/
		if (typeof localStorage.defaultRankType=='undefined'){localStorage.setItem('defaultRankType','1')}
		else {$('#rankList').val(localStorage.defaultRankType)};
		if (typeof localStorage.defaultRankPeriod=='undefined'){localStorage.setItem('defaultRankPeriod','1')}
		else {$('#periodList').val(localStorage.defaultRankPeriod)};
	
		$("#rankList").change(function() { 
					localStorage.defaultRankType = $ ( this ).val();
					showLeaderboard ($("#rankList").val(),$("#periodList").val());		  
		});
		$("#periodList").change(function() { 
				localStorage.defaultRankPeriod = $( this ).val();
				showLeaderboard ($("#rankList").val(),$("#periodList").val());
		});
	
		var lbRows = document.createElement('div');
		lbRows.id = "lbRows";
		lbRows.className+=" noselect";
		document.getElementById("content_pan_3").appendChild(lbRows); 
	}
}
function chooseLeaderboardData (response,responseStatus, inputType, period){
	switch (Number(inputType)){
		case 1: if (response[0] && response[0].leaderboard && typeof response[0].leaderboard.myRank!=='undefined'){var rankPar = response[0].leaderboard.myRank};
		switch (Number(period)){
			case 1: var result = response[0].leaderboard.today;break;
			case 2: var result = response[0].leaderboard.yesterday;break;
			case 3: var result = response[0].leaderboard.sevenDays;break;
			case 4: var result = response[0].leaderboard.thisWeek;break;
			case 5: var result = response[0].leaderboard.lastWeek;break;
			case 6: var result = response[0].leaderboard.thisMonth;break;
			case 7: var result = response[0].leaderboard.thisYear;break;
		};break;
		case 2: var rankPar = response[0].userrank.myRank;
		switch (Number(period)){
			case 1: var result = response[0].userrank.today;break;
			case 2: var result = response[0].userrank.yesterday;break;
			case 3: var result = response[0].userrank.sevenDays;break;
			case 4: var result = response[0].userrank.thisWeek;break;
			case 5: var result = response[0].userrank.lastWeek;break;
			case 6: var result = response[0].userrank.thisMonth;break;
			case 7: var result = response[0].userrank.thisYear;break;
			
		};break;
	};
	if (typeof rankPar!=="undefined"){
	switch (Number(period)){
		case 1: var myRanks= rankPar.today;break;
		case 2: var myRanks= rankPar.yesterday;break;
		case 3: var myRanks= rankPar.sevenDays;break;
		case 4: var myRanks= rankPar.thisWeek;break;
		case 5: var myRanks= rankPar.lastWeek;break;
		case 6: var myRanks= rankPar.thisMonth;break;
		case 7: var myRanks= rankPar.thisYear;break;
	}
	}
	else {myranks=0};
	//console.log('Rank:'+myRanks+'. Data to Display:<br>'+result);
	showLeaderboardData(result, myRanks);
}
function showLeaderboard (inputType, period) {
	if (Number(inputType) === 0){if (typeof localStorage.defaultRankType !== 'undefined') {inputType=Number(localStorage.defaultRankType)} else {inputType = 1;}}
	if (Number(period) === 0){if (typeof localStorage.defaultRankPeriod !== 'undefined') {period=Number(localStorage.defaultRankPeriod)} else {period = 1;}}
	
	clearTimeout(leaderboardTimeout);
	leaderboardTimeout = setTimeout(function(){showLeaderboard(inputType,period)}, 300000);
	switch (Number(inputType)){
		case 1: d = {userid: userid, leaderboard:true};break;
		case 2: d = {userid: userid, userrank: true};break;
		default: d = {userid: userid, userrank: true};break;
	}
	switch (Number(period)){
		case 1: d.timeframe = "today";break;
		case 2: d.timeframe = "yesterday";break;
		case 3: d.timeframe = "sevenDays";break;
		case 4: d.timeframe = "thisWeek";break;
		case 5: d.timeframe = "lastWeek";break;
		case 6: d.timeframe = "thisMonth";break;
		case 7: d.timeframe = "thisYear";break;
		default: d.timeframe = "Today";break;
	}
	$.ajax({
		type: "POST",		
		url: "getLeaderboardStats2.py",
		data: JSON.stringify(d),
		beforeSend: function(){
						$("#heading_text_pan_3").html('Rankings <img src="images/ajaxLoad.gif" style="height:0.8em">');
		},
		success: function(response, responseStatus){
			$("#heading_text_pan_3").html("Rankings");
				chooseLeaderboardData(response, responseStatus, inputType, period);				
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Error getting leaderboard stats, status = " + textStatus + " error: " + errorThrown);	  
		} 
	});
}

function hideLeaderboard() {
	clearTimeout(leaderboardTimeout);
	$('#pan_3').remove();
}

function showLeaderboardData(data, myRank) {
  var MAX_TOP_PLAYERS = 10;
  $('#lbRows').html('');
  var getOrdinal = function(n) {
	  return["st","nd","rd"][((n+90)%100-10)%10-1]||"th"};
  for (var x=0;x<data.length;x++) {
	var row = [];
    row[x] = document.createElement('div');
	row[x].className+=' lbDiv';
	row[x].id = 'lbdiv'+x;
	$(row[x]).css('opacity','0');	
    $('#lbRows').append(row[x]);
    if (x==0){row[x].style.fontWeight='bold';}
	var rankcheck=0
    var col= [];
	if (typeof data[x].rank!=='undefined'){rankcheck=data[x].rank} else {rankcheck=x+1};
    var columnInfo = [(rankcheck)+"<sup>"+getOrdinal(rankcheck)+"</sup>",
	'<img src="'+data[x].photo+'" style="padding:0;" title="'+data[x].name+'">',
	data[x].name, 
	data[x].answered]; 
	
    for (var y=1;y<5;y++){
      col[y] = document.createElement("div");
	  col[y].className+=' lbDivchild';
      col[y].innerHTML = columnInfo[y-1];
      row[x].appendChild(col[y]);
	  if (username==data[x].name){
		if (y>1){			
			col[y].style.background="#8abd22"; 			
		}
	}
    }
    if (x>=MAX_TOP_PLAYERS && myRank>x && username==data[x].name){
		col[1].innerHTML = (myRank)+"<sup>"+getOrdinal(myRank)+"</sup>";} 
		
	
}	
	for (x=data.length-1;x>=0;x--) {
		$("#lbdiv"+x).delay(150*(data.length-x)).fadeTo(1200,1);
	} 
}
