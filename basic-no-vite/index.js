//This js is for the POPUP
//any js file loaded into the HTML of the popup will run INTERNALLY within the popup window
async function sayHello() {
    let [tab] = await chrome.tabs.query({ active: true});
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: () => {
            alert('Hello from boilertrack');
        }
    });
}

//as I was saying above, this document is refering to the html doc of index.html (the popup HTML)
document.getElementById("helloBtn").addEventListener("click",sayHello);
//THIS IS NOT ALWAYS TRUE HOWEVER
//We can use document.body within a script being executed using scripting.executeScript to refer to the body doc of the page the user is currently on.
//for example:
async function changeColor() {
    let [tab] = await chrome.tabs.query({ active: true});
    //this following line, scripting.execute script, executes the following script in the specified web page
    chrome.scripting.executeScript({
        //saying the script will execute on _ tab which was defined above as the currently active tab 
        target: {tabId: tab.id},
        //its basically like running this in the console of the current webpage
        func: () => {
            document.body.style.backgroundColor = 'red';
        }
    });
}

document.getElementById("makeItRed").addEventListener("click",changeColor);