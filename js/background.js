chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.get({global_enable: true}, function(items){
    var title = "Globally Disable Chat";
    if (!items.global_enable) {
      title = "Globally Enable Chat";
    }
    chrome.contextMenus.create({
      title: title,
      contexts: ["browser_action"],
      id: "global_enable_menu"
    });
  });
});

chrome.contextMenus.onClicked.addListener(function(info, tab){
  if (info.menuItemId == "global_enable_menu") {
    chrome.storage.sync.get({global_enable: true}, function(items){
      var shouldEnable = !items.global_enable;
      chrome.storage.sync.set({global_enable: shouldEnable}, function() {
        var title = "Globally Disable Chat";
        if (!shouldEnable) {
          title = "Globally Enable Chat";
        }
        chrome.contextMenus.update("global_enable_menu", {
          title: title
        }, function() {
          chrome.tabs.query({}, function(tabs) {
            var message = {action: 'TOGGLE_GLOBAL_ENABLE'};
            for (var i=0; i<tabs.length; ++i) {
              chrome.tabs.sendMessage(tabs[i].id, message);
            }
          });
        });
      });
    });
  }
});

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, {action: 'TOGGLE_CHAT'}, function(response) {});
});

chrome.identity.getAuthToken({ 'interactive': true }, function (token) {
  console.log(token);
  chrome.identity.getProfileUserInfo(function (userInfo) {
    console.log(userInfo);
    chrome.storage.sync.set({ userInfo: userInfo });
  });
});

// Listen to messages from content script
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (sender.tab) {
      console.log("Message from URL: " + sender.tab.url);
      console.log("Message from Tab: " + sender.tab.id);
    }

    // Create the notification using tab id as notification id
    chrome.tabs.query({'highlighted': true, 'currentWindow': true}, function(tabs) {
      if (tabs[0].id != sender.tab.id) {
        chrome.notifications.create(sender.tab.id.toString(), {
          type: 'basic',
          title: 'New Message from ' + request.username,
          message: request.content,
          iconUrl: 'img/icon.png'
        }, function() {});
      }
    })

    sendResponse({retMsg: 'OK'});
});

// Move to the tab on notification click
chrome.notifications.onClicked.addListener(function(tabId) {
  window.focus();
  chrome.tabs.get(parseInt(tabId), function(tab) {
    chrome.tabs.highlight({'tabs': tab.index}, function() {});
  });
  chrome.notifications.clear(tabId, function() {});
});

chrome.notifications.onButtonClicked.addListener(function(tabId) {
  window.focus();
  chrome.tabs.get(parseInt(tabId), function(tab) {
    chrome.tabs.highlight({'tabs': tab.index}, function() {});
  });
  chrome.notifications.clear(tabId, function() {});
});

