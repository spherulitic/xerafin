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
   chatDisplayTable.id = 'chatTable';
   chatDisplayTable.classname += ' chatTable';
   usersLabel.className += ' tableHeaderLight';
   usersLabel.innerHTML = "User Chat"; 
   userDisplayArea.id = "userDisplayArea";
   /*userDisplayArea.className+= " chatActiveUsers"; */
   chatDisplayBox.id = "chatDisplayBox";
   chatDisplayBox.className+=' well well-sm pre-scrollable';    
   chatBox.type = "text";
   chatBox.id = "chatBox";
   chatBox.className+=' chatInput';
 
   getInitChats();
   chatArea = document.getElementById("chatArea");
   chatArea.appendChild(usersLabel);
   chatArea.appendChild(userDisplayArea);
   chatArea.appendChild(chatBox);
   chatArea.appendChild(chatDisplayBox);
   chatDisplayBox.appendChild(chatDisplayTable);
   chatDisplayBox.style.maxWidth='100%';

/**Event Listeners**/
   
   chatBox.addEventListener("keypress", function(e) {
        if (e.which === 13 && $(this).val().trim()) {
           var chatContent = parseEmoji($(this).val());
           console.log(chatContent);
           submitChat(chatContent, false);
           $(this).val("");
        } });
	$('#chatBox').keypress("m",function(e) {
        if(e.ctrlKey) 
        $(this).val("");
    });
}

function getLoggedInUsers() {
  $.ajax({type: "GET",
          url: "getLoggedInUsers.py",
          success: displayLoggedInUsers,
          error: function(jqXHR, textStatus, errorThrown) {
          console.log("Error getting users, status = " + textStatus + " error: " + errorThrown);
          } } );
 }
 
function getActiveUserDimensions (pRW,pW,uLL,aRows,mRows,mPW){
        var result = {};
        if ((uLL*pW > pRW) && (pW>mPW)) {
                var x=getActiveUserDimensions(pRW,pW-1,uLL,aRows,mRows,mPW);
                result = {rows: x.rows, picWidth: x.picWidth};
                }
        else {
                if ((aRows<mRows) && (uLL*pW > pRW*aRows)){
                        var x=getActiveUserDimensions(pRW,pW,uLL,aRows+1,mRows,mPW);
                        result = {rows: x.rows, picWidth: x.picWidth};
                }
                else {result = {rows: aRows, picWidth: pW};}            
        }
        return result;
}

function displayUserArray (userList) {
   $('#userDisplayArea').html("");
   var activeUserContainer = document.createElement('div');
   var activeUserHeading = document.createElement('div');
   var userDisplayTable = document.createElement("table");
   var userDisplayTableBody = document.createElement("tbody");
   userDisplayArea.appendChild(activeUserHeading);
   activeUserHeading.className+= " activeUserHeading"; 
   activeUserHeading.id= "activeUserHeading"; 
   var widths=getActiveUserDimensions ($('#activeUserHeading').width(),50,userList.length,1,2,25);
   activeUserHeading.innerHTML = userList.length+' active user(s) ';/**+picRowWidth+' '+ Math.ceil((picRowWidth-(picWidth+1))/picWidth) + ' ' + picWidth;**/
   userDisplayTable.className+= " chatActiveUsers";
   activeUserContainer.className+= " chatActiveUsersContainer";
   if (userList.length!==0){ 
       var maxPics = Math.ceil(($('#activeUserHeading').width()-(widths.picWidth-1))/widths.picWidth);   
       if (usersArray.length<=(maxPics*widths.rows)){maxPics=Math.ceil(usersArray.length/widths.rows);}
       var userRow= [];
       for (var z=0;z<(widths.rows);z++) { 
        userRow[z] = document.createElement("tr");
        userRow[z].id= 'userRow';
        userRow[z].style.width = Math.min(widths.picWidth*userList.length,$('#activeUserHeading').width()-(widths.picWidth+1));
        userDisplayTableBody.appendChild(userRow[z]);
        for (var y=z*maxPics;(y<usersArray.length) && (y<((z+1)*maxPics));y++) {     
            var userCell = document.createElement("td");
            if ((y==(maxPics*widths.rows)-1) && (usersArray.length>(maxPics*widths.rows))){
              userCell.style.background="#45CCCC";
              userCell.style.width=widths.picWidth+'px';
              userCell.innerHTML="+"+(usersArray.length-y);
              userCell.style.fontSize='1.1em';
              userCell.style.textAlign='center';
            }
            else { 
                userCell.style.width=widths.picWidth+'px';
                userCell.textAlign = 'left';
                var userPic = document.createElement("img");
                userPic.className+=' activePic';
                userPic.style.height=widths.picWidth+'px';
                userPic.src = userList[y].photo;
                userPic.title = userList[y].name;
                userCell.appendChild(userPic);
            }
            userRow[z].appendChild(userCell);
        }
       }
    }
    userDisplayTable.appendChild(userDisplayTableBody);
    activeUserContainer.appendChild(userDisplayTable);
    userDisplayArea.appendChild(activeUserContainer);
}
function displayLoggedInUsers(response, responseStatus) {
   console.log("Logged in users:");
   if (response) {usersArray = response[0];}
   console.log(response); 
   displayUserArray(usersArray);
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
//     if (chatPic.src == 'http://cross-tables.com/xerafin/xerafin.png') {
     if (parseInt(chatQueue[x].chatUser) < 10) {
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
     chatText.style.width = '80%';
     chatText.style.maxWidth = '80%';
     chatDateNode.style.verticalAlign = 'middle';
     chatDateNode.style.paddingLeft = '0.3em';     
     chatText.innerHTML = chatQueue[x].chatText; 
     chatText.id='chatText';
     chatText.style.textAlign = 'left';
     chatText.className += ' chatText';
     chatNode.appendChild(chatDateNode);
     chatNode.appendChild(chatPicNode);
     chatNode.appendChild(chatText); 
     chatDisplayTable.appendChild(chatNode);
      
   }  
   updateChats();
} 

function submitChat(message, isSystemGenerated, systemUserid = 0) {
   d = { chatText: message, userid: userid, chatTime: (new Date).getTime() };
   if (isSystemGenerated) d.userid = systemUserid;
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
