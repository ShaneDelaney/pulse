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
  const TREND_API_ENDPOINT = 'http://localhost:8080/api/trend';
  
  // Default trend questions to auto-prompt after start
  const defaultTrendQuestions = [
    "What's trending on TikTok?",
    "Tell me about the latest social media trend",
    "What's the biggest viral challenge right now?",
    "Show me a trending fashion moment"
  ];
  
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
      
      // Always show welcome screen on first load, no auto-transition
      setupWelcomeScreen();
      
      // Set up event listeners
      startExperienceBtn.addEventListener('click', startExperience);
      userInput.addEventListener('keydown', handleInputKeydown);
      userInput.addEventListener('input', autoResizeTextarea);
      sendButton.addEventListener('click', handleSendMessage);
      if (voiceInputBtn) voiceInputBtn.addEventListener('click', toggleVoiceInput);
      newChatButton.addEventListener('click', startNewConversation);
      
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
      
      // Save to localStorage that user has visited
      if (hasVisited) {
          userInteracted = true;
      }
  }
  
  // Set up welcome screen
  function setupWelcomeScreen() {
      welcomeScreen.classList.remove('hidden');
      appInterface.classList.add('hidden');
  }
  
  // Start the Trend Explorer experience
  function startExperience() {
      // Hide welcome screen with animation
      welcomeScreen.classList.add('hidden');
      
      // Show app interface after a short delay
      setTimeout(() => {
          appInterface.classList.remove('hidden');
          
          // Add welcome message
          addSystemMessage("Explore the latest trends");
          
          // Mark as visited
          localStorage.setItem('hasVisitedBefore', 'true');
          
          // Auto-prompt with a random trend question
          const randomTrendQuestion = defaultTrendQuestions[Math.floor(Math.random() * defaultTrendQuestions.length)];
          setTimeout(() => {
              // Set the input value
              userInput.value = randomTrendQuestion;
              
              // Resize the input
              autoResizeTextarea();
              
              // Send the message
              handleSendMessage();
          }, 800);
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
      fetchTrendResponse(message);
  }
  
  // Fetch trend response from OpenRouter via our server
  function fetchTrendResponse(userMessage) {
      // Show typing indicator
      showTypingIndicator();
      
      // Prepare request payload
      const payload = {
          userInput: userMessage
      };
      
      // For debugging
      console.log('Sending request to:', TREND_API_ENDPOINT);
      console.log('Payload:', JSON.stringify(payload));
      
      // Send request to our server
      fetch(TREND_API_ENDPOINT, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
      })
      .then(response => {
          if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
      })
      .then(data => {
          console.log('Response from server:', data);
          
          // Remove typing indicator
          removeTypingIndicator();
          
          // Add AI response to chat
          addMessageToChat(data.response, 'ai');
          
          // Add to conversation context
          conversationContext.push({
              role: 'user',
              content: userMessage
          });
          conversationContext.push({
              role: 'assistant',
              content: data.response
          });
          
          // Enable input again
          isProcessing = false;
          autoResizeTextarea();
      })
      .catch(error => {
          console.error('Error fetching trend response:', error);
          removeTypingIndicator();
          
          // Try the regular chat API as fallback
          console.log('Trying fallback to regular chat API...');
          
          // Prepare fallback payload
          const fallbackPayload = {
              question: userMessage,
              context: conversationContext.slice(-5) // Send last 5 messages for context
          };
          
          // Send fallback request
          fetch(API_ENDPOINT, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(fallbackPayload)
          })
          .then(response => {
              if (!response.ok) throw new Error(`Fallback HTTP error! Status: ${response.status}`);
              return response.json();
          })
          .then(data => {
              console.log('Fallback response:', data);
              removeTypingIndicator();
              addMessageToChat(data.response, 'ai');
              
              // Add to conversation context
              conversationContext.push({
                  role: 'user',
                  content: userMessage
              });
              conversationContext.push({
                  role: 'assistant',
                  content: data.response
              });
              
              isProcessing = false;
              autoResizeTextarea();
          })
          .catch(fallbackError => {
              console.error('Fallback error:', fallbackError);
              
              // Show final error message
              let errorMessage = "Something went wrong. Please try again.";
              if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || 
                  fallbackError.message.includes('Failed to fetch') || fallbackError.message.includes('NetworkError')) {
                  errorMessage = "Network issue. Make sure the server is running at http://localhost:8080.";
              }
              
              addMessageToChat(errorMessage, 'ai');
              isProcessing = false;
              autoResizeTextarea();
          });
      });
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
      addSystemMessage("Start a new trend exploration");
      
      // Auto-prompt with a random trend question
      const randomTrendQuestion = defaultTrendQuestions[Math.floor(Math.random() * defaultTrendQuestions.length)];
      setTimeout(() => {
          // Set the input value
          userInput.value = randomTrendQuestion;
          
          // Resize the input
          autoResizeTextarea();
          
          // Send the message
          handleSendMessage();
      }, 800);
      
      // Reset processing state
      isProcessing = false;
      autoResizeTextarea();
  }
  
  // Initialize the app
  init();
});