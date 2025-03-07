const toggleButton = document.createElement('button');
toggleButton.className = 'toggle-button';
toggleButton.style.backgroundImage = `url(${chrome.runtime.getURL("TransLingoLogo.png")})`;
toggleButton.style.position = 'fixed';
toggleButton.style.width = '50px';
toggleButton.style.height = '50px';
toggleButton.style.borderRadius = '50%';
toggleButton.style.zIndex = '10000';
toggleButton.style.cursor = 'move';
toggleButton.style.backgroundSize = 'cover';

const savedPosition = JSON.parse(localStorage.getItem('toggleButtonPosition'));
if (savedPosition) {
    toggleButton.style.left = savedPosition.left;
    toggleButton.style.top = savedPosition.top;
} else {
    toggleButton.style.right = '20px';
    toggleButton.style.top = '20px';
}

document.body.appendChild(toggleButton);

const anchorElement = document.createElement('div');
anchorElement.className = 'anchored-panel';
anchorElement.style.display = 'none'; 

const video = document.createElement('video');
video.className = 'video-background';
video.src = chrome.runtime.getURL('background_Video2.mp4');
video.autoplay = true;
video.loop = true;
video.muted = true; // Ensure the video plays silently
anchorElement.appendChild(video);

const layer1 = document.createElement('div');
layer1.className = 'layer1';
anchorElement.appendChild(layer1);

const container = document.createElement('div');
container.style.width='100%';
container.style.height='70%';
container.style.transition = 'all 1s ease'; // Smooth transition
container.style.display = 'flex';
container.style.flexDirection = 'column'; // Stack items vertically
container.style.alignItems = 'center'; // Center horizontally
container.style.justifyContent = 'center';
container.style.zIndex = '1000';
container.className = 'container';

// Get the logo URL from local files
const logoURL = chrome.runtime.getURL('TransLingoLogo2point1.png'); // Replace 'logo.png' with your actual logo filename

// Create the logo
const logo = document.createElement('img');
logo.src = logoURL;
logo.alt = 'Logo';
logo.style.width = '150px';
logo.style.height = '150px';
logo.style.borderRadius = '10px'; // Make it round

// Create the text
const text = document.createElement('p');
text.textContent = 'TransLingo';
text.style.fontSize = '32px';
text.style.fontWeight = 'bold';
text.style.marginTop = '10px'; // Add spacing between logo and text

// Append the logo and text to the container
container.appendChild(logo);
container.appendChild(text);

// Append the container to the body
layer1.appendChild(container);

const titleElement = document.createElement('h2');
titleElement.textContent = 'TRANSLINGO';
titleElement.style.display = 'none'; 
layer1.appendChild(titleElement);

const instructionsElement = document.createElement('p');
instructionsElement.textContent = 'Directions: Input text containing jargon, TransLingo will translate it into simplifed text.';
instructionsElement.style.display = 'none'; 
layer1.appendChild(instructionsElement);

const inputElement = document.createElement('textarea');
inputElement.placeholder = 'Text containing computer science jargon';
inputElement.className = 'input-textarea';

const outputElement = document.createElement('div');
outputElement.placeholder = 'Simplified text';
outputElement.className = 'output-textarea';
outputElement.style.display = 'none';
outputElement.contentEditable = false;

const translateButton = document.createElement('button');
translateButton.textContent = 'Input Text First';
translateButton.className = 'translate-button';
translateButton.disabled = true;

function toggleTranslateButton() {
  translateButton.disabled = inputElement.value.trim() === '';
  translateButton.style.backgroundColor = translateButton.disabled ? '#0f0f0f': 'rgb(0,0,0,0)' ;
  translateButton.style.color = translateButton.disabled ? '#f8f8f8': '#5dd62c';
  translateButton.textContent = translateButton.disabled ? 'Input text first' : 'Simplify';
  translateButton.style.border = translateButton.disabled ? '1px solid #f8f8f8': '1px solid #5dd62c';
}

inputElement.addEventListener('input', toggleTranslateButton);

translateButton.addEventListener('click', async () => {
  if (!translateButton.disabled) {
    // Disable the button and show loading state
    container.style.left = '10px'; // Move to top-left corner
    container.style.top = '10px';
    container.style.transform = 'none'; // Reset transform
    container.style.flexDirection = 'row'; // Align items side by side
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center'; 
    logo.style.width = '50px';
    logo.style.height = '50px';
    text.style.fontSize = '15px';
    container.style.height = '70px';
    container.style.gap = '10px';
    container.style.borderBottom = '1px solid #f8f8f8'
    translateButton.disabled = true;
    translateButton.textContent = 'Simplifying...';
    translateButton.style.backgroundColor = 'rgb(0,0,0,1)';
    translateButton.style.color = '#0f0f0f';
    translateButton.classList.add('loading');

    // Get the input value
    const inputValue = inputElement.value;

    // Create or update the output textarea

    // Show a loading message in the output textarea
    outputElement.style.display = 'block';  
    outputElement.value = 'Simplifying...';

    function sendMessageAsync(message) {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });
    }
    
    try {
      const response = await sendMessageAsync({ action: "simplifyText", text: inputValue });
      if (response && response.simplified && response.terms) {
        outputElement.innerHTML = `<b>Original Sentence</b><br> ${inputValue}<br><br><br><b>Simplified</b><br> ${response.simplified}<br><br><b>Terms</b><br> ${response.terms}`;
        inputElement.value = '';
        
      } else {
        outputElement.value = "Error: " + (response?.error || "Unexpected response");
      }
    } catch (error) {
      outputElement.value = "Error: " + error.message;
    } finally {
      translateButton.disabled = inputElement.value.trim() === '';
      translateButton.style.backgroundColor = translateButton.disabled ? '#0f0f0f': 'rgb(0,0,0,0)' ;
      translateButton.style.color = translateButton.disabled ? '#f8f8f8': '#5dd62c';
      translateButton.textContent = translateButton.disabled ? 'Input text first' : 'Simplify';
      translateButton.style.border = translateButton.disabled ? '1px solid #f8f8f8': '1px solid #5dd62c';
      translateButton.classList.remove('loading');
      
    }
  }
});
layer1.appendChild(outputElement);
layer1.appendChild(inputElement);
layer1.appendChild(translateButton);

document.body.appendChild(anchorElement);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received in content.js:", message);

    if (message.action === "setInputText") {
        inputElement.value = message.text;
        anchorElement.style.display = 'block';  
        toggleTranslateButton();
    } else if (message.action === "toggleTransLingo") {
        const transLingoUI = document.getElementById("transLingoUI");
        if (transLingoUI) {
            transLingoUI.style.display = message.visible ? "block" : "none";
        }
    }
});

const styleElement = document.createElement('link');
styleElement.rel = 'stylesheet';
styleElement.href = 'content.css';
document.head.appendChild(styleElement);

let isDragging = false;
let startX, startY, initialLeft, initialTop;
let isPanelVisible = false;

function handleMouseMove(event) {
    let newLeft = initialLeft + (event.clientX - startX);
    let newTop = initialTop + (event.clientY - startY);
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollbarWidth = viewportWidth - document.documentElement.clientWidth;
    const buttonWidth = toggleButton.offsetWidth;
    const buttonHeight = toggleButton.offsetHeight;

    newLeft = Math.max(0, Math.min(newLeft, viewportWidth - buttonWidth - scrollbarWidth));
    newTop = Math.max(0, Math.min(newTop, viewportHeight - buttonHeight));

    toggleButton.style.left = `${newLeft}px`;
    toggleButton.style.top = `${newTop}px`;
    isDragging = true; 
}

function handleMouseUp() {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    if (!isDragging) {
        isPanelVisible = !isPanelVisible;
        anchorElement.style.display = isPanelVisible ? 'block' : 'none';

        toggleButton.classList.add('pulse');
        setTimeout(() => toggleButton.classList.remove('pulse'), 300);
    } else {
        const position = {
            left: toggleButton.style.left,
            top: toggleButton.style.top,
        };
        localStorage.setItem('toggleButtonPosition', JSON.stringify(position));
    }

    isDragging = false;
}

toggleButton.addEventListener('mousedown', (event) => {
    isDragging = false; 
    startX = event.clientX;
    startY = event.clientY;
    initialLeft = toggleButton.offsetLeft;
    initialTop = toggleButton.offsetTop;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    event.preventDefault(); 
});

// Listen for messages from the background script
