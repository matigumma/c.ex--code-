function updateIcon(tabId, isEnabled) {
    const iconName = isEnabled ? 'icon-enabled.png' : 'icon-disabled.png';
    chrome.browserAction.setIcon({ tabId: tabId, path: iconName });
}

chrome.browserAction.onClicked.addListener((tab) => {
    chrome.tabs.executeScript(tab.id, { file: 'content.js' });
  });
  
chrome.browserAction.onClicked.addListener(tab => {
    chrome.tabs.sendMessage(tab.id, { toggleObserver: true });
});
  
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.updateIcon) {
      const tabId = sender.tab.id;
      const isEnabled = request.isEnabled;
      updateIcon(tabId, isEnabled);
    }
  });
  