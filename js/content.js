var url = encodeURIComponent(document.location.href);
var serverUrl = 'https://chrome-web-chat.herokuapp.com';
var socket = io.connect(serverUrl, { query: 'url=' + url });

$('body').append('<div id="cwc-foo"></div>');

$('#cwc-foo').load(chrome.extension.getURL('content.html'), function() {
  $('#cwc-form').submit(function(){
    var obj = { name: $('#cwc-name').val(), msg: $('#cwc-msg').val() };
    socket.emit('chat message', obj);
    $('#cwc-messages').append($('<li>').text(obj.name + ': ' + obj.msg));
    $('#cwc-msg').val('');
    return false;
  });
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action == 'TOGGLE_CHAT') {
    $('#cwc-foo').toggle("slow", function(){});
  }
});

socket.on('chat message', function(obj){
  $('#cwc-messages').append($('<li>').text(obj.name + ': ' + obj.msg));
  console.log(obj.name + ': ' + obj.msg);
});

