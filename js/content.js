const CHAT_MESSAGE_EVENT = 'chat message';
const CHAT_HISTORY_EVENT = 'chat history';
const USER_LIST_EVENT = 'user list';
const HISTORY_LIMIT = 20;

var uid;
var email;
var lastUrl;

function scroll(time) {
  $('#cwc-message-list').animate({scrollTop: $('#cwc-message-list').prop("scrollHeight")}, time);
}

function linkify(text) {
  var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(urlRegex, function(url) {
    return '<a href="' + url + '">' + url + '</a>';
  });
}

function addMessage(obj) {
  if (uid === obj.uid) {
    $('#cwc-message-list').append('<li class="cwc-message-sent"><div class="my-name">' + obj.username + '</div><div class="cwc-bubble">' + linkify(obj.content) + '</div></li>');
  } else {
    $('#cwc-message-list').append('<li class="cwc-message-received"><div class="their-name">' + obj.username + '</div><div class="cwc-bubble">' + linkify(obj.content) + '</div></li>');
  }
}

function notify(obj) {
  console.log(obj);
  chrome.runtime.sendMessage(obj, function(response) {
    console.log(response.retMsg);
  });
}

chrome.storage.sync.get({userInfo: null, global_enable: true, themeNumber: 1}, function(items) {
  uid = items.userInfo.id;
  email = items.userInfo.email;
  if (!uid || !email) {
    console.log('uid or email not found');
    return;
  }


  var socket;
  if (items.global_enable) {
    socket = createSocket();
  }

  $('body').append('<div id="cwc-container"></div>');
  $('body').append('<div id="cwc-dialog" title="Users in Chat"><ul id="cwc-user-list"></ul></div>');
  $( "#cwc-dialog" ).dialog({
    autoOpen: false,
    show: {
      effect: "fade",
      duration: 500
    },
    hide: {
      effect: "fade",
      duration: 500
    }
  });

  $('body').append('<div id="cwc-favourite-dialog" title="Favourites"><ul id="cwc-favourite-list"></ul></div>');
  $( "#cwc-favourite-dialog" ).dialog({
    autoOpen: false,
    show: {
      effect: "fade",
      duration: 500
    },
    hide: {
      effect: "fade",
      duration: 500
    }
  });

  $('body').append('<div id="cwc-history-dialog" title="History"><ul id="cwc-history-list"></ul></div>');
  $( "#cwc-history-dialog" ).dialog({
    autoOpen: false,
    show: {
      effect: "fade",
      duration: 500
    },
    hide: {
      effect: "fade",
      duration: 500
    }
  });

  if (items.themeNumber == 2) {
    $('#cwc-container').addClass('red');
  }

  if (items.themeNumber == 3) {
    $('#cwc-container').addClass('gray');
  }

  $('#cwc-container').draggable({axis: "x", stop: function( event, ui ) {
      $('#cwc-container').css('top', 'auto');
    }
  });

  $('#cwc-container').load(chrome.extension.getURL('content.html'), function() {
    // initially disable sending chat message
    $('#cwc-submit-btn').attr('disabled', 'disabled');

    // enable send button if content is not empty
    $('#cwc-msg').keyup(function() {
      if ($(this).val()) {
        $('#cwc-submit-btn').removeAttr('disabled');
      } else {
        $('#cwc-submit-btn').attr('disabled', 'disabled');
      }
    });

    $('#cwc-close-chat').click(function() {
      chrome.storage.sync.get({global_enable: true}, function(items) {
        if (items.global_enable) {
          $('#cwc-container').toggle("slow", function(){});
          scroll(0);
        }
      });
    });

    $('#cwc-minimize-chat').click(function() {
      $('#cwc-main-content').toggle("blind", "slow");
      scroll(0);
    });

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

    $('#cwc-user-list-btn').click(function() {
      $('#cwc-dialog').dialog('open');
    });

    $('#cwc-user-favorite-btn').click(function() {
      // frontend toggle
      $('#cwc-user-favorite-btn').toggleClass('fa-star-o');
      $('#cwc-user-favorite-btn').toggleClass('fa-star');
      // backend storage: add or remove url
      chrome.storage.sync.get('favorites', function(items) {
        var favorites = items.favorites;
        var url = document.location.href;
        if (!favorites){
          // no favorite yet
          favorites = new Object;
          favorites[url] = null;
        }else{
          // have favorite
          if (favorites.hasOwnProperty(url)){
            delete favorites[url];
          }else{
            favorites[url] = null;
          }
        }
        chrome.storage.sync.set({ 'favorites': favorites }, function(){
        });
      });
    });

    // initialize the favorite button to correct class
    chrome.storage.sync.get('favorites', function(items) {
      var favorites = items.favorites;
      var url = document.location.href;
      if (favorites && favorites.hasOwnProperty(url)){
        $('#cwc-user-favorite-btn').toggleClass('fa-star-o');
        $('#cwc-user-favorite-btn').toggleClass('fa-star');
      }
    });

    // show favourites
    $('#cwc-user-bookmark-btn').click(function() {
      $('#cwc-favourite-dialog').dialog('open');
      $('#cwc-favourite-list').empty();
      chrome.storage.sync.get('favorites', function(items) {
        var favorites = items.favorites;
        for (var url in favorites) {
          if (favorites.hasOwnProperty(url)){
            $('#cwc-favourite-list').append('<li>' + linkify(url) + '</li>');
          }
        }
      });
    });

    // show history
    $('#cwc-recent-chat-btn').click(function() {
      $('#cwc-history-dialog').dialog('open');
      $('#cwc-history-list').empty();
      chrome.storage.sync.get('history', function(items) {
        var history = items.history;
        for (var i = history.length - 1; i > 0; i-- ) {
          $('#cwc-history-list').append('<li>' + linkify(history[i]) + '</li>');
        }
      });
    });

  });

  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.action == 'TOGGLE_CHAT') {
      chrome.storage.sync.get({global_enable: true}, function(items) {
        if (items.global_enable) {
          $('#cwc-container').toggle("slow", function(){});
          scroll(0);

          // if the chat is open, update history
          if ($('#cwc-container').is(":visible")){
            chrome.storage.sync.get('history', function(items) {
              var history = items.history;
              var url = document.location.href;
              if (!history){
                // no history yet
                history = [];
              }

              // prevent continuous duplicate url in the same section
              if (lastUrl === null || lastUrl!== url){
                history.push(url);
                lastUrl = url;
              }

              // have history
              if (history.length > HISTORY_LIMIT){
                history.shift();
              }
              console.log("history: ");
              console.log(history);
              chrome.storage.sync.set({ 'history': history }, function(){
              });
            });

          }
        }
      });
    } else if (msg.action == 'TOGGLE_GLOBAL_ENABLE') {
      chrome.storage.sync.get({global_enable: true}, function(items) {
        var isEnabled = items.global_enable;
        if (!isEnabled) {
          $('#cwc-container').hide("slow", function(){});
          console.log("disconnect socket");
          socket.io.close();
        } else {
          console.log("reconnect socket");
          socket = createSocket();
          $('#cwc-container').show("slow", function(){});
        }
      });
    }
  });
});

function createSocket() {
  var url = encodeURIComponent(document.location.href);
  var serverUrl = 'https://chrome-web-chat.herokuapp.com';
  var obj = { query: 'url=' + url + '&uid=' + uid + '&email=' + email };
  var socket = io.connect(serverUrl, obj);
  socket.on(CHAT_MESSAGE_EVENT, function(obj){
    addMessage(obj);
    notify(obj);
    scroll(500);
    console.log(obj.username + ': ' + obj.content);
  });

  socket.on(CHAT_HISTORY_EVENT, function(messages){
    for (var i = messages.length - 1; i >= 0; i--) {
      var obj = messages[i];
      addMessage(obj);
      // console.log(obj.username + ': ' + obj.content);
    }
    scroll(0);
  });

  socket.on(USER_LIST_EVENT, function(arr){
    $('#cwc-user-list').empty();
    for (var i = 0; i < arr.length; i++) {
      $('#cwc-user-list').append('<li>' + arr[i] + '</li>');
    }
  });

  return socket;
}

