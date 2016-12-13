function startChat () {
   getLoggedInUsers();
   mostRecent = (new Date).getTime() - 86400000; // One Day Ago
   chatQueue = [ ];
   CHAT_QUEUE_MAX_LENGTH = 100;
   lastReadRow = 0;
   var usersLabel = document.createElement("div");
   var userDisplayArea = document.createElement("div");
   var chatBox = document.createElement("input");
   var chatDisplayBox = document.createElement("div");
   chatDisplayTable = document.createElement("table");
   usersLabel.className += ' tableHeaderLight'
   usersLabel.innerHTML = "User Chat"; 
   userDisplayArea.id = "userDisplayArea";
   /*userDisplayArea.className+= " chatActiveUsers"; */
   chatDisplayBox.id = "chatDisplayBox";
   chatDisplayBox.className+=' well well-sm pre-scrollable';    
   chatBox.type = "text";
   chatBox.id = "chatBox";
   chatBox.className+=' chatInput';
   chatBox.addEventListener("keypress", function(e) {
	if (e.which === 13 && $(this).val().trim()) {
           submitChat($(this).val(), false);
           $(this).val("");
        } });
   getInitChats();
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
   var activeUserHeading = document.createElement('div');
   var userDisplayTable = document.createElement("table");
   var userDisplayTableBody = document.createElement("tbody");
 
   activeUserHeading.className+= " activeUserHeading"; 
   activeUserHeading.id= "activeUserHeading"; 
   activeUserHeading.innerHTML = usersArray.length+' active user(s)';

   userDisplayTable.className+= "  chatActiveUsers";
   if (usersArray.length!==0){
       var userRow = document.createElement("tr");
       userRow.id= 'userRow';
       userRow.style.width = Math.min(40*usersArray.length,($('#activeUserHeading').width()-79));
       userDisplayTableBody.appendChild(userRow);
       /*for argument is short term hack.  May cause display issues on mobile 10.12.2016 RF*/
      for (var y=0;(y<usersArray.length) && (y< 9);y++) {        
        var userCell = document.createElement("td");
        userCell.style.width='40px';
        userCell.textAlign = 'left';
        var userPic = document.createElement("img");
        userPic.className+=' activePic';
        userPic.src = usersArray[y].photo;
        userPic.title = usersArray[y].name;
        userCell.appendChild(userPic);
        userRow.appendChild(userCell);
       }
   }
    userDisplayTable.appendChild(userDisplayTableBody);
    userDisplayArea.appendChild(activeUserHeading);
    userDisplayArea.appendChild(userDisplayTable);

   
}

function getInitChats () {
  var d = { mostRecent: mostRecent, userid: userid } ;
  $.ajax({type: "POST",
         url: "getChatsInit.py",
        data: JSON.stringify(d),
     success: displayChats,
       error: function(jqXHR, textStatus, errorThrown) {
           console.log("Error: chats could not be updated."); 
           setTimeout(updateChats, 3000); } } );
}

function updateChats () {
  var d = { userid: userid, rownum: lastReadRow } ;
  getLoggedInUsers();
  $.ajax({type: "POST",
         url: "getChats.py",
        data: JSON.stringify(d),
     success: displayChats,
       error: function(jqXHR, textStatus, errorThrown) {
           console.log("Error: chats could not be updated."); 
           setTimeout(updateChats, 5000); } } );
}

function displayChats (response, responseStatus) {
   var newChats = response[0];
   lastReadRow = response[1];
   console.log("Get Chat Response");
   console.log(response);
   chatDisplayTable.innerHTML="";
   
   chatDisplayBox.style.border = '1px solid #999';
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
     chatNode.style.backgroundImage = 'b27.png';
     chatNode.style.backgroundRepeat = 'repeat';
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
     chatDateNode.style.textAlign='right';

     chatDateNode.innerHTML = chatDate.getHours() + ':' + (chatDate.getMinutes() < 10 ? '0' : '') + chatDate.getMinutes();
     chatDateNode.title = chatDate.getHours() + ':' + (chatDate.getMinutes() < 10 ? '0' : '') + chatDate.getMinutes() + ':' + (chatDate.getSeconds() < 10 ? '0' : '') + chatDate.getSeconds();
     chatPic.src = chatQueue[x].photo;
     if (chatPic.src == 'http://cross-tables.com/xerafin/xerafin.png') {
         chatNode.className+=' xeraBroadcast';
         chatText.className+=' xeraBroadcastBorderFix';
         chatPicNode.className+=' xeraBroadcastImageAlign';
     }
     if (x!==0) {
        if (chatQueue[x-1].photo !== 'http://cross-tables.com/xerafin/xerafin.png'){
             chatNode.style.marginBottom = '0.3em';
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
