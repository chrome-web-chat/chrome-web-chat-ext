const CHAT_MESSAGE_ENENT = 'chat message';
const CHAT_HISTORY_ENENT = 'chat history';

chrome.storage.sync.get('id', function(items) {
  var id = items.id;
  if (!id) {
    console.log('id not found');
    return;
  }
  var url = encodeURIComponent(document.location.href);
  var serverUrl = 'https://chrome-web-chat.herokuapp.com';
  var socket = io.connect(serverUrl, { query: 'url=' + url + '&id=' + id });

  $('body').append('<div id="cwc-foo"></div>');

  $('#cwc-foo').load(chrome.extension.getURL('content.html'), function() {
    $('#cwc-form').submit(function(){
      var obj = { username: $('#cwc-name').val(), content: $('#cwc-msg').val() };
      socket.emit('chat message', obj);
      $('#cwc-messages').append($('<li>').text(obj.username + ': ' + obj.content));
      $('#cwc-msg').val('');
      return false;
    });
  });

  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.action == 'TOGGLE_CHAT') {
      $('#cwc-foo').toggle("slow", function(){});
    }
  });

  socket.on(CHAT_MESSAGE_ENENT, function(obj){
    $('#cwc-messages').append($('<li>').text(obj.username + ': ' + obj.content));
    console.log(obj.username + ': ' + obj.content);
  });

  socket.on(CHAT_HISTORY_ENENT, function(messages){
    for (var i = 0; i < messages.length; i++) {
      var obj = messages[i];
      $('#cwc-messages').append($('<li>').text(obj.username + ': ' + obj.content));
      console.log('history: ' + obj.username + ': ' + obj.content);
    }
  });

});