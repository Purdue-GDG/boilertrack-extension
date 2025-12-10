// Content script to inject notification popup into web pages, I can't just straight up open the ext

function injectStyles() {
  const styleId = 'boilertrack-popup-styles';
  if (document.getElementById(styleId)) {
    return; // Styles already injected
  }

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    #boilertrack-notification-popup {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 2147483647;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      animation: boilertrack-slideIn 0.3s ease-out;
    }

    @keyframes boilertrack-slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .boilertrack-popup-content {
      background: linear-gradient(135deg, #111217 0%, #1E2025 100%);
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      min-width: 350px;
      transition: opacity 0.3s ease;
    }

    .boilertrack-popup-header {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .boilertrack-popup-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #D8DADE;
      opacity: 0.8;
    }

    .boilertrack-popup-icon svg {
      width: 100%;
      height: 100%;
    }

    .boilertrack-popup-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .boilertrack-popup-title {
      font-size: 16px;
      font-weight: 500;
      color: #D8DADE;
      line-height: 1.2;
    }

    .boilertrack-popup-subtitle {
      font-size: 14px;
      color: #D8DADE;
      opacity: 0.8;
      line-height: 1.2;
    }

    .boilertrack-popup-add-button {
      background: none;
      border: none;
      padding: 0;
      margin: 0;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
      outline: none !important;
      -webkit-tap-highlight-color: transparent;
      line-height: 0;
      vertical-align: top;
      box-sizing: border-box;
      width: 130px;
      height: 57px;
    }

    .boilertrack-popup-add-button:hover {
      opacity: 0.8;
    }

    .boilertrack-popup-add-button:active {
      opacity: 0.6;
    }

    .boilertrack-popup-add-button svg {
      width: 130px;
      height: 57px;
      display: block;
      flex-shrink: 0;
      margin: 0;
      padding: 0;
    }
  `;

  document.head.appendChild(style);
}

// Create and inject the notification popup
function createNotificationPopup() {
  // Ensure styles are injected first
  injectStyles();
  
  // Ensure body exists
  if (!document.body) {
    console.warn('BoilerTrack: document.body not available');
    return;
  }

  // Remove existing popup if it exists
  const existingPopup = document.getElementById('boilertrack-notification-popup');
  if (existingPopup) {
    existingPopup.remove();
  }

  // Create popup container
  const popup = document.createElement('div');
  popup.id = 'boilertrack-notification-popup';
  popup.className = 'boilertrack-popup';
  
  // Create popup content
  popup.innerHTML = `
    <div class="boilertrack-popup-content">
      <div class="boilertrack-popup-header">
        <div class="boilertrack-popup-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <!-- Train body -->
            <rect x="3" y="6" width="18" height="10" rx="1"/>
            <!-- Windows -->
            <rect x="5" y="8" width="5" height="3" fill="#111217"/>
            <rect x="14" y="8" width="5" height="3" fill="#111217"/>
            <!-- Wheels -->
            <circle cx="7" cy="19" r="2"/>
            <circle cx="17" cy="19" r="2"/>
            <!-- Smoke stack -->
            <rect x="10" y="3" width="4" height="4" rx="0.5"/>
          </svg>
        </div>
        <div class="boilertrack-popup-text">
          <div class="boilertrack-popup-title">BoilerTrack</div>
          <div class="boilertrack-popup-subtitle">5 new assignments found</div>
        </div>
      </div>
      <button class="boilertrack-popup-add-button" id="boilertrack-add-button">
        <img src="${chrome.runtime.getURL('images/gcal_add.svg')}" alt="Add to Calendar" />
      </button>
    </div>
  `;

  // Append to body
  document.body.appendChild(popup);

  // Add click handler for add button
  const addButton = popup.querySelector('#boilertrack-add-button');
  if (addButton) {
    addButton.addEventListener('click', () => {
      // Send message to extension to show task list
      chrome.runtime.sendMessage({ action: 'showTaskList' }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError.message);
        } else {
          // Close the popup after clicking add
          popup.style.opacity = '0';
          setTimeout(() => {
            if (popup && popup.parentNode) {
              popup.remove();
            }
          }, 300);
        }
      });
    });
  }

  // Auto-hide after 10 seconds (optional)
  setTimeout(() => {
    if (popup && popup.parentNode) {
      popup.style.opacity = '0';
      setTimeout(() => {
        if (popup && popup.parentNode) {
          popup.remove();
        }
      }, 300);
    }
  }, 10000);
}

// Listen for messages from extension
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'showNotification') {
    console.log('BoilerTrack: Received showNotification message');
    // Ensure DOM is ready
    const tryCreate = () => {
      if (document.body) {
        try {
          createNotificationPopup();
          console.log('BoilerTrack: Notification popup created');
          sendResponse({ success: true });
        } catch (error) {
          console.error('BoilerTrack: Error creating popup:', error);
          sendResponse({ success: false, error: String(error) });
        }
      } else {
        // Wait for body if not ready
        setTimeout(tryCreate, 100);
      }
    };
    tryCreate();
    return true; // Keep channel open for async response
  }
  return false;
});

// Initialize styles when DOM is ready
function initContentScript() {
  if (document.head) {
    injectStyles();
  } else {
    // Wait for head to be available
    const observer = new MutationObserver(() => {
      if (document.head) {
        injectStyles();
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, { childList: true });
  }
}

// Initialize when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContentScript);
} else {
  initContentScript();
}

// Log that content script has loaded
console.log('BoilerTrack: Content script loaded');
