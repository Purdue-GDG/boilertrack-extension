//This ts is for the POPUP
//any js will run INTERNALLY within the popup window. This is not always the case, using chrome.scripting

import gdgLogo from '/images/gdglogo128.png'

import './App.css'

function App() {
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
