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

      fetch("https://translingo-extension-sg.onrender.com/simplify-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputText })
      })
      .then(response => response.json())
      .then(data => {
          sendResponse({ result: data[0]?.generated_text || "Unexpected response" });
      })
      .catch(error => {
          sendResponse({ error: error.message });
      });

      // ✅ **Return true to keep the message channel open until sendResponse is called**
      return true;
  }
});