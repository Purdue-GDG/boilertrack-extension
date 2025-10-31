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

    // Capture screen image and perform OCR using service worker
    const captureScreenImageAndOCR = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.id && tab.windowId) {
          // Capture visible tab as image (returns base64 data URL)
          const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
            format: 'png'
          });
          
          console.log('Captured screen image, sending to service worker for OCR...');
          
          // Send image to service worker for OCR processing
          try {
            const response = await chrome.runtime.sendMessage({
              action: 'performOCR',
              imageDataUrl: dataUrl
            });
            
            if (response && response.success) {
              console.log('Extracted text from image (OCR):', response.text);
            } else {
              console.error('OCR failed:', response?.error || 'Unknown error');
            }
          } catch (err) {
            console.error('Error communicating with service worker:', err);
          }
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
