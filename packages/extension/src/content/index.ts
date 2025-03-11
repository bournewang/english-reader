import React from 'react';
import { createRoot } from 'react-dom/client';
import { Reader, fetchArticle } from '@english-reader/shared';
import type { Article } from '@english-reader/shared';

console.log('[Demo Extension] Content script loading...');

console.log('Reader component:', Reader);
console.log('Reader source:', Reader.toString());


// Verify React is available
if (typeof React === 'undefined') {
  throw new Error('React is not loaded');
}

if (typeof ReactDOM === 'undefined') {
  throw new Error('ReactDOM is not loaded');
}

function createOverlay(): HTMLDivElement {
  const overlay = document.createElement('div');
  overlay.id = 'reader-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;
  return overlay;
}

function createCloseButton(overlay: HTMLDivElement): HTMLButtonElement {
  const closeButton = document.createElement('button');
  closeButton.textContent = '✕';
  closeButton.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 8px;
    color: #333;
    z-index: 10000;
  `;
  closeButton.addEventListener('click', () => {
    overlay.remove();
  });
  return closeButton;
}

async function injectReader() {
  try {
    // Create and inject overlay
    const overlay = createOverlay();
    document.body.appendChild(overlay);
    console.log("document.body.appendChild(overlay);")

    // Add close button
    const closeButton = createCloseButton(overlay);
    overlay.appendChild(closeButton);

    // Create container for Reader
    const container = document.createElement('div');
    container.id = 'reader-container';
    container.style.cssText = `
      flex: 1;
      overflow-y: auto;
      height: 100%;
      width: 100%;
    `;
    overlay.appendChild(container);

    // Get article content
    const article: Article = fetchArticle();
    console.log('Article content:', article);

    // Render Reader component
    const root = createRoot(container);
    root.render(
      React.createElement(Reader, { article })
    );

  } catch (error) {
    console.error('Error injecting reader:', error);
    alert('Error: ' + (error as Error).message);
  }
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('[Demo Extension] Message received:', request.action);
  
  if (request.action === 'START_READER') {
    console.log("call injectReader");
    injectReader();
    sendResponse({ success: true });
  }
  
  return true;
});

console.log('[Demo Extension] Content script loaded and listening for messages');