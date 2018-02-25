
function findPanel(panel){
	var panelList=JSON.parse(localStorage.panelPositions);
	//RF NOTE: likely a good solution involving $.each and $.inarray, but I haven't figured them out yet to work in a 3 dimension array walk.
	for (var x=panelList.length-1;x>-1;x--){
		if (typeof panelList[x]!=='undefined'){
			for (var y=panelList[x].length-1;y>-1;y--){
				if (typeof panelList[x][y]!=='undefined'){
					if (panelList[x][y][0].toString()==panel){
						return [x,y];
					}
				}
			}
		}
	}
	return false;
}
			
function clearPanel(panel){
	var x=findPanel(panel);
	if (!x) {console.log('Error when attempting to remove panel: '+panel+' does not exist!');}
	else {
		var cols=JSON.parse(localStorage.panelPositions);
		cols[x[0]].splice(x[1],1);
		localStorage.panelPositions=JSON.stringify(cols);
		console.log('After Deletion:'+localStorage.panelPositions);
	}
}

function togglePanel(panel){
	var x=findPanel(panel);
	if (!x) {console.log('Error when attempting to toggle panel: '+panel+' does not exist!');}
	var cols=JSON.parse(localStorage.panelPositions);
	cols[x[0]][x[1]][1]=!(cols[x[0]][x[1]][1]);
	localStorage.panelPositions=JSON.stringify(cols);
	console.log('After Toggle:'+localStorage.panelPositions);	
}

function addPanel(panel,column ,ind){
	var colValue=getPanelValue(column);	
	if (ind=-1){
		
		if ((typeof temp==='undefined') || (typeof temp[colValue]==='undefined')){ind =0;}	
		else {ind = temp[colValue].length;}
	}
		var cols=JSON.parse(localStorage.panelPositions);
		var insertArr = new Array(panel.toString(),false);
		if (typeof cols[colValue]==='undefined'){
			cols.splice(0,0,[]);cols.splice(1,0,[]);cols.splice(2,0,[]);
		}
		cols[colValue].splice(ind,0,insertArr);
		localStorage.panelPositions=JSON.stringify(cols);
}

function getPanelName(value){
	switch(value){
		case 0:targetPanel='leftArea'; break;
		case 1:targetPanel='middleArea'; break;
		case 2:targetPanel='rightArea'; break;
	}
	return(targetPanel);
}

function getPanelValue(value){
	switch(value){
		case 'leftArea' : targetPanel=0; break;
		case 'middleArea' : targetPanel=1; break;
		case 'rightArea' : targetPanel=2; break;
	}
	return(targetPanel);
}

function panelFunctionLookup(panel){
	switch (panel){
		case '1_a': startQuiz(); break;
		case '1_b': initSloth(); break;
		case '1_c': initInvaders(); break;
		case '1_d': initUserPrefs(); break;
		case '1_e': showShameList(); break;
		case '1_f': showManageCardbox(); break;
		case '2': startChat(); break;
		case '3': initLeaderboard(); break;
		case '4': showCardboxStats(); break;
		case '5': showAlphaStats(""); break;
		case '6': showGameStats(); break;
	}
}

function populatePanelsFromArray(){
//NOTE: This method does not call generatePanel below directly, it calls the functions
//required to start the panel which, after ajax calls, variable inits, etc... call generatePanel.
//If nextTarget and nextMinim exist, they override some of the values set from those scripts,
//clearing those two localStorage variables on closure (so that they don't fire again without being 
//reinitialized.)
	
	var panelList=JSON.parse(localStorage.panelPositions);
	console.log('Panel Population called, contents: '+ JSON.stringify(panelList));
	var colStateArray = new Array();
	//These 2 loops have to be separate (thread/race conditions between generatePanel & AjaX calls)
	for (var x=0;x<3;x++){
		var targetPanel=getPanelName(x);
		if (typeof panelList[x]==='undefined'){
			panelList.splice(x,0,[]);
		}
		for (var y=0;y<panelList[x].length;y++){
			if (typeof panelList[x][y].length!=='undefined'){
				var temp = [panelList[x][y][0].toString(),panelList[x][y][1].toString(),targetPanel,y];
				colStateArray.push(temp);
			}
		}
	}
	localStorage.setItem('panelStateArray', JSON.stringify(colStateArray));
	for (var x=0;x<3;x++){		
		for (var y=0;y<panelList[x].length;y++){
			if (typeof panelList[x][y].length!=='undefined'){
				panelFunctionLookup(panelList[x][y][0].toString());	
			}
		}
	}
	console.log('panel States:'+JSON.stringify(colStateArray));
}

function getPanelInStorageQueue(panel){
	if (typeof localStorage.panelStateArray==='undefined'){return false;}
	var storageQueue=JSON.parse(localStorage.panelStateArray);
	for (var y=0;y<storageQueue.length;y++){
		if (storageQueue[y][0] == panel) {
			var result=[storageQueue[y][0],storageQueue[y][1],storageQueue[y][2],storageQueue[y][3],y];
			return result;
		}	
	}
	return false;
}

function removePanelInStorageQueue(panel){
	var storageQueue=JSON.parse(localStorage.panelStateArray);
	var ind=getPanelInStorageQueue(panel);
	console.log("Removing: "+JSON.stringify(ind));
	storageQueue.splice(ind[4],1);
	if (storageQueue.length==0){
		console.log("All panels loaded, clearing queue");
		localStorage.removeItem('panelStateArray');}
	else {localStorage.panelStateArray=JSON.stringify(storageQueue);
		console.log('Remaining Queue: '+localStorage.panelStateArray);
	}
}

function generatePanel(ident, data, targ, refresher, closure){
	if (typeof data.variant==='undefined'){
		var panelSuffix = ident;
		var queueData=getPanelInStorageQueue(panelSuffix.toString());
		console.log('Queuedata Get for '+panelSuffix+' (No variant) = '+JSON.stringify(queueData));
		console.log(panelSuffix+' detected in queue at row '+queueData[4]);
	}
	else {
		var panelSuffix = ident+'_'+data.variant;
		var queueData=getPanelInStorageQueue(panelSuffix.toString());
		console.log('Queuedata Get for '+panelSuffix+' = '+JSON.stringify(queueData));
		if (typeof queueData[4]!=='undefined'){console.log(panelSuffix+' detected in queue at row '+queueData[4]);}
		if (!queueData){
			console.log("Queue:"+queueData);
		if (($('[id^=pan_'+ident+'_]').length>0) && ($('[id^=pan_'+panelSuffix+']').length==0)) {
			console.log($('[id^=pan_'+ident+'_]').length+"-"+$('[id^=pan_'+panelSuffix+']').length);
			var parentNode = $('[id^=pan_'+ident+'_]:first').parent();
			var indexValue = $('[id^=pan_'+ident+'_]:first').index(parentNode);
			console.log($(parentNode)+"-"+indexValue);
			$('[id^=pan_'+ident+'_]').each(function(){
				console.log('This:'+this);
				var divId=$(this).attr('id');
				clearPanel(divId.replace("pan_",""));
				$(this).remove();				
			});
			var indexMe=true;
		}
		else {
			var indexMe=false;
			
		}
		}
	}
	var buttonStyle="default"
	console.log('Loading Panel: '+panelSuffix);
	if (typeof data.style=='undefined'){
		data.style='Dark';
		buttonStyle="primary";
		
	}
		var newPanel = document.createElement('div');
		newPanel.id = 'pan_'+panelSuffix;
		newPanel.className += ' well well-sm panelStyle'+data.style;
		newPanel.style.marginBottom = '10px';
		
		var panelHeader = document.createElement("div");
		panelHeader.id = 'header_pan_'+panelSuffix;
		$('#header_pan_'+ident).css({"width":"100%"});
		panelHeader.style.display='flex';
		panelHeader.style.flexDirection='row';
		panelHeader.style.flexWrap="nowrap";
		
		var btnGroup = document.createElement("div");
		btnGroup.id = 'btnGroup_pan_'+panelSuffix;
		btnGroup.className += ' btn-group btn-group-sm';
		$('#btnGroup_pan_'+ident).css({"vertical-align":"middle","padding":"0px","margin":"0px","white-space":"nowrap","flex":"0 0"});
		
		if (typeof data.closeButton==='undefined') {
		data.closeButton=true;
		var closeButton = document.createElement('button');
		closeButton.id = 'close_button_pan_'+panelSuffix;
		closeButton.className += ' btn btn-danger';
		$(closeButton).css('flex','0 0');		
		$(closeButton).html('<span class="glyphicon glyphicon-remove" style="vertical-align:middle"></span>');
		}
		
		if (typeof data.refreshButton==='undefined') {
		data.refreshButton=true;
		var refreshButton = document.createElement('button');
		refreshButton.id = 'refresh_button_pan_'+panelSuffix;
		refreshButton.className += ' btn btn-'+buttonStyle;
		$(refreshButton).html('<span class="glyphicon glyphicon-refresh" style="vertical-align:middle"></span>');
		btnGroup.appendChild(refreshButton);
		refreshButton.onclick = refresher;
		}
		
		var helpButton = document.createElement('button');
		helpButton.id = 'help_button_pan_'+panelSuffix;
		helpButton.className += ' btn btn-'+buttonStyle;
		$(helpButton).html('<span class="glyphicon glyphicon-question-sign" style="vertical-align:middle"></span>');
		
		var minimizeButton = document.createElement('button');
		minimizeButton.id = 'minim_button_pan_'+panelSuffix;
		minimizeButton.className += ' btn btn-'+buttonStyle;
		
		if ((typeof queueData!=='boolean') && (queueData[1]=="true")) {
			var minimcont='<span class="glyphicon glyphicon-chevron-down" style="vertical-align:middle"></span>';}
		else 
			{var minimcont='<span class="glyphicon glyphicon-chevron-up" style="vertical-align:middle"></span>';}		
		$(minimizeButton).html(minimcont);		
		
		var headingText = document.createElement('div');
		headingText.id = 'heading_text_pan_'+panelSuffix;
		headingText.className += ' panelHeader'+data.style+' dragMe noselect';
		$(headingText).css('flex','1 1');
		$(headingText).html(data.title);
				
		btnGroup.appendChild(helpButton);
		btnGroup.appendChild(minimizeButton);
		$(panelHeader).append(btnGroup, headingText);
		if ((data.closeButton)==true){
			closeButton.onclick = function(){
				closure();
				clearPanel(panelSuffix);
			}
			panelHeader.appendChild(closeButton);
		}
		newPanel.appendChild(panelHeader);
		
		var panelContent = document.createElement('div');
		panelContent.id = 'content_pan_'+panelSuffix;
		panelContent.className = " "+data.contentClass;
		newPanel.appendChild(panelContent);
		
		var fireOnce=once(function () {console.log('Hiding Panel :'+panelSuffix);
		if ((typeof queueData!=='boolean') && (queueData[1]=="true")) {	
			if (typeof data.minimizeObject!=='undefined'){
				$('#'+data.minimizeObject).ready(function () {
					$('#'+data.minimizeObject).hide();
				});
			}
			else {
				$('#content_pan_'+panelSuffix).hide();
			}		
		}
		});
		
		$(newPanel).ready(function(){fireOnce()});
					
		$(document).ready(function(){
			$("#help_button_pan_"+panelSuffix).tooltip({title: data.tooltip, placement : "bottom", html : true, container : "#pan_"+panelSuffix, trigger : "click"});
			
			$('#minim_button_pan_'+panelSuffix).click(function(){
				togglePanel(panelSuffix);
				if (typeof data.minimizeObject!=='undefined'){
					$('#'+data.minimizeObject).slideToggle(400)
				}
				else {
					$('#content_pan_'+panelSuffix).slideToggle(400)
				};
				$('#minim_button_pan_'+panelSuffix+'> span').toggleClass("glyphicon-chevron-down");
				$('#minim_button_pan_'+panelSuffix+'> span').toggleClass("glyphicon-chevron-up");
				});		
		});	
		//Panel hiding from memory on refresh
		//DOMNodeInserted events are to be deprecated at some point (once people stop using IE, most likely :p)
		//and we need to learn more about Mutation Handlers in general .
		
		if (typeof queueData=='boolean') {
			if (indexMe==true){
				console.log('Replace Fired: '+panelSuffix+', Par:'+$(parentNode).attr('id')+' Ind:'+ indexValue);
				$(parentNode).eq(indexValue).prepend(newPanel);
				
				addPanel(panelSuffix, $(parentNode).attr('id'), indexValue);
			}
			else {
				console.log('Prepend New Fired: '+panelSuffix+','+targ+' at location 0');
				$('#'+targ).prepend(newPanel);
				addPanel(panelSuffix, targ, 0);
				
			}	
		}
		else {
			console.log("Panel Memory Fired: "+queueData[2]+" Position: "+queueData[3]);
			if ($("#"+queueData+" > div").length<queueData[3]){
				$('#'+queueData[2]).append(newPanel);
			}
			else {
				$('#'+queueData[2]).eq(queueData[3]).prepend(newPanel);
			}
			removePanelInStorageQueue(panelSuffix);
		}
}