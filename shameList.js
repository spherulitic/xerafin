
function showShameList() {
	if (!document.getElementById("pan_1_e")) {	
		panelData = {	
					"contentClass" : "panelContentDefault",
					"title": "List of Shame",
					"minimizeObject": "content_pan_1_e",
					"variant": "e",
					"closeButton": false,
					"refreshButton" : false,	
					"style" : 'Dark',
					"tooltip": "<p>Something helpful will go here.</p>"
					};
		generatePanel(1,panelData,"leftArea");
		gCreateElemArray([
			['a0','div','well well-sm quizContent','shameDiv','content_pan_1_e',''],
			['a1','div','shameDesc','shameDesc','a0','Enter a list of alphagrams or words.<br>Each of these will be reset to cardbox 0 or queued to be added to your cardbox.'],
			['a2','div','shameWrap','shameWrap','a0',''],
			['a2a','textArea','shameList','shameList','a2',''],
			['a3','button','btn btn-default shameButton','shameButton','a0','Submit']
		]);
		$('#shameList').prop('cols',40);
		$('#shameList').prop('rows',10);
		$('#shameList').css('textTransform','uppercase');
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

