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
    chrome.notifications.create(sender.tab.id.toString(), {
      type: 'basic',
      title: 'New Message from ' + request.username,
      message: request.content,
      iconUrl: 'img/icon.png'
    }, function() {});
    
    sendResponse({retMsg: 'OK'});
  });

// Move to the tab on notification click
chrome.notifications.onClicked.addListener(function(notificationID) {
	chrome.tabs.update(parseInt(notificationID), {highlighted: true});
});