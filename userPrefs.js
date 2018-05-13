function initUserPrefs() {
	var d = { userid: userid };
	$.ajax({
		type: "POST", 
		url: "getUserPrefs.py",
		data: JSON.stringify(d),
		success: showUserPrefs,
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Error retrieving user prefs. Status: " + textStatus + "  Error: " + errorThrown); 
		}
	});
}

function showUserPrefs(response, responseStatus) {
	appendDebugLog(response[0]);
	var prefs = response[0];
	if (!document.getElementById("pan_1_d")) {	
		panelData = {	
					"contentClass" : "panelContentDefault",
					"title": "Preferences",
					"style": "Dark",
					"variant": "d",
					"closeButton": false,
					"refreshButton" : false,	
					"tooltip": "<p>Under Redevelopment.</p>"
					};
		generatePanel(1,panelData,"leftArea");
		gCreateElemArray([
			['a0','div','','prefDiv','content_pan_1_d',''],
			['a1','ul','nav nav-pills nav-justified','prefTabs','a0',''],
			['a1a','li','active','prefCardboxTab','a1','<a data-toggle="tab" href="#prefCardboxDiv">Cardbox</a>'],
			['a1b','li','','prefAppearanceTab','a1','<a data-toggle="tab" href="#prefAppearanceDiv">Appearance</a>'],
			['a1c','li','','prefGameSettingTab','a1','<a data-toggle="tab" href="#prefOtherDiv">Other</a>'],
			['a2','div','tab-content well well-sm quizContent pre-scrollable prefContent','prefContent','a0',''],
			['a2a','div','tab-pane fade in active','prefCardboxDiv','a2',''],
			['a2Head','div','prefHead','prefCardboxHead','a2a','Cardbox'],
			['a2a4','div','prefPar','prefScheduleType','a2a',''],
			['a2a4a','span','','prefScheduleS1','a2a4','Schedule words using the '],
			['a2a4c','span','','prefScheduleS2','a2a4',' scheduling method.'],	
			['a2a1','div','prefPar','prefCloset','a2a',''],
			['a2a1a','span','','prefClosetS1','a2a1','Xerafin will give you words that are due in order from cardbox 0 through cardbox '],
			['a2a2','div','prefPar','prefClosetStatus','a2a',''],
			['a2a2a','span','','prefClosetStatusS1','a2a2','Then it will give you words scheduled in the near future. For each hour you work ahead, it will give you 10 words which are overdue in cardbox '],
			['a2a2b','span','','prefClosetValue','a2a2',parseInt(prefs.closet)+1],
			['a2a2c','span','','prefClosetStatusS2','a2a2',' or higher.'],
			['a2a3','div','prefPar','prefNewWords','a2a',''],
			['a2a3a','span','','prefNewWordsS1','a2a3','After '],
			['a2a3b','input','prefInput','reschedHrsInput','a2a3',''],
			['a2a3c','span','','prefNewWordsS2','a2a3',' hours, it will add '],
			['a2a3d','input','prefInput','newWordsAtOnceInput','a2a3',''],
			['a2a3e','span','','prefNewWordsS3','a2a3',' words for each additional hour you work ahead, as long as cardbox 0 has fewer than '],
			['a2a3f','input','prefInput','cb0maxInput','a2a3',''],
			['a2a3g','span','','prefNewWordsS4','a2a3',' questions in it.'],
			['a2b','div','tab-pane fade','prefAppearanceDiv','a2',''],
			['a2bHead','div','prefHead','prefAppHead','a2b','Appearance'],
			['a2b1','div','prefPar','prefAlphaArrange','a2b',''],
			['a2b1a','span','','prefAlphaArrangeS1','a2b1','All quiz alphagrams will be arranged '],
			['a2b2','div','prefPar','prefAlphaDisplay','a2b',''],
			['a2b2a','span','','prefAlphaDisplayS1','a2b2','Alphagrams are to be displayed as '],
			['a2c','div','tab-pane fade','prefOtherDiv','a2',''],
			['a2c1','div','prefHead','prefOtherHead','a2c','Other'],
			['a2c3','div','prefPar','prefSlothSubalphas','a2c',''],
			['a2c3a','span','','prefSlothSubsS1','a2c3','In Sloth, quiz on '],
			['a3','button','btn btn-default','prefSaveButton','a0','Save']
		]);
		$('#reschedHrsInput').val(prefs.reschedHrs);
		$('#newWordsAtOnceInput').val(prefs.newWordsAtOnce);
		$('#cb0maxInput').val(prefs.cb0max);
		gSetInputSize('reschedHrsInput',3,3);
		gSetInputSize('newWordsAtOnceInput',3,3);
		gSetInputSize('cb0maxInput',4,4); 	
		generateSchedInfo(prefs.schedVersion);
		var opt=new Array();
		for (var x=4;x<21;x++) {opt.push([x.toString(),x]);}
		gGenerateListBox("prefClosetInput",opt,'prefCloset','');
		$('#prefClosetInput').val(Number(prefs.closet));
		$('#prefClosetInput').on('change',function(e){prefsChangeCloset(this.value);});	
		gGenerateListBox("prefAlphaArrangeSelect",[['Alphabetically',0],['Vowels First',1],['Consonants First',2],['Randomly',3]],"prefAlphaArrange","");
		$('#prefAlphaArrangeSelect').insertAfter($(this).parent().eq(0));
		$('#prefAlphaArrangeSelect').val(Number(localStorage.gAlphaSortInput));
		$('prefAlphaArrangeSelect').on('change',function () {localStorage.gAlphaSortInput = this.value;});
		$('#prefSaveButton').on('click',function(){setPrefs();});
		gGenerateListBox("schedVersion",[["Original",0],["Modified",1],["Forgiving",2]],"prefScheduleType","");
		$('#schedVersion').val(prefs.schedVersion); 
		$('#schedVersion').insertAfter($('#prefScheduleS1'));
		$('#schedVersion').on('change',function(e){
			$('#schedTable').remove();
			$('#schedComment').remove();
			generateSchedInfo(Number($('#schedVersion').val()));
		});
		gGenerateListBox("slothSetup",[['All Subanagrams',0],['Some Subanagrams',1]],"prefSlothSubalphas",'');
		$('#slothSetup').insertAfter($('#prefSlothSubsS1'));
		$('#slothSetup').val(Number(localStorage.gSlothPref));
		$('#slothSetup').on('change',function(e){localStorage.gSlothPref = $('#slothSetup').val();});
		gGenerateListBox("alphaDisplay",[['Tiles',0],['Capital Letters',1]],"prefAlphaDisplay","");
		$('#alphaDisplay').insertAfter($('#prefAlphaDisplayS1'));
		$('#alphaDisplay').val(Number(localStorage.gAlphaDisplay));
		$('#alphaDisplay').on('change',function(e){localStorage.gAlphaDisplay = $('#alphaDisplay').val();});
	}
}

function writeSchedInfo(schedInfo){
	var timeframe = new Array();
	timeframe = ['hrs','days','wks','mths','yrs'];
	gGenerateTable(['#','Range','#','Range'], 'prefScheduleType', 'userSearch prefTable', 'schedTable', 'schedContent');
	var y;
	var z = Math.ceil(schedInfo[0].length/2);
	for (var x=0;x<z;x++){
		if (x+z==schedInfo[0].length-1){y="+";} else {y="";}
		if (x<z-1){
			gGenerateTableRow (['cardboxSchedNumber'+x,'cardboxSchedRange'+x], 
						[x, schedInfo[0][x][0]+' - '+schedInfo[0][x][1]+' '+timeframe[schedInfo[0][x][2]],
						x+z+y, schedInfo[0][x+z][0]+' - '+schedInfo[0][x+z][1]+' '+timeframe[schedInfo[0][x+z][2]]], 
						'schedTable', "cardboxSchedRow"+x);
		}		
		else {
			if (isOdd(schedInfo[0].length)==true){
				gGenerateTableRow (['cardboxSchedNumber'+x,'cardboxSchedRange'+x], 
						[x, schedInfo[0][x][0]+' - '+schedInfo[0][x][1]+' '+ timeframe[schedInfo[0][x][2]],"",""]
						,'schedTable', "cardboxSchedRow"+x)
			}
			else {
				gGenerateTableRow (['cardboxSchedNumber'+x,'cardboxSchedRange'+x], 
						[x, schedInfo[0][x][0]+' - '+schedInfo[0][x][1]+' '+timeframe[schedInfo[0][x][2]],
						x+z+y, schedInfo[0][x+z][0]+' - '+schedInfo[0][x+z][1]+' '+timeframe[schedInfo[0][x+z][2]]], 
						'schedTable', "cardboxSchedRow"+x);
			}
		}
	}
	$('#prefScheduleType').append($('#schedTable'));
	var comment = document.createElement('div');
	comment.id = 'schedComment';
	comment.className+=" italNote";
	console.log(schedInfo[1]);
	$(comment).html(schedInfo[1]);
	$('#prefScheduleType').append(comment);
}
function generateSchedInfo(sched){
	var schedule = new Array();	
	var infoMessage = new Array();
	schedule = [
				[[12,37,0],[3,5,1],[5,9,1],[11,17,1],[16,26,1],[27,41,1],[50,70,1],[80,110,1],[130,170,1],[300,360,1],[430,530,1]],
				[[5,12,0],[1,2,1],[3,6,1],[7,14,1],[14,28,1],[30,60,1],[60,105,1],[120,210,1],[240,360,1],[430,530,1]],
				[[12,37,0],[3,5,1],[5,9,1],[11,17,1],[16,26,1],[27,41,1],[50,70,1],[80,110,1],[130,170,1],[300,360,1],[430,530,1]],
				];
	
	infoMessage = [
		'All alphagrams answered incorrectly using this schedule return to cardbox 0.',
		'Alphagrams answered incorrectly using this schedule that are residing in cardbox 8 or above return to cardbox 2 instead of cardbox 0.'
	]
	switch (sched) {
		case 0: writeSchedInfo([schedule[0],infoMessage[0]]);break;
		case 1: writeSchedInfo([schedule[1],infoMessage[1]]);break;
		case 2: writeSchedInfo([schedule[2],infoMessage[1]]);break;
	}
				
}

function setPrefs() {
	var d = {
		user: userid, 
		newWordsAtOnce: $('#newWordsAtOnceInput').val(),
		reschedHrs: $('#reschedHrsInput').val(),
		cb0max: $('#cb0maxInput').val(), 
		closet: $('#prefClosetInput').val(),
		schedVersion: $('#schedVersion').val()
	};
	appendDebugLog(d);
	$.ajax({
		type: "POST", 
		url: "setUserPrefs.py",
		data: JSON.stringify(d),
		success: function(response) {
			if (response.status == "success") {
				alert("User Prefs Saved.");
				initUserPrefs();
			}
			else alert("Error setting user prefs: " + response.status);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log("Error setting user prefs. Status: " + textStatus + "  Error: " + errorThrown); 
			alert("Error setting user prefs: " + errorThrown);
		}
	});
}

function prefsChangeCloset(c) {
 $('#prefClosetValue').html(parseInt(c)+1);
}