document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const chatContainer = document.getElementById('chatContainer');
  const userInput = document.getElementById('userInput');
  const sendButton = document.getElementById('sendButton');
  const hitMeAgainButton = document.getElementById('hitMeAgainButton');
  const hitMeAgainContainer = document.getElementById('hitMeAgainContainer');
  const suggestionChips = document.getElementById('suggestionChips');
  const savedTrendsContainer = document.getElementById('savedTrends');
  const newChatButton = document.getElementById('newChatButton');
  const toggleSidebarButton = document.getElementById('toggleSidebarButton');
  const mobileMenuButton = document.getElementById('mobileMenuButton');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.querySelector('.main-content');
  const inputContainer = document.querySelector('.input-container');
  
  // State variables
  let savedTrends = JSON.parse(localStorage.getItem('savedTrends')) || [];
  let currentConversationId = Date.now().toString();
  let userInteracted = false;
  let idleTimer = null;
  let lastUserMessage = '';
  let lastScrollPosition = 0;
  
  // Your existing trend data
  const trendsData = [
      {
          title: "Mother's Day Gifting Revolution",
          context: "A surge in AI-powered gift suggestions, with smart bird feeders and personalized jewelry topping the charts.",
          month: "April-May 2025",
          origin: "TikTok, Instagram, E-commerce"
      },
      {
          title: "POV: You're Being Mugged Meme",
          context: "A viral TikTok trend where creators humorously reenact exaggerated mugging scenarios, often with unexpected twists.",
          month: "March 2025",
          origin: "TikTok"
      },
      {
          title: "KATSEYE's Gnarly Release",
          context: "The surprise drop of KATSEYE's 'Gnarly' has sparked a wave of reaction videos and dance challenges across platforms.",
          month: "February 2025",
          origin: "TikTok, Instagram, YouTube"
      }
      // Add the rest of your trends here
  ];
  
  // Keep track of recently shown trends to avoid repetition
  const recentTrends = [];
  const maxRecentTrends = 5;
  
  // Initialize the app
  function init() {
      // Set up event listeners
      userInput.addEventListener('keydown', handleInputKeydown);
      userInput.addEventListener('input', autoResizeTextarea);
      sendButton.addEventListener('click', handleSendMessage);
      hitMeAgainButton.addEventListener('click', generateNewTrend);
      newChatButton.addEventListener('click', startNewConversation);
      toggleSidebarButton.addEventListener('click', toggleSidebar);
      if (mobileMenuButton) {
          mobileMenuButton.addEventListener('click', toggleSidebar);
      }
      
      // Add event listeners to suggestion chips
      document.querySelectorAll('.suggestion-chip').forEach(chip => {
          chip.addEventListener('click', () => {
              userInput.value = chip.dataset.prompt;
              userInput.focus();
              autoResizeTextarea();
          });
      });
      
      // Save scroll position when scrolling
      chatContainer.addEventListener('scroll', () => {
          lastScrollPosition = chatContainer.scrollTop;
      });
      
      // Handle window resize
      window.addEventListener('resize', handleResize);
      
      // Handle escape key to clear input
      document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
              userInput.value = '';
              userInput.style.height = 'auto';
              userInput.blur();
          }
      });
      
      // Load saved trends into sidebar
      renderSavedTrends();
      
      // Start idle timer
      resetIdleTimer();
      
      // Show hit me again button after a delay
      setTimeout(() => {
          hitMeAgainContainer.classList.add('visible');
      }, 3000);
      
      // Initial resize check
      handleResize();
  }
  
  // Handle window resize
  function handleResize() {
      if (window.innerWidth <= 1023) {
          sidebar.classList.add('sidebar-collapsed');
          mainContent.classList.add('sidebar-hidden');
          inputContainer.classList.add('sidebar-hidden');
      } else {
          if (!sidebar.classList.contains('sidebar-collapsed')) {
              mainContent.classList.remove('sidebar-hidden');
              inputContainer.classList.remove('sidebar-hidden');
          }
      }
  }
  
  // Handle input keydown events
  function handleInputKeydown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
      } else if (e.key === 'ArrowUp' && userInput.value === '') {
          // Fill with last message for editing
          userInput.value = lastUserMessage;
          // Place cursor at the end
          setTimeout(() => {
              userInput.selectionStart = userInput.selectionEnd = userInput.value.length;
              autoResizeTextarea();
          }, 0);
      }
      
      userInteracted = true;
      resetIdleTimer();
  }
  
  // Auto-resize textarea as user types
  function autoResizeTextarea() {
      userInput.style.height = 'auto';
      userInput.style.height = (userInput.scrollHeight) + 'px';
  }
  
  // Handle sending a message
  function handleSendMessage() {
      const message = userInput.value.trim();
      if (!message) return;
      
      // Save last message for up-arrow recall
      lastUserMessage = message;
      
      // Add user message to chat
      addMessageToChat(message, 'user');
      
      // Clear input
      userInput.value = '';
      userInput.style.height = 'auto';
      
      // Process the message
      processUserMessage(message);
      
      // Hide hit me again button when user sends a message
      hitMeAgainContainer.classList.remove('visible');
  }
  
  // Process user message and generate response
  function processUserMessage(message) {
      // Check if it's a request for a new trend
      if (message.toLowerCase().includes('trend') || 
          message.toLowerCase().includes('show me') || 
          message.toLowerCase().includes('what\'s popular') ||
          message.toLowerCase().includes('hit me')) {
          
          // Generate a trend
          generateNewTrend();
      } else {
          // Show typing indicator
          showTypingIndicator();
          
          // Get AI response about trends in general
          setTimeout(() => {
              removeTypingIndicator();
              
              const responses = [
                  "I can show you trending topics from 2025. Just ask for a specific trend or say 'hit me again' for a random one.",
                  "I'm designed to tell you about future trends. Ask me to show you a trend or something specific about trending topics.",
                  "Want to know what's trending in 2025? Just ask for a trend or a specific category like fashion or TikTok.",
                  "I can provide information about trending topics from 2025. What kind of trends are you interested in?"
              ];
              
              const randomResponse = responses[Math.floor(Math.random() * responses.length)];
              addMessageToChat(randomResponse, 'ai');
              
              // Show suggestion chips
              updateSuggestionChips([
                  "Show me a trend",
                  "What's trending on TikTok?",
                  "Give me a fashion trend"
              ]);
              
              // Show hit me again button after a delay
              setTimeout(() => {
                  hitMeAgainContainer.classList.add('visible');
              }, 2000);
          }, 1500);
      }
  }
  
  // Generate a new trend
  function generateNewTrend() {
      // Show typing indicator
      showTypingIndicator();
      
      // Get a non-repeating random trend
      const randomTrend = getNonRepeatingTrend();
      
      // Add to recent trends
      recentTrends.push(randomTrend);
      
      // Keep only the most recent 5
      if (recentTrends.length > maxRecentTrends) {
          recentTrends.shift();
      }
      
      // After a short delay, show the trend
      setTimeout(() => {
          removeTypingIndicator();
          addTrendToChat(randomTrend);
          
          // Save trend to history
          saveTrendToHistory(randomTrend);
          
          // Update suggestion chips with follow-up questions
          updateSuggestionChips([
              `Why is ${randomTrend.title} trending?`,
              "Show me another trend",
              `Similar trends to this`
          ]);
      }, 1500);
  }
  
  // Get a non-repeating random trend
  function getNonRepeatingTrend() {
      // Filter out recently shown trends
      const availableTrends = trendsData.filter(trend => 
          !recentTrends.some(recentTrend => recentTrend.title === trend.title)
      );
      
      // If all trends have been shown recently, just pick a random one
      if (availableTrends.length === 0) {
          return trendsData[Math.floor(Math.random() * trendsData.length)];
      }
      
      // Otherwise, pick a random trend from the available ones
      return availableTrends[Math.floor(Math.random() * availableTrends.length)];
  }
  
  // Add a message to the chat
  function addMessageToChat(text, type) {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message', `${type}-message`);
      
      // Check if the message contains a video link
      if (text.includes('[VIDEO]')) {
          const parts = text.split('[VIDEO]');
          const beforeVideo = parts[0];
          const videoUrl = parts[1].split(' ')[0]; // Extract the URL
          const afterVideo = parts[1].substring(videoUrl.length);
          
          messageElement.innerHTML = `
              <p>${beforeVideo}</p>
              <div class="video-embed">
                  <iframe src="${videoUrl}" frameborder="0" allowfullscreen></iframe>
              </div>
              <p>${afterVideo}</p>
          `;
      } else {
          messageElement.textContent = text;
      }
      
      chatContainer.appendChild(messageElement);
      
      // Add animation class after a small delay (for transition effect)
      setTimeout(() => {
          messageElement.classList.add('visible');
      }, 10);
      
      // Scroll to bottom
      scrollToBottom();
  }
  
  // Add a trend to the chat
  function addTrendToChat(trend) {
      const trendElement = document.createElement('div');
      trendElement.classList.add('trend-card');
      
      trendElement.innerHTML = `
          <h3 class="trend-title">${trend.title}</h3>
          <p class="trend-context">${trend.context}</p>
          <div class="trend-meta">
              <div class="meta-item">
                  <span class="meta-label">WHEN:</span>
                  <span>${trend.month}</span>
              </div>
              <div class="meta-item">
                  <span class="meta-label">WHERE:</span>
                  <span>${trend.origin}</span>
              </div>
          </div>
          <div class="follow-up-buttons">
              <button class="follow-up-btn" data-question="Why is this trending?">Why is this trending?</button>
              <button class="follow-up-btn" data-question="Show me examples">Show me examples</button>
              <button class="share-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                  Share
              </button>
          </div>
      `;
      
      // Add event listeners to follow-up buttons
      trendElement.querySelectorAll('.follow-up-btn').forEach(button => {
          button.addEventListener('click', () => {
              const question = button.dataset.question;
              userInput.value = question + ' ' + trend.title;
              handleSendMessage();
          });
      });
      
      // Add event listener to share button
      trendElement.querySelector('.share-btn').addEventListener('click', () => {
          shareTrend(trend);
      });
      
      chatContainer.appendChild(trendElement);
      
      // Add animation class after a small delay (for transition effect)
      setTimeout(() => {
          trendElement.classList.add('visible');
      }, 10);
      
      // Scroll to bottom
      scrollToBottom();
  }
  
  // Show typing indicator
  function showTypingIndicator() {
      const typingElement = document.createElement('div');
      typingElement.classList.add('message', 'ai-message', 'typing-indicator');
      typingElement.innerHTML = `
          <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
          </div>
      `;
      chatContainer.appendChild(typingElement);
      
      // Scroll to bottom
      scrollToBottom();
  }
  
  // Remove typing indicator
  function removeTypingIndicator() {
      const typingElement = document.querySelector('.typing-indicator');
      if (typingElement) {
          chatContainer.removeChild(typingElement);
      }
  }
  
  // Scroll to bottom of chat
  function scrollToBottom() {
      chatContainer.scrollTop = chatContainer.scrollHeight;
      lastScrollPosition = chatContainer.scrollTop;
  }
  
  // Update suggestion chips
  function updateSuggestionChips(suggestions) {
      suggestionChips.innerHTML = '';
      
      suggestions.forEach(suggestion => {
          const chip = document.createElement('button');
          chip.classList.add('suggestion-chip');
          chip.textContent = suggestion;
          chip.dataset.prompt = suggestion;
          
          chip.addEventListener('click', () => {
              userInput.value = suggestion;
              userInput.focus();
              autoResizeTextarea();
          });
          
          suggestionChips.appendChild(chip);
      });
  }
  
  // Show toast notification
  function showToast(message) {
      // Remove any existing toasts
      const existingToast = document.querySelector('.toast-notification');
      if (existingToast) {
          document.body.removeChild(existingToast);
      }
      
      // Create new toast
      const toast = document.createElement('div');
      toast.classList.add('toast-notification');
      toast.textContent = message;
      document.body.appendChild(toast);
      
      // Show the toast
      setTimeout(() => {
          toast.classList.add('toast-show');
      }, 10);
      
      // Hide and remove after 3 seconds
      setTimeout(() => {
          toast.classList.remove('toast-show');
          toast.classList.add('toast-hide');
          setTimeout(() => {
              document.body.removeChild(toast);
          }, 300);
      }, 3000);
  }
  
  // Save trend to history
  function saveTrendToHistory(trend) {
      // Create a new saved trend item
      const savedTrend = {
          id: Date.now().toString(),
          conversationId: currentConversationId,
          title: trend.title,
          trend: trend,
          timestamp: Date.now()
      };
      
      // Add to saved trends
      savedTrends.unshift(savedTrend);
      
      // Keep only the most recent 20
      if (savedTrends.length > 20) {
          savedTrends.pop();
      }
      
      // Save to localStorage
      localStorage.setItem('savedTrends', JSON.stringify(savedTrends));
      
      // Update sidebar
      renderSavedTrends();
  }
  
  // Render saved trends in sidebar
  function renderSavedTrends() {
      savedTrendsContainer.innerHTML = '';
      
      if (savedTrends.length === 0) {
          const emptyMessage = document.createElement('div');
          emptyMessage.classList.add('empty-trends-message');
          emptyMessage.textContent = 'No saved trends yet';
          savedTrendsContainer.appendChild(emptyMessage);
          return;
      }
      
      savedTrends.forEach(item => {
          const trendElement = document.createElement('div');
          trendElement.classList.add('saved-trend-item');
          if (item.conversationId === currentConversationId) {
              trendElement.classList.add('active');
          }
          
          // Format the date
          const date = new Date(item.timestamp);
          const formattedDate = date.toLocaleDateString(undefined, { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
          });
          
          trendElement.innerHTML = `
              <div class="saved-trend-title">${item.title}</div>
              <div class="saved-trend-time">${formattedDate}</div>
          `;
          
          trendElement.addEventListener('click', () => {
              loadSavedTrend(item);
          });
          
          savedTrendsContainer.appendChild(trendElement);
      });
  }
  
  // Load a saved trend
  function loadSavedTrend(trendItem) {
      // Start a new conversation with this trend
      startNewConversation();
      currentConversationId = trendItem.conversationId;
      
      // After a short delay, add the trend to the chat
      setTimeout(() => {
          addTrendToChat(trendItem.trend);
          
          // Update suggestion chips
          updateSuggestionChips([
              `Why is ${trendItem.trend.title} trending?`,
              "Show me another trend",
              `Similar trends to this`
          ]);
          
          // Update active state in sidebar
          renderSavedTrends();
      }, 300);
      
      // On mobile, close sidebar
      if (window.innerWidth <= 1023) {
          toggleSidebar();
      }
  }
  
  // Start a new conversation
  function startNewConversation() {
      currentConversationId = Date.now().toString();
      chatContainer.innerHTML = '';
      
      // Add welcome message
      const welcomeMessage = document.createElement('div');
      welcomeMessage.classList.add('message', 'system-message');
      welcomeMessage.innerHTML = '<p>Welcome to PULSE. Discover trending topics or ask questions about trends.</p>';
      chatContainer.appendChild(welcomeMessage);
      
      // Show hit me again button
      setTimeout(() => {
          hitMeAgainContainer.classList.add('visible');
      }, 1000);
      
      // Reset suggestion chips
      updateSuggestionChips([
          "Show me a trend",
          "What's trending on TikTok?",
          "Give me a fashion trend"
      ]);
      
      // On mobile, close sidebar
      if (window.innerWidth <= 768) {
          sidebar.classList.add('sidebar-collapsed');
      }
  }
  
  // Toggle sidebar
  function toggleSidebar() {
      sidebar.classList.toggle('sidebar-collapsed');
      sidebar.classList.toggle('sidebar-visible');
      mainContent.classList.toggle('sidebar-hidden');
      inputContainer.classList.toggle('sidebar-hidden');
  }
  
  // Share a trend
  function shareTrend(trend) {
      // Create a shareable text
      const shareText = `PULSE Trend Alert: ${trend.title}\n\n${trend.context}\n\nWhen: ${trend.month}\nWhere: ${trend.origin}\n\nDiscover more at PULSE`;
      
      // Try to use the Web Share API if available
      if (navigator.share) {
          navigator.share({
              title: 'PULSE Trend Alert',
              text: shareText,
              url: window.location.href
          })
          .catch(error => {
              console.error('Error sharing:', error);
              fallbackShare();
          });
      } else {
          fallbackShare();
      }
      
      // Fallback to clipboard copy
      function fallbackShare() {
          navigator.clipboard.writeText(shareText)
              .then(() => {
                  showToast('Copied to clipboard!');
              })
              .catch(err => {
                  console.error('Failed to copy text: ', err);
                  showToast('Unable to copy to clipboard');
              });
      }
  }
  
  // Reset idle timer
  function resetIdleTimer() {
      clearTimeout(idleTimer);
      
      // Set up new idle timer (10 seconds)
      idleTimer = setTimeout(() => {
          if (!hitMeAgainContainer.classList.contains('visible')) {
              hitMeAgainContainer.classList.add('visible');
          }
      }, 10000);
  }
  
  // Initialize the app
  init();
});