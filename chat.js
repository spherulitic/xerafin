function startChat () {
   getLoggedInUsers();
   mostRecent = (new Date).getTime() - 1800000; // thirty minutes ago
   chatQueue = [ ];
   CHAT_QUEUE_MAX_LENGTH = 10;
   var usersLabel = document.createElement("h3");
   usersLabel.style.width = "100%";
   usersLabel.style.textAlign = "center";
   usersLabel.innerHTML = "User Chat";
   var userDisplayArea = document.createElement("div");
   userDisplayArea.id = "userDisplayArea";
   userDisplayArea.style.width = "100%";
   userDisplayArea.style.padding = '5px';
   var chatBox = document.createElement("input");
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
   var userDisplayTable = document.createElement("table");
   userDisplayTable.style.width = '100%';
   var userDisplayTableBody = document.createElement("tbody");
   for (var x=0;x<(usersArray.length)/4;x++) {
       var userRow = document.createElement("tr");
       userDisplayTableBody.appendChild(userRow);
      for (var x=0;x<usersArray.length;x++) {
        var userCell = document.createElement("td");
        var userPic = document.createElement("img");
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
   $('#chatDisplayBox').html("");
   for (var x=0; x<newChats.length;x++) {
     chatQueue.push(newChats[x]);
     // the DB query orders these ascending by time stamp
     mostRecent = newChats[x].chatDate;
   }
   var y = chatQueue.length;
   for (var x=CHAT_QUEUE_MAX_LENGTH;x<y;x++)  
     chatQueue.shift();

   for (x=chatQueue.length-1;x>=0;x--) {
     var chatNode = document.createElement("DIV");
     chatNode.style.border = "thin solid black";
     chatNode.style.margin = '2px';
     chatNode.style.width = '100%';
     chatNode.style.display = 'table';

     var chatPicDate = document.createElement("DIV");
     chatPicDate.style.width = '60px';
     chatPicDate.style.display = "table-cell";

     var chatDate = new Date(chatQueue[x].chatDate);
     var chatDateNode = document.createElement("H6");
     chatDateNode.innerHTML = chatDate.getHours() + ':' + (chatDate.getMinutes() < 10 ? '0' : '') + chatDate.getMinutes();
     chatDateNode.style.display = 'inline-block';
     chatDateNode.style.width = '35px';
     chatDateNode.style.cssFloat = 'right';

     var chatPic = document.createElement("img");
     chatPic.src = chatQueue[x].photo;
     chatPic.title = chatQueue[x].name;
     chatPic.style.width = '25px';
     chatPic.style.display = 'inline-block';
     chatPic.style.cssFloat = 'left';
 
     chatPicDate.appendChild(chatPic);
     chatPicDate.appendChild(chatDateNode);
    
     var chatText = document.createElement("H5");
     chatText.innerHTML = chatQueue[x].chatText;
     chatText.style.textAlign = 'left';
     chatText.style.width = 'calc(100% - 60px)';
     chatText.style.display = "table-cell";
     chatText.style.verticalAlign = 'top';

     chatNode.appendChild(chatPicDate);
     chatNode.appendChild(chatText);
     document.getElementById('chatDisplayBox').appendChild(chatNode);
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
