function showCardboxStats (value) {
	if (typeof cardboxTimeout!=='undefined'){clearTimeout(cardboxTimeout);}
	if (value!==2) {cardboxTimeout = setTimeout(function(){showCardboxStats()}, 900000);}
	if (typeof value=='undefined'){value=1;}
	switch (value) {
		case 1: d = {userid: userid, due:true};break;
		case 2: d = {userid: userid, coverage:true};break;
	}
	$.ajax({type: "POST",
		url: "getCardboxStats.py",
		data: JSON.stringify(d),
		beforeSend: function(){$("#heading_text_pan_4").html('Cardbox Info <img src="images/ajaxLoad.gif" style="height:0.8em">');},
		success:  function(response,responseStatus){
				$("#heading_text_pan_4").html("Cardbox Info");
				switch (value) {
					case 1: displayCardboxDue(response,responseStatus);break;
					case 2: displayCardboxCoverage(response,responseStatus);break;
				}
		},
		error: function(jqXHR, textStatus, errorThrown) {
		console.log("Error getting cardbox stats, status = " + textStatus + " error: " + errorThrown);
		} 
	});
}
function refreshCardboxInfo() {
	if ($('#dueTab').hasClass('active')){showCardboxStats(1)}
	else if ($('#coverageTab').hasClass('active')){showCardboxStats(2)};
}
function returnUpdateTime() {
	let newDate = new Date();
	return "Last Updated "+ (newDate.getHours() < 10 ? "0" : "")+newDate.getHours() + ":" + (newDate.getMinutes() < 10 ? "0" : "") + newDate.getMinutes() + ':' + (newDate.getSeconds() < 10 ? "0" : "") + newDate.getSeconds();
}

function createCardboxStatsPanel() {
  if (typeof localStorage.cardboxCurrent=='undefined'){localStorage.setItem('cardboxCurrent','0');}
  if (typeof localStorage.cardboxSent=='undefined'){localStorage.setItem('cardboxSent','false');}
  if (!document.getElementById("pan_4")) {
	panelData = {	"contentClass" : "panelContentDefault",
					"title": "Cardbox Info",
					"minimizeObject": "cardboxInfoWrapper",
					"tooltip": "Basic help info goes <b>Here</b>"
				};
	generatePanel(4,panelData,"middleArea", refreshCardboxInfo, hideCardboxStats);
	$("#content_pan_4").css("visibility","hidden");
	var wrapper = document.createElement('div');
	wrapper.id = 'cardboxInfoWrapper';
	var infoDiv = document.createElement('div');
	infoDiv.id = 'cardboxScoreInfo';
	infoDiv.className+= 'cardboxScoreInfo';
	var cBScoreDiv = document.createElement('div');
	cBScoreDiv.innerHTML = 'Cardbox Value: <span id="cardboxInfoScore"></span>';
	cBScoreDiv.className+= 'cardboxScoreChild';
	var cBQTodayDiv = document.createElement('div');
	cBQTodayDiv.innerHTML = 'Questions Today: <span id="cardboxInfoQToday"></span>';
	cBQTodayDiv.className+= 'cardboxScoreChild';
	var cBDiffDiv = document.createElement('div');
	cBDiffDiv.innerHTML = 'Cardbox Movement: <span id="cardboxInfoDiff"></span>';
	cBDiffDiv.className+= 'cardboxScoreChild';
	$(infoDiv).append(cBScoreDiv, cBQTodayDiv, cBDiffDiv);
	var cardboxTab = document.createElement('ul');
	cardboxTab.id = 'cardboxTab';
	cardboxTab.className+=' nav nav-pills nav-justified';
	var cardboxTab1 = document.createElement('li');
	cardboxTab1.id = 'dueTab';	
	$(cardboxTab1).html("<a data-toggle='tab' href='#dueContent'>Questions Due</a>");
	cardboxTab1.className+=' active';
	var cardboxTab2 = document.createElement('li');
	cardboxTab2.id = 'coverageTab';
	$(cardboxTab2).html("<a data-toggle='tab' href='#coverageContent'>Coverage</a>");
	var cardboxInfoContent = document.createElement('div');
	cardboxInfoContent.className+=" tab-content";
	var cardboxInfoDue = document.createElement('div');
	cardboxInfoDue.id='dueContent';
	cardboxInfoDue.className+=" tab-pane fade in active";
	var cardboxInfoCoverage = document.createElement('div');
	cardboxInfoCoverage.id='coverageContent';
	cardboxInfoCoverage.className+=" tab-pane fade";	
	$(cardboxTab1).click(function(){showCardboxStats(1)});
	$(cardboxTab2).click(function(){showCardboxStats(2)});			
	//var levelText = document.createElement('div');	
	//levelText.id = "levelText";
	//document.getElementById('cntent_pan_4').appendChild(levelText);
	
	$(cardboxTab).append(cardboxTab1,cardboxTab2);
	$(cardboxInfoContent).append(cardboxInfoDue, cardboxInfoCoverage);
	var updateTimeBox= document.createElement('div');
	updateTimeBox.id='cardboxUpdateTimeBox';
	updateTimeBox.className+=' updateTime';
	$(wrapper).append(cardboxTab,cardboxInfoContent,updateTimeBox);
	$('#content_pan_4').append(infoDiv,wrapper);
	$("#content_pan_4").css('visibility','visible');

	/** List Box Initialisation **/
	
	
	$('#periodDue').css('width','90%');
	var periodTemp = document.createElement('div');
	periodTemp.id = "periodTemp";
	gGenerateTable(['Cardbox','','Total', periodTemp], 'dueContent', 'statTable cardboxTable', 'cardboxTable','cardboxTableBody');
	gGenerateListBox ("periodDue",[["Due Now","dueNow"],["Next 24 Hrs","dueToday"], ["Next 7 Days","dueThisWeek"], ["Overdue","overdue"]], "periodTemp");
	if (typeof cardboxStatsPanel=='undefined'){cardboxStatsPanel="dueNow";}
	else {$('#periodDue').val(cardboxStatsPanel)};
	$("#periodDue").change(function() { 
		cardboxStatsPanel = $ ( this ).val();
		showCardboxStats(1);		  
	});
	gGenerateTable(['Length','','Alphagrams','In Cardbox','%'], 'coverageContent', 'statTable', 'coverageTable','coverageBody');
	$('#cardboxTable, #coverageTable').css('visibility','hidden');	
  }
}

function cardboxHighlightAction(row, state){
	$('[id^=cardboxNum],[id^=cardboxTotal],[id^=cardboxDue]').each(function(){
		$(this).removeClass("highlightRow");
	});
	$("#cardboxNum"+row).addClass("highlightRow");
	$("#cardboxTotal"+row).addClass("highlightRow");
	$("#cardboxDue"+row).addClass("highlightRow");
	localStorage.cardboxCurrent=row;
	if (($("#pan_1_a").length>0) && (state===true)){localStorage.cardboxSent='true';startQuiz();}
}

function displayCardboxDue (response, responseStatus) {
// var totalBase=0;var scoreBase=0;
	var stats=response[0];
	var cardboxTotal=0;
	var dueTotal=0;
	var dueValue=0;
	createCardboxStatsPanel();
	$('#cardboxUpdateTimeBox').html('...');
	document.getElementById('cardboxTableBody').innerHTML="";
	var arrayOfCardboxes = Object.keys(stats.totalCards).sort(function(a,b) {
			return parseInt(a) - parseInt(b); });	
			
	arrayOfCardboxes.forEach(function(cardbox) {
		if (cardbox in eval('stats.dueByCardbox.'+cardboxStatsPanel)){
		dueValue = eval('stats.dueByCardbox.'+cardboxStatsPanel+'["' + cardbox + '"]');}
		else {dueValue = "";}		
		gGenerateTableRow (
		['cardboxNum'+cardbox,null,"cardboxTotal"+cardbox, "cardboxDue"+cardbox],
		[cardbox, "", eval('stats.totalCards["' + cardbox + '"]'), dueValue],
		"cardboxTableBody", "cardboxDueRow"+cardbox);
		
		cardboxTotal+= Number($('#cardboxTotal'+cardbox).html());
		dueTotal+=Number($('#cardboxDue'+cardbox).html());
        $('#cardboxNum'+cardbox+',#cardboxTotal'+cardbox+',#cardboxDue'+cardbox).on("click",function(){cardboxHighlightAction(cardbox, true);});
	});	
	gGenerateTableRow ([null,null,null,null],['Total','',cardboxTotal,dueTotal],"cardboxTableBody","cardboxDueFoot");
	cardboxHighlightAction(localStorage.cardboxCurrent, false);
	$('#cardboxTable').css('visibility','visible');
	$('#cardboxUpdateTimeBox').html(returnUpdateTime());
}

function displayCardboxCoverage(response,responseStatus){
	var cover=response[0].coverage;
	var alphaTotal=0;
	var availTotal=0;
	var leng; var values;
	createCardboxStatsPanel();
	$('#cardboxUpdateTimeBox').html('...');
	document.getElementById('coverageBody').innerHTML="";
	var arrayOfLengths = Object.keys(cover).sort(function(a,b) {
			return parseInt(a) - parseInt(b); });
	console.log(arrayOfLengths);
	for (var x=0;x<arrayOfLengths.length;x++){
		values= cover[arrayOfLengths[x]];
		leng = arrayOfLengths[x];
		alphaTotal+= values.cardbox;
		availTotal+= values.total;
	gGenerateTableRow(
	['lengthNum'+leng,null,'availNum'+leng,'inNum'+leng,'percent'+leng],
	[leng,"", values.total, values.cardbox, values.percent+"%"],
	"coverageBody","cardboxCoverRow"+leng);
	};
	console.log(response[0]);
	gGenerateTableRow ([null,null,null,null],['Total','',availTotal,alphaTotal,(((alphaTotal/availTotal)*100).toFixed(2))+'%'],"coverageBody","coverageFoot");
	$('#coverageTable').css('visibility','visible');
	$('#cardboxUpdateTimeBox').html(returnUpdateTime());
}

function hideCardboxStats() {
	clearTimeout(cardboxTimeout);
	$('#pan_4').remove();
}
