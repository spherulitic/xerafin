function initUserPrefs() {

 // ajax call to get user prefs

}

function showUserPrefs(response, responseStatus) {

  // get response from ajax call
  // need prefs and currently occupied cardboxes

  var prefForm = "<h3>User Preferences</h3>";
  prefForm += "<p>Xerafin will give you words that are due in order from cardbox 0 ";
  prefForm += "through cardbox <select id='closetInput'></select>.<br>"
  prefForm += "Then it will give you words scheduled in the near future. For each hour you work ahead, it will give you 10 words which are overdue in cardbox <span id=closetValue></span> or higher.<br>";
  prefForm += "After <input type=text id='reschedHrsInput'></input> hours, it will add <input type=text id='newWordsAtOnceInput'></input> words for each additional hour you work ahead, as long as Cardbox 0 has fewer than <input type=text id='cb0SizeInput'> cards in it."
  upForm += "<input type=file id='cboxFile' accept='.db'>";
  upForm += "<input type=button value='Upload' id='uploadButton' onclick='uploadCardbox()'>";
  if (URLExists('cardboxes/' + userid + '.db')) {
    upForm += "<br><br><a href='cardboxes/" + userid + ".db'>Download Cardbox Here</a> <br> (Right Click and Save As...)";
  upForm += "<hr>";
  upForm += "<h3>Upload Custom Word List</h3>";
  upForm += "<p>Upload a .txt file with one alphagram or word per line.</p>";
  upForm += "<p>These words will be added to you cardbox ahead of the default study list.</p>";
  upForm += "<input type=file id='wlistFile' accept='.txt'>";
  upForm += "<input type=button value='Submit' id='listUploadButton' onclick='uploadNewWordList()'>";
        }
  $( "#gameArea" ).html(upForm);

  }

function uploadCardbox() {
  $( "#uploadButton" ).prop("disabled", true);
  $( "#uploadButton" ).val("Uploading...");
  var file = document.getElementById('cboxFile').files[0];
  var formdata = new FormData();
  formdata.append(userid, file, 'cardbox.db');
  $.ajax({
	type: 'POST',
	url: 'uploadCardbox.py',
	data: formdata,
	processData: false,
	contentType: false,
 	success: cardboxUploadCallback});
}

function cardboxUploadCallback(response, responseStatus) {
  $( "#uploadButton" ).prop("disabled", false);
  $( "#uploadButton" ).val("Upload");
  console.log("Cardbox upload script status is " + response.status);
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

