function gGenerateTable(headers, pare, classNames, identTable, identBody){
	var theTable = document.createElement('table');
	var theHeading = document.createElement('thead');
	var theRow = document.createElement('tr');
	var theBody = document.createElement('tbody');
	var theCols = new Array();
	theTable.id = identTable;
	theBody.id = identBody;
	
	for (var x=0; x<headers.length;x++){
		theCols[x]=document.createElement('th');
		console.log(typeof headers[x]);
		if (typeof headers[x] === 'object'){theCols[x].appendChild(headers[x]);}
		else {theCols[x].innerHTML= headers[x];}
		theRow.appendChild(theCols[x]);
	}
	$(theHeading).append(theRow);
	$(theTable).append(theHeading);
	$(theTable).append(theBody);
	$('#'+pare).append(theTable);
	document.getElementById(identTable).className=" "+classNames;
}

function gGenerateTableRow (colIds, values, pare, rowId){
	var theRow = document.createElement('tr');
	var theCols = new Array();
	theRow.id = rowId;
	
	for (var x=0;x<values.length;x++){
		theCols[x]=document.createElement('td');
		if (typeof values[x] === 'object'){theCols[x].appendChild(values[x]);}
		else {theCols[x].innerHTML= values[x];}
		if (typeof colIds[x]!=='null'){
			theCols[x].id=colIds[x];
		}
		$(theRow).append(theCols[x]);
	}
	$('#'+pare).append(theRow);
}

function gGenerateListBox (ident, content, pare){
	var listBox = document.createElement('select');
	listBox.id = ident;
	listOption = new Array();
	for (var x=0;x<content.length;x++){
		listOption[x] = document.createElement("option");
		listOption[x].text = content[x][0];
		listOption[x].value = content[x][1];
		listBox.add(listOption[x]);	
	}
	$("#"+pare).append(listBox);
}