const CHAT_MESSAGE_EVENT = 'chat message';
const CHAT_HISTORY_EVENT = 'chat history';

var uid;

function scroll(time) {
  $('#cwc-message-list').animate({scrollTop: $('#cwc-message-list').prop("scrollHeight")}, time);
}

function addMessage(obj) {
  if (uid === obj.uid) {
    $('#cwc-message-list').append('<li class="cwc-message-sent"><div class="my-name">' + obj.username + '</div><div class="cwc-bubble">' + obj.content + '</div></li>');
  } else {
    $('#cwc-message-list').append('<li class="cwc-message-received"><div class="their-name">' + obj.username + '</div><div class="cwc-bubble">' + obj.content + '</div></li>');
  }
}

chrome.storage.sync.get('id', function(items) {
  uid = items.id;
  if (!uid) {
    console.log('uid not found');
    return;
  }
  var url = encodeURIComponent(document.location.href);
  var serverUrl = 'https://chrome-web-chat.herokuapp.com';
  var socket = io.connect(serverUrl, { query: 'url=' + url + '&uid=' + uid });

  $('body').append('<div id="cwc-container"></div>');

  $('#cwc-container').load(chrome.extension.getURL('content.html'), function() {
    $('#cwc-form').submit(function(){
      var username = $('#cwc-name').val().length? $('#cwc-name').val() : "Anonymous";
      var content = $('#cwc-msg').val().length? $('#cwc-msg').val() : " ";
      var obj = { username: username, content: content, uid: uid };
      socket.emit('chat message', obj);
      addMessage(obj);
      scroll(500);
      $('#cwc-msg').val('');
      return false;
    });
  });

  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.action == 'TOGGLE_CHAT') {
      $('#cwc-container').toggle("slow", function(){});
      scroll(0);
    }
  });

  socket.on(CHAT_MESSAGE_EVENT, function(obj){
    addMessage(obj);
    scroll(500);
    console.log(obj.username + ': ' + obj.content);
  });

  socket.on(CHAT_HISTORY_EVENT, function(messages){
    for (var i = messages.length - 1; i >= 0; i--) {
      var obj = messages[i];
      addMessage(obj);
      console.log(obj.username + ': ' + obj.content);
    }
    scroll(0);
  });

});