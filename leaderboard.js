
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
		gGenerateListBox ("rankList", [["Leaderboard",1],["My Rank",2]], "content_pan_3","");
		gGenerateListBox ("periodList", [["Today",1],["Yesterday",2],["Last 7 Days",3], ["This Week",4], ["Last Week",5], ["This Month",6], ["This Year", 7]], "content_pan_3", "");

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
		
		var lbUpdateTimeBox= document.createElement('div');
		lbUpdateTimeBox.id='lbUpdateTimeBox';
		lbUpdateTimeBox.className+=' updateTime';
		$("#content_pan_3").append(lbRows,lbUpdateTimeBox); 
	}
}
function chooseLeaderboardData (response,responseStatus, inputType, period){
	var resType=["leaderboard","userrank"];
	var periodType=["today","yesterday","sevenDays","thisWeek","lastWeek","thisMonth","thisYear"];
	if (typeof response[0][resType[inputType-1]]["myRank"]=='undefined'){var myranks=0;}
	else {var myRanks=response[0][resType[inputType-1]]["myRank"][periodType[period-1]];}
	var result = response[0][resType[inputType-1]][periodType[period-1]];
	var users = response[0][resType[inputType-1]]['users'][periodType[period-1]];
	showLeaderboardData(result, myRanks, users);
}
function showLeaderboard (inputType, period) {
	if (Number(inputType) === 0){if (typeof localStorage.defaultRankType !== 'undefined') {inputType=Number(localStorage.defaultRankType)} else {inputType = 1;}}
	if (Number(period) === 0){if (typeof localStorage.defaultRankPeriod !== 'undefined') {period=Number(localStorage.defaultRankPeriod)} else {period = 1;}}
	var periodType=["today","yesterday","sevenDays","thisWeek","lastWeek","thisMonth","thisYear"];
	clearTimeout(leaderboardTimeout);
	leaderboardTimeout = setTimeout(function(){showLeaderboard(inputType,period)}, 300000);
	switch (Number(inputType)){
		case 1: d = {userid: userid, leaderboard:true};break;
		case 2: d = {userid: userid, userrank: true};break;
		default: d = {userid: userid, userrank: true};break;
	}
	d.timeframe=periodType[Number(period-1)];
	$.ajax({
		type: "post",		
		url: "getLeaderboardStatsCL.py",
		data: JSON.stringify(d),
		beforeSend: function(){
						$("#heading_text_pan_3").html('Rankings <img src="images/ajaxLoad.gif" style="height:0.8em">');
		},
		success: function(response, responseStatus){
			$("#heading_text_pan_3").html("Rankings");
				console.log(response);
				chooseLeaderboardData(response, responseStatus, inputType, period);				
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$("#heading_text_pan_3").html("Rankings");
			console.log("Error getting leaderboard stats, status = " + textStatus + " error: " + errorThrown);	  
		} 
	});
}

function hideLeaderboard() {
	clearTimeout(leaderboardTimeout);
	$('#pan_3').remove();
}
function getMedalRank(rank,max){
	var percentile = [0,0.001,0.01,0.05,0.125,0.25];
	var result = 0;
	if (rank===1){return 0;}
	else {
		for (var x=percentile.length;x>0;x--){
			if (rank<Math.ceil(percentile[x]*max)+1){result = x;}		
		}	
		if (result === 0){return percentile.length;}
		
		else {return result;}
	}
}
function showLeaderboardData(data, myRank, users) {
	var MAX_TOP_PLAYERS = 10;
	var curStyle = 0;
	var rankStyles =[
	[" highlightRow rankEmerald"," rankEmerald"],
	[" redRowed rankRuby"," rankRuby"],
	[" blueRowed rankSapphire"," rankSapphire"],
	[" goldRowed rankGold", " rankGold"],
	[" steelRowed rankSilver", " rankSilver"],
	[" bronzeRowed rankBronze", " rankBronze"],
	[" metalBOne rankSteel", " rankSteel"]]
	$('#lbRows').html('');
	 var z;
	 var userImage = new Array();
	 for (var temp=0;temp<data.length;temp++) {
		userImage[temp]=gGetPlayerPhoto(data[temp].photo,"lbImg"+temp,"images/unknown_player.gif");
		userImage[temp].title=data[temp].name;
		userImage[temp].style.padding="0";
	 }
	for (var x=0;x<data.length;x++) {
		var row = [];
		row[x] = document.createElement('div');
		row[x].className+=' lbDiv';
		row[x].id = 'lbdiv'+x;
		$(row[x]).css('opacity','0');	
		$('#lbRows').append(row[x]);
		var rankcheck=0
		var col= [];
		if (typeof data[x].rank!=='undefined'){rankcheck=data[x].rank} 
		else {
			if (x>=MAX_TOP_PLAYERS && myRank>x && username==data[x].name){rankcheck=myRank;}
			else {rankcheck=x+1};
		}
		curStyle=getMedalRank(rankcheck,users);
		var columnInfo = [(rankcheck)+"<sup>"+getOrdinal(rankcheck)+"</sup>", "", userImage[x], data[x].name, data[x].answered]; 		
		for (var y=1;y<6;y++){
			col[y] = document.createElement("div");
			col[y].className+=' lbDivchild';
			if (y!==3){col[y].innerHTML = columnInfo[y-1];}
			else {col[y].appendChild(columnInfo[y-1]);}
			row[x].appendChild(col[y]);			
			if (y===1) {
				col[y].className+=' metalBOne rankSteel';
				
			}
			else {				
				col[y].className+=rankStyles[curStyle][1];
				if (y>2){if (username==data[x].name){col[y].className+=" highlightRow";};}			
			}	
			if (y==2) {
				col[y].className+=rankStyles[curStyle][0];
			}
		}
		if (x>=MAX_TOP_PLAYERS && myRank>x && username==data[x].name){
			col[1].innerHTML = (myRank)+"<sup>"+getOrdinal(myRank)+"</sup>";
		}	
	}	
	for (x=data.length-1;x>=0;x--) {
		$("#lbdiv"+x).delay(100*(data.length-x)).fadeTo(1000,1);
	} 
	$('#lbUpdateTimeBox').html(gReturnUpdateTime());
}
