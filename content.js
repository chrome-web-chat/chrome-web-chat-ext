var url = encodeURIComponent(document.location.href);
console.log("url: " + url);
var socket = io.connect('https://chrome-web-chat.herokuapp.com', { query: 'url=' + url });
socket.on('chat message', function(obj){
  $('#messages').append($('<li>').text(obj.name + ': ' + obj.msg));
  console.log(obj.name + ': ' + obj.msg);
});
$("body").append('<div id="foo"><ul id="messages"></ul><form id="cwc-form" action=""><label for="name">Name</label><input id="name" autocomplete="off" /><label for="msg">Message</label><input id="msg" autocomplete="off" /><button>Send</button></form></div>');
$('#cwc-form').submit(function(){
  var obj = { name: $('#name').val(), msg: $('#msg').val() };
  socket.emit('chat message', obj);
  $('#messages').append($('<li>').text(obj.name + ': ' + obj.msg));
  $('#msg').val('');
  return false;
});
