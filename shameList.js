
function showShameList() {
	if (!document.getElementById("pan_1_e")) {	
		panelData = {	
					"contentClass" : "panelContentDefault",
					"title": "List of Shame",
					"minimizeObject": "content_pan_1_e",
					"variant": "e",
					"closeButton": false,
					"refreshButton" : false,	
					"style" : 'Light',
					"tooltip": "<p>Something helpful will go here.</p>"
					};
		generatePanel(1,panelData,"leftArea");
  
  var textArea = document.createElement("textarea");
  textArea.cols = 40;
  textArea.rows = 10;
  textArea.id = "shameList";
  textArea.style.textTransform = "uppercase";
  x = document.createElement("div");
  x.style.textAlign = "left";
  x.innerHTML = "Enter a list of alphagrams or words.<br>Each of these will be reset to cardbox 0 or queued to be added to your cardbox.";
  document.getElementById("content_pan_1_e").appendChild(x);
  document.getElementById("content_pan_1_e").appendChild(textArea);
  x = document.createElement("div");
  x.style.textAlign = "center";
  var y = document.createElement("button");
  y.innerHTML = "Submit";
  y.id = "shameButton";

  x.appendChild(y);
  document.getElementById("content_pan_1_e").appendChild(x);
  $('#shameButton').click(function() { submitShameList($("#shameList").val()); });
	}
  }

function submitShameList(text) {
  var shameArr = text.replace(/[\r\n]+/g, " ").split(" ");
  var newArr = shameArr.map(function(x, i, arr) { return toAlpha(x.toUpperCase().replace(/[^A-Z]/g, ""));});
  shameArr = Array.from( new Set (newArr)); // remove duplicates
  var callback = function(response, responseStatus) { console.log(response); };
  var callbackEnd = function(response, responseStatus) { console.log(response);
               						alert("Updating words complete."); };
  for (var i=0;i<shameArr.length;i++) {
     if (shameArr[i].length<4) continue;
     var d = { user: userid, question: shameArr[i]};
     $.ajax({
        type: "POST",
        url: "shameWord.py",
        data: JSON.stringify(d),
        success: (i==shameArr.length-1 ? callbackEnd : callback),
        error: function(jqXHR, textStatus, errorThrown) { console.log("Error: " + textStatus); }
        });

  }
}

