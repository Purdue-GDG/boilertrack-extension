chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'showTaskList') {
    // Store flag in storage to show task list when popup opens
    chrome.storage.local.set({ showTaskList: true }, () => {
      // message to popup if it's open
      chrome.runtime.sendMessage({ action: 'showTaskList' }, () => {
        if (chrome.runtime.lastError) {
          // Popup is not open, create popup window for default show of sync button
          chrome.windows.create({
            url: chrome.runtime.getURL('index.html'),
            type: 'popup',
            width: 600,
            height: 600
          });
        }
        sendResponse({ success: true });
      });
    });
    return true;
  }
});

