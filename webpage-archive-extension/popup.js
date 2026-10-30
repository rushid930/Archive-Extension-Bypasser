async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({
        // Chrome Extension API -- allows the extension to retrieve info about the browser tabs

        active: true, // only returns the active tab if multiple tabs are open
        lastFocusedWindow: true // only focuses on the last window used in case multiple windows are open
    });

    if (!tab || !tab.url || !/^https?:/i.test(tab.url)) {
        throw new Error("Open a regular webpage (HTTP or HTTPS) first.");
    }

    return tab;
}

async function checkArchive(url) {
    const api = "https://archive.org/wayback/available?url=" + encodeURIComponent(url);
    const response = await fetch(api);

    if (!response.ok) {
        throw new Error("Archive request failed");
    }

    const data = await response.json();

    return data.archived_snapshots?.closest;
}

async function openArchivedPage(url) {
    const snapshot = await checkArchive(url);

    if(snapshot && snapshot.available){
        chrome.tabs.create({
            url: snapshot.url
        });
    }
    else{
        console.log("No archived version found.");
    }
}

function savePage(url) {
    const saveURL = "https://web.archive.org/save/" + url;

    chrome.tabs.create({
        url: saveURL
    });
}

// Display messages in the popup
function setStatus(message) {
  document.getElementById("status").textContent = message;
}

// Initialize the extension
(async () => {
    try {
        currentUrl = await getCurrentTab();
        const parsed = new URL(currentUrl.url);
        document.getElementById("page").textContent = parsed.hostname + parsed.pathname;
    }
    catch (err) {
        document.getElementById("page").textContent = err.message;
        document.querySelectorAll("button").forEach(button => {
            button.disabled = true;
        });
    }
})();

// BUTTON 1: Save a snapshot
document.getElementById("save").addEventListener(
    "click",
    () => {
        if (!currentUrl.url) return;

        savePage(currentUrl.url);

        setStatus("Opened the Internet Archive save page.");
    }
);

// BUTTON 2: View existing snapshots
document.getElementById("view").addEventListener(
    "click",
    () => {
        if (!currentUrl.url) return;

        openArchivedPage(currentUrl.url)

        setStatus("Opened the available snapshot history.");
    }
);

// BUTTON 3: Copy page URL
document.getElementById("copy").addEventListener(
    "click",
    async () => {
        if (!currentUrl.url) return;
        
        try{
            await navigator.clipboard.writeText(currentUrl.url);
            setStatus("Page URL copied.");
        }
        catch{
            setStatus("Could not copy the URL from this page.");
        }
    }
);