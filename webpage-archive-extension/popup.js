async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({
        // Chrome Extension API -- allows the extension to retrieve info about the browser tabs

        active: true, // only returns the active tab if multiple tabs are open
        lastFocusedWindow: true // only focuses on the last window used in case multiple windows are open
    });

    return tab;
}

// Checks if website already has an archived version
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

// async function testArchive() {
//     const tab = await getCurrentTab();
//     if (!tab) return;

//     const url = tab.url;

//     try {

//         const archive = await checkArchive(url);

//         console.log("Original URL:", url);
//         console.log("Archive Result:", archive);

//         if (archive) {
//             console.log("Archived URL:", archive.url);
//             console.log("Timestamp:", archive.timestamp);
//             console.log("Available:", archive.available);
//         } else {
//             console.log("No archived version found.");
//         }

//     } catch (error) {

//         console.error("Error:", error);

//     }
// }

// // Function to display current tab information
// async function displayTabInfo() {
//     const tab = await getCurrentTab();

//     if (!tab) return;

//     console.log("Current Tab:", tab);
//     console.log("Tab ID:", tab.id);
//     console.log("Tab URL:", tab.url);
//     console.log("Tab Title:", tab.title);
// }

// // Detect when switching tabs
// chrome.tabs.onActivated.addListener(() => {
//     displayTabInfo();
//     // testArchive();
// });

// // Detect when navigating or updating a webpage
// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     // Only execute when the webpage has finished loading
//     if (changeInfo.status === "complete" && tab.active) {
//         displayTabInfo();
//         // testArchive();
//     }
// });