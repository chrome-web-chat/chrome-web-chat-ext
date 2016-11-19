// Saves options to chrome.storage.sync.
function save_options() {
  var notifications = document.getElementById('notifications').checked;
  // TODO add event listener instead of conditional check or store options within callback
  // TODO Fix spaghetti code
  // TODO Fix permission revocation
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
  
  chrome.storage.sync.set({
    notificationsEnabled: notifications
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
    notificationsEnabled: false
  }, function(items) {
    document.getElementById('notifications').checked = items.notificationsEnabled;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);

