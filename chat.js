function startChat () {
   getLoggedInUsers();
   mostRecent = (new Date).getTime() - 86400000; // One Day Ago
   chatQueue = [ ];
   CHAT_QUEUE_MAX_LENGTH = 100;
   var usersLabel = document.createElement("div");
   usersLabel.className += ' tableHeaderLight'
   usersLabel.innerHTML = "User Chat";
   var userDisplayArea = document.createElement("div");
   userDisplayArea.id = "userDisplayArea";
   userDisplayArea.style.width = "100%";
   userDisplayArea.style.padding = '5px';
   var chatBox = document.createElement("input");
   chatDisplayTable = document.createElement("table");
   chatBox.type = "text";
   chatBox.id = "chatBox";
   chatBox.style.display = "block";
   chatBox.style.width = "100%";
   chatBox.style.marginTop = "5px";
   chatBox.style.marginBottom = "5px";
   chatBox.addEventListener("keypress", function(e) {
	if (e.which === 13 && $(this).val().trim()) {
           submitChat($(this).val(), false);
           $(this).val("");
        } });
   var chatDisplayBox = document.createElement("div");
   chatDisplayBox.id = "chatDisplayBox";
   updateChats();
   chatArea = document.getElementById("chatArea");
   chatArea.appendChild(usersLabel);
   chatArea.appendChild(userDisplayArea);
   chatArea.appendChild(chatBox);
   chatArea.appendChild(chatDisplayBox);
   chatDisplayBox.appendChild(chatDisplayTable);
}

function getLoggedInUsers() {
  $.ajax({type: "GET",
          url: "getLoggedInUsers.py",
          success: displayLoggedInUsers,
          error: function(jqXHR, textStatus, errorThrown) {
          console.log("Error getting users, status = " + textStatus + " error: " + errorThrown);
          } } );
 }

function displayLoggedInUsers(response, responseStatus) {
   console.log("Logged in users:");
   console.log(response); 
   $('#userDisplayArea').html("");
   usersArray = response[0];
   var userDisplayTable = document.createElement("div");
   userDisplayTable.style.width = '100%';
   userDisplayTable.style.borderCollapse = 'collapse';
   userDisplayTable.style.borderTop = '1px solid #ddd;';
   userDisplayTable.style.borderBottom = '1px solid #ddd;';


   var userDisplayTableBody = document.createElement("tbody");
   for (var x=0;x<(usersArray.length)/4;x++) {
       var userRow = document.createElement("tr");
       userDisplayTableBody.appendChild(userRow);
      for (var x=0;x<usersArray.length;x++) {
        var userCell = document.createElement("td");
        userCell.textAlign = 'center';
        var userPic = document.createElement("img");
        userPic.style.height = '40px';
        userPic.style.margin = '2px';
        userPic.src = usersArray[x].photo;
        userPic.title = usersArray[x].name;
        userCell.appendChild(userPic);
        userRow.appendChild(userCell);
       }
    }
    userDisplayTable.appendChild(userDisplayTableBody);
    userDisplayArea.appendChild(userDisplayTable);
   
}

function updateChats () {
  d = { mostRecent: mostRecent } ;
  getLoggedInUsers();
  $.ajax({type: "POST",
         url: "getChats.py",
        data: JSON.stringify(d),
     success: displayChats,
       error: function(jqXHR, textStatus, errorThrown) {
           console.log("Error: chats could not be updated."); 
           updateChats(); } } );
}

function displayChats (response, responseStatus) {
   var newChats = response[0];
   console.log("Get Chat Response");
   console.log(response);
   chatDisplayTable.innerHTML="";
   document.getElementById('chatDisplayBox').className+=' well well-sm pre-scrollable';
   for (var x=0; x<newChats.length;x++) {
     chatQueue.push(newChats[x]);
     // the DB query orders these ascending by time stamp
     mostRecent = newChats[x].chatDate;
   }
   var y = chatQueue.length;
   for (var x=CHAT_QUEUE_MAX_LENGTH;x<y;x++)  
     chatQueue.shift();

   for (x=chatQueue.length-1;x>=0;x--) {
     var chatNode = document.createElement("tr");
     
     chatNode.style.marginTop = '0.2em;';
     chatNode.style.width = '100%';
     chatNode.style.display = 'table';
     chatNode.style.verticalAlign = 'top';

     var chatDate = new Date(chatQueue[x].chatDate);
     var chatDateNode = document.createElement("td");
     var chatPicNode = document.createElement("td");
     var chatText = document.createElement("td");
     var chatPic = document.createElement("img");
     
     if (x==(chatQueue.length-1)){chatText.style.borderTop = "0px";}
     else {chatText.style.borderTop = "1px solid #ddd";}
     
     chatDateNode.style.width='10%';
     chatDateNode.innerHTML = chatDate.getHours() + ':' + (chatDate.getMinutes() < 10 ? '0' : '') + chatDate.getMinutes();
     chatDateNode.title = chatDate.getHours() + ':' + (chatDate.getMinutes() < 10 ? '0' : '') + chatDate.getMinutes() + ':' + (chatDate.getSeconds() < 10 ? '0' : '') + chatDate.getSeconds();
     chatPic.src = chatQueue[x].photo;
     if (chatPic.src == 'http://cross-tables.com/xerafin/xerafin.png') {
         chatNode.style.backgroundColor="#dfdfdf";
         chatNode.style.border='1px solid #666';
         chatNode.style.marginTop = '0.5em';
         chatText.style.borderTop = "1px solid #666";
         
     }
     if (x!==0) {
        if (chatQueue[x-1].photo !== 'http://cross-tables.com/xerafin/xerafin.png'){
             chatNode.style.marginBottom = '0.5em';
        }
     }
     chatPic.title = chatQueue[x].name;
     chatPic.style.height = '30px';
     chatPicNode.appendChild(chatPic);
     chatPicNode.style.width = '10%';
     chatPicNode.style.textAlign = 'center';
     chatText.style.verticalAlign = 'middle';
     chatDateNode.style.verticalAlign = 'middle';
     chatDateNode.style.paddingLeft = '0.3em';


    
     
     chatText.innerHTML = chatQueue[x].chatText;
     chatText.style.textAlign = 'left';
     chatNode.appendChild(chatDateNode);
     chatNode.appendChild(chatPicNode);
     chatNode.appendChild(chatText);
     chatDisplayTable.appendChild(chatNode);
   }
   updateChats();
} 

function submitChat(message, isSystemGenerated) {
   d = { chatText: message, userid: userid, chatTime: (new Date).getTime() };
   if (isSystemGenerated) d.userid = 0;
   console.log ("sending chat:");
   console.log(d);
   $.ajax({type: "POST", 
            url: "submitChat.py",
           data: JSON.stringify(d),
        success: function (response, responseStatus) {
           console.log(response); },
          error: function(jqXHR, textStatus, errorThrown) {
           console.log("Error: chat could not be submitted"); } });
    }   
