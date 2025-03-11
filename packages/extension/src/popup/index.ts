document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup initialized');
  
  document.getElementById('readButton')?.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        throw new Error('No active tab found');
      }

      if (!tab.url?.startsWith('http')) {
        throw new Error('This action only works on web pages');
      }

      await chrome.tabs.sendMessage(tab.id, { 
        action: 'START_READER'
      });
      
      // Close popup after sending message
      window.close();
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + (error as Error).message);
    }
  });

  document.getElementById('demoButton')?.addEventListener('click', async () => {
    console.log('Button clicked');
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('Current tab:', tab);

      if (!tab?.id) {
        throw new Error('No active tab found');
      }

      console.log('Sending message to content script...');
      const response = await chrome.tabs.sendMessage(tab.id, { 
        action: 'DEMO_ACTION' 
      });
      
      console.log('Response received:', response);
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + (error as Error).message);
    }
  });  
});