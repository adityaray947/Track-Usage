let tabUsage = {};
let currentTabId = null;
let lastActivatedTime = null;

function getDomain(url) {
  try {
    const urlObject = new URL(url);
    return urlObject.hostname;
  } catch (e) {
    return null;
  }
}

function updateTabUsage(tabId, timeSpent) {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError || !tab.url) return;

    const domain = getDomain(tab.url);
    if (!domain) return;

    if (!tabUsage[domain]) {
      tabUsage[domain] = { timeSpent: 0 };
    }
    tabUsage[domain].timeSpent += timeSpent;
    chrome.storage.local.set({ tabUsage });
  });
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  const now = Date.now();
  if (currentTabId !== null && lastActivatedTime !== null) {
    const timeSpent = now - lastActivatedTime;
    updateTabUsage(currentTabId, timeSpent);
  }
  currentTabId = activeInfo.tabId;
  lastActivatedTime = now;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === currentTabId && changeInfo.status === 'complete') {
    lastActivatedTime = Date.now();
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  const now = Date.now();
  if (tabId === currentTabId && lastActivatedTime !== null) {
    const timeSpent = now - lastActivatedTime;
    updateTabUsage(tabId, timeSpent);
    currentTabId = null;
    lastActivatedTime = null;
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  const now = Date.now();
  if (currentTabId !== null && lastActivatedTime !== null) {
    const timeSpent = now - lastActivatedTime;
    updateTabUsage(currentTabId, timeSpent);
  }
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    currentTabId = null;
    lastActivatedTime = null;
  } else {
    chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
      if (tabs.length > 0) {
        currentTabId = tabs[0].id;
        lastActivatedTime = now;
      }
    });
  }
});
