// 1. Identify the website currently opened in Chrome or whatever other browser
// 2. Retrieve said website's URL
// 3. Send the URL to the archive service
// 4. Make sure archive was successfully created
// 5. Open the archived version in a new tab (maybe just open it in the current tab)

// Architecture
// 1. Click extension
// 2. Have the extension popup
// 3. Chrome Tabs API identifies the current active webpage
// 4. Then call the archive service API
// 5. Open the archive page