// Offscreen Document for OCR processing
// NOTE: Tesseract.js cannot work in Chrome extensions due to CSP restrictions
// The worker file uses importScripts() which is blocked by extension CSP
// This document is kept for potential future use with backend OCR APIs

// Log when offscreen document loads
console.log('[Offscreen] Offscreen document loaded and ready');

// Listen for messages from service worker or popup
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('[Offscreen] Received message:', request.action);
  
  if (request.action === 'performOCR') {
    if (!request.imageDataUrl) {
      console.error('[Offscreen] No image data URL provided');
      sendResponse({ success: false, error: 'No image data URL provided' });
      return false;
    }
    
    handleOCR(request.imageDataUrl)
      .then((text) => {
        console.log('[Offscreen] OCR success, sending response');
        sendResponse({ success: true, text });
      })
      .catch((error) => {
        console.error('[Offscreen] OCR error in listener:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        sendResponse({ success: false, error: errorMessage });
      });
    
    // Return true to indicate we will send a response asynchronously
    return true;
  }
  
  return false;
});

async function handleOCR(imageDataUrl: string): Promise<string> {
  console.log('[Offscreen] OCR requested');
  console.log('[Offscreen] Image data URL length:', imageDataUrl?.length || 0);
  
  // Tesseract.js cannot work in Chrome extensions due to CSP restrictions
  // The worker file uses importScripts() which is blocked
  
  // Options:
  // 1. Use a backend API (Google Cloud Vision, AWS Textract, etc.)
  // 2. Send image to a server endpoint that performs OCR
  // 3. Use a different browser-based OCR solution that doesn't require workers
  
  throw new Error(
    'Browser-based OCR with Tesseract.js is not possible in Chrome extensions due to CSP restrictions. ' +
    'Please use a backend OCR API (e.g., Google Cloud Vision API, AWS Textract) or a server endpoint.'
  );
}

