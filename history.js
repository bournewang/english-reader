// history.js
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['history'], (result) => {
      const historyList = result.history || [];
      const ul = document.getElementById('history-list');
      historyList.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
      });
    });
  });
  