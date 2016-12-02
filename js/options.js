// Saves options to chrome.storage.sync.
function save_options() {
  var notifications = document.getElementById('notifications').checked;
  var blueTheme = document.getElementById('radio-1').checked;
  var redTheme = document.getElementById('radio-2').checked;
  var grayTheme = document.getElementById('radio-3').checked;

  if (notifications) {
    chrome.permissions.request({
      permissions: ['notifications']
      }, function(granted) {
      if (granted) {
        console.log("Notification permissions Granted");
      } else {
        console.log("Notification permissions not granted")
        notifications = false;
      }
    });
  } else {
    chrome.permissions.remove({
      permissions: ['notifications']
    }, function(removed) {
      if (removed) {
        console.log("Notification permissions removed");
      } else {
        console.log("Permissions not removed");
      }
    });
  }

  var themeNumber = 1;
  if (redTheme) themeNumber = 2;
  if (grayTheme) themeNumber = 3;
  console.log(themeNumber);
  chrome.storage.sync.set({
    notificationsEnabled: notifications,
    themeNumber: themeNumber
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    notificationsEnabled: false,
    themeNumber: 1
  }, function(items) {
    document.getElementById('notifications').checked = items.notificationsEnabled;
    document.getElementById('radio-' + items.themeNumber).checked = true;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);

