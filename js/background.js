chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.sendMessage(tab.id, {action: 'TOGGLE_CHAT'}, function(response) {});
});

chrome.identity.getAuthToken({ 'interactive': true }, function (token) {
  console.log(token);
  chrome.identity.getProfileUserInfo(function (userInfo) {
    console.log(userInfo);
    chrome.storage.sync.set({ id: userInfo.id });
  });
});
