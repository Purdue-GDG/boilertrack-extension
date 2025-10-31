// Background service worker - routes OCR requests to Offscreen Document
// Service workers cannot create Worker instances, so we use Offscreen Document instead

// Ensure offscreen document exists
async function setupOffscreenDocument() {
  try {
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    });

    // Check if offscreen document already exists
    if (existingContexts.length > 0) {
      console.log('[Service Worker] Offscreen document already exists');
      return;
    }

    // Create offscreen document
    await chrome.offscreen.createDocument({
      url: chrome.runtime.getURL('offscreen.html'),
      reasons: [chrome.offscreen.Reason.DOM_SCRAPING],
      justification: 'OCR processing requires Worker API',
    });
    console.log('[Service Worker] Offscreen document created');
  } catch (error) {
    console.error('[Service Worker] Error setting up offscreen document:', error);
    throw error;
  }
}

// Initialize offscreen document on service worker startup
chrome.runtime.onStartup.addListener(() => {
  setupOffscreenDocument();
});

chrome.runtime.onInstalled.addListener(() => {
  setupOffscreenDocument();
});

// Listen for messages from popup/content scripts and route to offscreen document
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'performOCR') {
    // Route OCR request to offscreen document
    (async () => {
      try {
        await setupOffscreenDocument();
        
        // Give offscreen document a moment to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Send message to offscreen document
        // Note: sendMessage in service worker context should reach offscreen document
        chrome.runtime.sendMessage({
          action: 'performOCR',
          imageDataUrl: request.imageDataUrl,
        })
          .then((response) => {
            if (chrome.runtime.lastError) {
              console.error('[Service Worker] Runtime error:', chrome.runtime.lastError.message);
              sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
              sendResponse(response);
            }
          })
          .catch((error) => {
            console.error('[Service Worker] Error communicating with offscreen:', error);
            sendResponse({ success: false, error: error.message || String(error) });
          });
      } catch (error) {
        console.error('[Service Worker] Error setting up offscreen:', error);
        sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
      }
    })();
    
    // Return true to indicate we will send a response asynchronously
    return true;
  }
  
  return false;
});

