// Store selected text
let selectedText = "";

// Create a context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sendToInputBox",
    title: "Simplify",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "sendToInputBox" && info.selectionText) {
    selectedText = info.selectionText;

    // Send the selected text to the content script
    chrome.tabs.sendMessage(tab.id, {
      action: "setInputText",
      text: selectedText
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background script:", message);

  if (message.action === "simplifyText") {
    const inputText = message.text;
    let responseObj = {};

    fetch("https://translingo-extension-sg.onrender.com/simplify-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: inputText })
    })
      .then(res => res.json())
      .then(data => {
        responseObj.simplified = data[0]?.generated_text || "Unexpected response";
        return fetch("https://translingo-extension-sg.onrender.com/term-detection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputText })
        });
      })
      .then(res => res.json())
      .then(data => {
        responseObj.terms = data[0]?.generated_text || "Unexpected response";
        sendResponse(responseObj);
      })
      .catch(err => sendResponse({ error: err.message }));

    return true;

  
  }
});