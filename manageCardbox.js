function URLExists(url) {
   var http = new XMLHttpRequest();
   http.open('HEAD', url, false);
   http.send();
   return http.status != 404;
}

function showManageCardbox() {
	
  if (!document.getElementById("pan_1_f")) {	
		panelData = {	
					"contentClass" : "panelContentDefault",
					"title": "Cardbox File Management",
					"minimizeObject": "content_pan_1_f",
					"variant": "f",
					"closeButton": false,
					"refreshButton" : false,	
					"style" : 'Light',
					"tooltip": "<p>Something helpful will go here.</p>"
					};
		generatePanel(1,panelData,"leftArea");
		upForm = "<h3>Upload Custom Word List</h3>";
  upForm += "<p>Upload a .txt file with one alphagram or word per line.</p>";
  upForm += "<p>These words will be added to your cardbox ahead of the default study list.</p>";
  upForm += "<input type=file id='wlistFile' accept='.txt'>";
  upForm += "<input type=button value='Submit' id='listUploadButton' onclick='uploadNewWordList()'>";
  upForm += "<hr>";
  upForm += "<h3>Upload Cardbox</h3>";
  upForm += "<p style='color: red'>Caution: This will replace your existing cardbox</p>";
  upForm += "<input type=file id='cboxFile' accept='.db'>";
  upForm += "<input type=button value='Upload' id='uploadButton' onclick='uploadCardbox()'>";
  if (URLExists('cardboxes/' + userid + '.db')) {
    upForm += "<br><br><a href='cardboxes/" + userid + ".db'>Download Cardbox Here</a> <br> (Right Click and Save As...)";
        }
  $( "#content_pan_1_f" ).html(upForm);
  }
}

function uploadCardbox() {
  var fileList = document.getElementById('cboxFile').files;
  if (fileList.length == 0) {
    alert("Please select a cardbox file to upload"); }
  else {
    var file = fileList[0];
    $( "#uploadButton" ).prop("disabled", true);
    $( "#uploadButton" ).val("Uploading...");
    var formdata = new FormData();
    formdata.append(userid, file, 'cardbox.db'); 
    $.ajax({
	type: 'POST',
	url: 'uploadCardbox.py',
	data: formdata,
	processData: false,
	contentType: false,
 	success: cardboxUploadCallback}); }
}

function cardboxUploadCallback(response, responseStatus) {
  $( "#uploadButton" ).prop("disabled", false);
  $( "#uploadButton" ).val("Upload");
  console.log("Cardbox upload script status is " + response.status);
  alert("Cardbox Upload Complete");
}

function uploadNewWordList() {
  $("#listUploadButton").prop("disabled", true);
  $("#listUploadButton").val("Uploading...");
  var file = document.getElementById('wlistFile').files[0];
  var formdata = new FormData();
  formdata.append(userid, file, 'list.txt');
  $.ajax({ type: 'POST',
	   url: 'uploadNewWordList.py', 
          data: formdata,
          processData: false,
          contentType: false,
          success: function(response, responseStatus) {
		$('#listUploadButton').prop('disabled', false);
                $('#listUploadButton').val('Success');
          console.log("Word List Upload Status: " + response); }});
}

