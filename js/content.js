var url = encodeURIComponent(document.location.href);
var serverUrl = 'https://chrome-web-chat.herokuapp.com';
var socket = io.connect(serverUrl, { query: 'url=' + url });
socket.on('chat message', function(obj){
  $('#cwc-messages').append($('<li>').text(obj.name + ': ' + obj.msg));
  console.log(obj.name + ': ' + obj.msg);
});
$("body").append('<div id="cwc-foo"><ul id="cwc-messages"></ul><form id="cwc-form" action=""><label for="cwc-name">Name</label><input id="cwc-name" autocomplete="off" /><label for="cwc-msg">Message</label><input id="cwc-msg" autocomplete="off" /><button>Send</button></form></div>');
$('#cwc-form').submit(function(){
  var obj = { name: $('#cwc-name').val(), msg: $('#cwc-msg').val() };
  socket.emit('chat message', obj);
  $('#cwc-messages').append($('<li>').text(obj.name + ': ' + obj.msg));
  $('#cwc-msg').val('');
  return false;
});

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action == 'TOGGLE_CHAT') {
    $('#cwc-foo').toggle("slow", function(){});
  }
});

