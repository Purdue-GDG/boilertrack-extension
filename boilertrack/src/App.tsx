//This ts is for the POPUP
//any js will run INTERNALLY within the popup window. This is not always the case, using chrome.scripting

import { useEffect } from 'react'
import gdgLogo from '/images/gdglogo128.png'

import './App.css'

function App() {
  // Capture screen text when extension popup opens
  useEffect(() => {
    const captureScreenText = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id) {
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              return document.body.innerText || document.body.textContent || '';
            }
          });
          
          if (results && results[0]?.result) {
            const screenText = results[0].result;
            console.log('Captured screen text:', screenText);
          }
        }
      } catch (err) {
        console.error('Error capturing screen text:', err);
      }
    };

    // Capture screen image
    // Note: Full OCR requires either:
    // 1. A backend API (Google Vision API, AWS Textract, etc.)
    // 2. A library that works in extensions (most require workers which have CSP issues)
    // For now, we capture the image and log it - you can process it via API if needed
    const captureScreenImageAndOCR = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id && tab.windowId) {
          // Capture visible tab as image (returns base64 data URL)
          const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
            format: 'png'
          });
          
          console.log('Captured screen image');
          console.log('Image data URL length:', dataUrl.length);
          
          // The image is captured and can be processed
          // To extract text from the image, you would need to:
          // 1. Send to a backend OCR API (Google Cloud Vision, AWS Textract, etc.)
          // 2. Use a browser-based OCR library (most require workers with CSP restrictions)
          // 3. Process via a Chrome extension background service worker
          
          // Example: The image is available as dataUrl (base64 PNG)
          // You can send this to an OCR API endpoint
          console.log('Image ready for OCR processing (data URL available)');
        }
      } catch (err) {
        console.error('Error capturing screen image:', err);
      }
    };

    captureScreenText();
    captureScreenImageAndOCR();
  }, []);

  //We can use document.body within a script being executed using scripting.executeScript to refer to the body doc of the page the user is currently on.
  //for example:
  const onclick = async () => {
    let [tab] = await chrome.tabs.query({active: true});
    //this following line, scripting.execute script, executes the following script in the specified web page
    chrome.scripting.executeScript({
      //saying the script will execute on _ tab which was defined above as the currently active tab
      target: {tabId: tab.id!},
      //its basically like running this in the console of the current webpage
        func: () => {
          document.body.style.backgroundColor = 'black';
        }
    });
  }
  //any js in this html will run internally within the popup
  return (
    <>
      <div>
        
          <img src={gdgLogo} className="logo" alt="Vite logo" />
        
        
          <img src={gdgLogo} className="logo react" alt="React logo" />
        
      </div>
      <h1>Welcome to Boilertrack</h1>
      <div className="card">
        <button onClick={onclick}>
          make the background black
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </>
  )
}

export default App
