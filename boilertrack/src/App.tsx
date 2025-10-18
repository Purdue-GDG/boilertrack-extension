
import gdgLogo from '/images/gdglogo128.png'

import './App.css'

function App() {
  
  const onclick = async () => {
    let [tab] = await chrome.tabs.query({active: true});
    chrome.scripting.executeScript({
      target: {tabId: tab.id!},
        func: () => {
          document.body.style.backgroundColor = 'black';
        }
    });
  }
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
