// background.js

chrome.action.onClicked.addListener((tab) => {
    console.log("tab: " + tab.id)
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['jsbrowserpackageraw.js', 'content.js']
    });
});

// Listen for hot-reload requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'hotReload') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['content.js']
            }, () => {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'hotReload' });
                sendResponse({ status: 'Content script reloaded' });
            });
        });
    }
    return true; // Keeps the message channel open for sendResponse
});
