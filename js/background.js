chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, {action: 'TOGGLE_CHAT'}, function(response) {});
});
