chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.executeScript(null,{code:'console.log(' + tab.id + ')'});
  chrome.tabs.sendMessage(tab.id, {action: 'TOGGLE_CHAT'}, function(response) {});
});
