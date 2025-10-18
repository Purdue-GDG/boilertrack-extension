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