// Get references to the buttons and input/output elements
const translateButton = document.getElementById("translateButton");
const toggleButton = document.getElementById("toggleButton");
const inputElement = document.getElementById("inputElement");
const outputElement = document.getElementById("outputElement");

// Function to update the toggle button text
function updateButtonText(visible) {
  toggleButton.textContent = visible ? "Hide TransLingo" : "Show TransLingo";
}

// Load the initial state of the toggle button
chrome.storage.sync.get("transLingoVisible", ({ transLingoVisible }) => {
  console.log("Initial transLingoVisible:", transLingoVisible);
  updateButtonText(transLingoVisible);
});

// Handle toggle button clicks
toggleButton.addEventListener("click", () => {
  chrome.storage.sync.get("transLingoVisible", ({ transLingoVisible }) => {
    const newVisibility = !transLingoVisible;

    // Send a message to the content script to toggle the UI
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "toggleTransLingo",
        visible: newVisibility
      });
    });

    // Update the visibility state in storage
    chrome.storage.sync.set({ transLingoVisible: newVisibility });
    updateButtonText(newVisibility);
  });
});

// Handle translate button clicks
translateButton.addEventListener("click", async () => {
  if (!translateButton.disabled) {
    // Disable the button and show loading state
    translateButton.disabled = true;
    translateButton.textContent = "Simplifying...";
    translateButton.style.backgroundColor = "#ccc";
    translateButton.classList.add("loading");

    // Get the input value
    const inputValue = inputElement.value;

    // Send a message to the background script
    chrome.runtime.sendMessage(
      { action: "simplifyText", text: inputValue },
      (response) => {
        // Handle the response
        if (response && response.result) {
          outputElement.value = response.result;
        } else if (response && response.error) {
          outputElement.value = "Error: " + response.error;
        } else {
          outputElement.value = "Unexpected response from the server.";
        }

        // Re-enable the button and reset its state
        translateButton.disabled = false;
        translateButton.textContent = "Simplify";
        translateButton.style.backgroundColor = ""; // Reset to default
        translateButton.classList.remove("loading");
      }
    );
  }
});