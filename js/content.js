var url = encodeURIComponent(document.location.href);
var serverUrl = 'https://chrome-web-chat.herokuapp.com';
var socket = io.connect(serverUrl, { query: 'url=' + url });

$('body').append('<div id="cwc-container"></div>');

$('#cwc-container').load(chrome.extension.getURL('content.html'), function() {
  $('#cwc-form').submit(function(){
    var obj = { name: $('#cwc-name').val(), msg: $('#cwc-msg').val() };
    socket.emit('chat message', obj);
    $('#cwc-message-list').append('<li class="cwc-message-sent"><div class="my-name">' + obj.name + '</div><div class="cwc-bubble">' + obj.msg + '</div></li>');
    $('#cwc-msg').val('');
    return false;
  });
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action == 'TOGGLE_CHAT') {
    $('#cwc-container').toggle("slow", function(){});
  }
});

socket.on('chat message', function(obj){
  $('#cwc-message-list').append('<li class="cwc-message-received"><div class="their-name">' + obj.name + '</div><div class="cwc-bubble">' + obj.msg + '</div></li>');
  console.log(obj.name + ': ' + obj.msg);
});

