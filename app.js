document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const welcomeScreen = document.getElementById('welcomeScreen');
  const appInterface = document.getElementById('appInterface');
  const startExperienceBtn = document.getElementById('startExperienceBtn');
  const chatContainer = document.getElementById('chatContainer');
  const userInput = document.getElementById('userInput');
  const sendButton = document.getElementById('sendButton');
  const voiceInputBtn = document.getElementById('voiceInputBtn');
  const suggestionChips = document.getElementById('suggestionChips');
  const newChatButton = document.getElementById('newChatButton');
  
  // Elements that are no longer in the DOM after redesign, set to null
  const savedTrendsContainer = null;
  const toggleSidebarButton = null;
  const mobileMenuButton = null;
  const sidebar = null;
  const mainContent = document.querySelector('.main-content');
  const inputContainer = document.querySelector('.input-container');
  
  // State variables
  let currentConversationId = Date.now().toString();
  let userInteracted = false;
  let isProcessing = false; // Flag to prevent multiple submissions
  let conversationContext = []; // Store conversation history for context
  let currentTrend = null; // Current trend being discussed
  let recognition = null; // Speech recognition object
  let lastUserMessage = '';
  let lastScrollPosition = 0;
  
  // API configuration
  const API_ENDPOINT = 'http://localhost:8080/api/chat';
  const MOCK_API_ENDPOINT = 'http://localhost:8080/api/chat/mock';
  
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
      // Check if the user has visited before
      const hasVisited = localStorage.getItem('hasVisitedBefore');
      
      if (hasVisited) {
          // User has visited before, skip welcome screen
          welcomeScreen.classList.add('hidden');
          appInterface.classList.remove('hidden');
          // Add welcome message
          addSystemMessage("Catch a trend or ask about one");
          
          // Show default suggestion chips
          updateSuggestionChips([
              { prompt: "What's trending on TikTok?", autoSend: true },
              { prompt: "Show me a weird internet trend", autoSend: true },
              { prompt: "Why is this viral?", autoSend: true },
              { prompt: "Give me a niche fashion moment", autoSend: true }
          ]);
      } else {
          // First time visit, show welcome screen
          setupWelcomeScreen();
      }
      
      // Set up event listeners - only add listeners for elements that exist
      startExperienceBtn.addEventListener('click', startExperience);
      userInput.addEventListener('keydown', handleInputKeydown);
      userInput.addEventListener('input', autoResizeTextarea);
      sendButton.addEventListener('click', handleSendMessage);
      if (voiceInputBtn) voiceInputBtn.addEventListener('click', toggleVoiceInput);
      if (newChatButton) newChatButton.addEventListener('click', startNewConversation);
      
      // Add event listeners to suggestion chips (will be dynamically created)
      suggestionChips.addEventListener('click', (e) => {
          const chip = e.target.closest('.suggestion-chip');
          if (chip) {
              userInput.value = chip.dataset.prompt;
              userInput.focus();
              autoResizeTextarea();
              // Automatically send the message if it's a complete query
              if (chip.dataset.autoSend === 'true') {
                  handleSendMessage();
              }
          }
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
      
      // Setup speech recognition if available
      setupSpeechRecognition();
      
      // Initial resize check
      handleResize();
  }
  
  // Set up welcome screen
  function setupWelcomeScreen() {
      welcomeScreen.classList.remove('hidden');
      appInterface.classList.add('hidden');
  }
  
  // Start the PULSE experience
  function startExperience() {
      // Hide welcome screen with animation
      welcomeScreen.classList.add('hidden');
      
      // Show app interface after a short delay
      setTimeout(() => {
          appInterface.classList.remove('hidden');
          
          // Add welcome message
          addSystemMessage("Catch what's in the air");
          
          // Show default suggestion chips
          updateSuggestionChips([
              { prompt: "What's trending on TikTok?", autoSend: true },
              { prompt: "Show me a weird internet trend", autoSend: true },
              { prompt: "Why is this viral?", autoSend: true },
              { prompt: "Give me a niche fashion moment", autoSend: true }
          ]);
          
          // Mark as visited
          localStorage.setItem('hasVisitedBefore', 'true');
          
          // Auto-generate a trend after a short delay
          setTimeout(() => {
              generateNewTrend();
          }, 1000);
      }, 500);
  }
  
  // Handle window resize
  function handleResize() {
      // Ensure content is responsive
      if (window.innerWidth <= 768) {
          // Mobile adjustments
          chatContainer.style.paddingBottom = '120px';
      } else {
          // Desktop adjustments
          chatContainer.style.paddingBottom = '150px';
      }
  }
  
  // Setup speech recognition
  function setupSpeechRecognition() {
      if (('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && voiceInputBtn) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          
          recognition.onresult = (event) => {
              const transcript = event.results[0][0].transcript;
              userInput.value = transcript;
              autoResizeTextarea();
              handleSendMessage();
          };
          
          recognition.onerror = (event) => {
              console.error('Speech recognition error', event.error);
              voiceInputBtn.classList.remove('recording');
              showToast('Voice input error. Please try again.');
          };
          
          recognition.onend = () => {
              voiceInputBtn.classList.remove('recording');
          };
      } else if (voiceInputBtn) {
          voiceInputBtn.style.display = 'none';
      }
  }
  
  // Toggle voice input
  function toggleVoiceInput() {
      if (!recognition) return;
      
      if (voiceInputBtn.classList.contains('recording')) {
          recognition.stop();
      } else {
          recognition.start();
          voiceInputBtn.classList.add('recording');
          showToast('Listening...');
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
  }
  
  // Auto-resize textarea as user types
  function autoResizeTextarea() {
      userInput.style.height = 'auto';
      userInput.style.height = (userInput.scrollHeight) + 'px';
      
      // Enable/disable send button based on content
      if (userInput.value.trim()) {
          sendButton.disabled = false;
          sendButton.classList.remove('disabled');
      } else {
          sendButton.disabled = true;
          sendButton.classList.add('disabled');
      }
  }
  
  // Handle sending a message
  function handleSendMessage() {
      const message = userInput.value.trim();
      if (!message || isProcessing) return;
      
      // Save last message for up-arrow recall
      lastUserMessage = message;
      
      // Mark as processing
      isProcessing = true;
      sendButton.disabled = true;
      sendButton.classList.add('disabled');
      
      // Add user message to chat
      addMessageToChat(message, 'user');
      
      // Clear input
      userInput.value = '';
      userInput.style.height = 'auto';
      
      // Process the message
      processUserMessage(message);
  }
  
  // Process user message and generate response
  function processUserMessage(message) {
      // Add to conversation context
      conversationContext.push({
          role: 'user',
          content: message
      });
      
      // Show typing indicator
      showTypingIndicator();
      
      // Check if it's a request for a new trend or a follow-up question
      if (message.toLowerCase().includes('trend') || 
          message.toLowerCase().includes('show me') || 
          message.toLowerCase().includes('what\'s') ||
          message.toLowerCase().match(/hit me|another one|new one|weird|viral|fashion|tiktok|niche/i)) {
          
          // Generate a trend
          generateNewTrend();
      } else if (currentTrend) {
          // It's a follow-up question about the current trend
          fetchAIResponse(message, currentTrend);
      } else {
          // General conversation
          fetchAIResponse(message);
      }
  }
  
  // Fetch AI response from API
  function fetchAIResponse(question, trend = null) {
      const payload = {
          question: question,
          trend: trend || {},
          context: conversationContext.slice(-5) // Send last 5 messages for context
      };
      
      // Show loading state
      isProcessing = true;
      
      // Always use the main API endpoint for all requests
      const endpoint = API_ENDPOINT;
      
      // For debugging
      console.log('Sending request to:', endpoint);
      console.log('Payload:', JSON.stringify(payload));
      
      // Check if server is available first
      checkServerAvailability()
          .then(serverAvailable => {
              if (!serverAvailable) {
                  throw new Error('Server not available');
              }
              
              return fetch(endpoint, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(payload)
              });
          })
          .then(response => {
              if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.json();
          })
          .then(data => {
              // Remove typing indicator
              removeTypingIndicator();
              
              // Add AI response to chat
              addMessageToChat(data.response, 'ai');
              
              // Add to conversation context
              conversationContext.push({
                  role: 'assistant',
                  content: data.response
              });
              
              // Suggest relevant follow-up questions
              suggestFollowUps(question, data.response, trend);
              
              // Enable input again
              isProcessing = false;
              autoResizeTextarea();
          })
          .catch(error => {
              console.error('Error fetching AI response:', error);
              removeTypingIndicator();
              
              // Check what kind of error occurred
              let fallbackResponse;
              
              if (error.message === 'Server not available') {
                  fallbackResponse = "Can't reach the server right now. Make sure the backend is running at http://localhost:8080.";
              } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                  fallbackResponse = "Network issue. Check your connection or make sure the server is running.";
              } else {
                  fallbackResponse = "Having trouble processing that right now. Try asking about another trend.";
              }
              
              addMessageToChat(fallbackResponse, 'ai');
              
              // Provide helpful suggestion chips
              updateSuggestionChips([
                  { prompt: "Show me a trend (offline mode)", autoSend: true },
                  { prompt: "Tell me about a viral meme", autoSend: true },
                  { prompt: "What's trending on TikTok?", autoSend: true }
              ]);
              
              isProcessing = false;
              autoResizeTextarea();
          });
  }
  
  // Check if the server is available
  function checkServerAvailability() {
      return fetch('http://localhost:8080/api/health')
          .then(response => response.ok)
          .catch(() => false);
  }
  
  // Generate a new trend
  function generateNewTrend() {
      // Get a non-repeating random trend
      const randomTrend = getNonRepeatingTrend();
      
      // Set as current trend
      currentTrend = randomTrend;
      
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
          
          // Add assistant context for this trend
          conversationContext.push({
              role: 'assistant',
              content: `Here's a trending topic: ${randomTrend.title}. ${randomTrend.context} This is trending on ${randomTrend.origin} during ${randomTrend.month}.`
          });
          
          // Update suggestion chips with follow-up questions
          updateSuggestionChips([
              { prompt: `Why is ${randomTrend.title} trending?`, autoSend: true },
              { prompt: "Show me another trend", autoSend: true },
              { prompt: `Who started this trend?`, autoSend: true },
              { prompt: `Show me examples`, autoSend: true }
          ]);
          
          // Enable input again
          isProcessing = false;
          autoResizeTextarea();
      }, 1200);
  }
  
  // Suggest follow-up questions based on the conversation
  function suggestFollowUps(question, response, trend) {
      let suggestions = [];
      
      if (trend) {
          // Trend-specific follow-ups
          if (question.toLowerCase().includes('why')) {
              suggestions = [
                  { prompt: "Show me examples", autoSend: true },
                  { prompt: `Who started this?`, autoSend: true },
                  { prompt: "Show me another trend", autoSend: true },
                  { prompt: "Is this controversial?", autoSend: true }
              ];
          } else if (question.toLowerCase().includes('who') || question.toLowerCase().includes('origin')) {
              suggestions = [
                  { prompt: `Why is this popular?`, autoSend: true },
                  { prompt: "Show me examples", autoSend: true },
                  { prompt: "Show me another trend", autoSend: true },
                  { prompt: "Similar trends?", autoSend: true }
              ];
          } else if (question.toLowerCase().includes('example')) {
              suggestions = [
                  { prompt: `Is this controversial?`, autoSend: true },
                  { prompt: "Show me another trend", autoSend: true },
                  { prompt: `Similar trends?`, autoSend: true },
                  { prompt: "Who started this?", autoSend: true }
              ];
          } else {
              suggestions = [
                  { prompt: `Why is this trending?`, autoSend: true },
                  { prompt: "Show me examples", autoSend: true },
                  { prompt: "Show me another trend", autoSend: true },
                  { prompt: "Who started this?", autoSend: true }
              ];
          }
      } else {
          // General follow-ups
          suggestions = [
              { prompt: "What's trending on TikTok?", autoSend: true },
              { prompt: "Show me a weird internet trend", autoSend: true },
              { prompt: "Why is this viral?", autoSend: true },
              { prompt: "Give me a niche fashion moment", autoSend: true }
          ];
      }
      
      updateSuggestionChips(suggestions);
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
  
  // Add a system message to the chat
  function addSystemMessage(text) {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message', 'system-message');
      messageElement.textContent = text;
      
      chatContainer.appendChild(messageElement);
      
      // Add animation class after a small delay (for transition effect)
      setTimeout(() => {
          messageElement.classList.add('visible');
      }, 10);
      
      // Scroll to bottom
      scrollToBottom();
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
      } 
      // Check if the message contains web search results
      else if (text.includes('[WEB_RESULT]')) {
          const parts = text.replace(/\[WEB_RESULT\]/g, '<div class="web-result">').replace(/\[\/WEB_RESULT\]/g, '</div>');
          messageElement.innerHTML = parts;
      } 
      else {
          // Convert URLs to links
          const linkedText = text.replace(
              /(https?:\/\/[^\s]+)/g, 
              '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
          );
          messageElement.innerHTML = linkedText;
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
      trendElement.classList.add('message', 'ai-message');
      
      // Create trend content
      trendElement.innerHTML = `
          <div class="trend-card">
              <div class="trend-title">${trend.title}</div>
              <div class="trend-context">${trend.context}</div>
              <div class="trend-meta">
                  <div class="meta-item">
                      <span class="meta-label">WHEN</span>
                      <span>${trend.month}</span>
                  </div>
                  <div class="meta-item">
                      <span class="meta-label">WHERE</span>
                      <span>${trend.origin}</span>
                  </div>
              </div>
          </div>
      `;
      
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
          
          // Handle both string and object formats
          if (typeof suggestion === 'string') {
              chip.textContent = suggestion;
              chip.dataset.prompt = suggestion;
              chip.dataset.autoSend = 'false';
          } else {
              chip.textContent = suggestion.prompt;
              chip.dataset.prompt = suggestion.prompt;
              chip.dataset.autoSend = suggestion.autoSend.toString();
          }
          
          suggestionChips.appendChild(chip);
      });
  }
  
  // Show toast notification
  function showToast(message) {
      // Create toast element
      const toast = document.createElement('div');
      toast.classList.add('toast-notification');
      toast.textContent = message;
      
      // Add to body
      document.body.appendChild(toast);
      
      // Remove after 3 seconds
      setTimeout(() => {
          document.body.removeChild(toast);
      }, 3000);
  }
  
  // Empty sidebar toggle function to prevent errors
  function toggleSidebar() {
      console.log("Sidebar functionality has been removed in the UI redesign");
  }
  
  // Start a new conversation
  function startNewConversation() {
      currentConversationId = Date.now().toString();
      chatContainer.innerHTML = '';
      
      // Reset conversation context
      conversationContext = [];
      currentTrend = null;
      
      // Add welcome message
      addSystemMessage("What's in the air today?");
      
      // Reset suggestion chips
      updateSuggestionChips([
          { prompt: "What's trending on TikTok?", autoSend: true },
          { prompt: "Show me a weird internet trend", autoSend: true },
          { prompt: "Why is this viral?", autoSend: true },
          { prompt: "Give me a niche fashion moment", autoSend: true }
      ]);
      
      // Generate a new trend
      setTimeout(() => {
          generateNewTrend();
      }, 500);
      
      // Reset processing state
      isProcessing = false;
      autoResizeTextarea();
  }
  
  // Initialize the app
  init();
});