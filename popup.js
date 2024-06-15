// popup.js

document.getElementById('toggle-reader-mode').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleReaderMode' });
    });
});

document.getElementById('highlight-ielts').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'highlightVocabulary', vocabType: 'ielts' });
    });
});

document.getElementById('highlight-toefl').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'highlightVocabulary', vocabType: 'toefl' });
    });
});

document.getElementById('tts-button').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'speakSelectedText' });
    });
});
