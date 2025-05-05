document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const welcomeScreen = document.getElementById('welcomeScreen');
  const appInterface = document.getElementById('appInterface');
  const startExperienceBtn = document.getElementById('startExperienceBtn');
  const chatContainer = document.getElementById('chatContainer');
  const userInput = document.getElementById('userInput');
  const sendButton = document.getElementById('sendButton');
  const suggestionChips = document.getElementById('suggestionChips');
  const newChatButton = document.getElementById('newChatButton');
  const themeToggleButton = document.getElementById('themeToggleButton');
  
  // State variables
  let currentConversationId = Date.now().toString();
  let isProcessing = false; // Flag to prevent multiple submissions
  let messages = []; // Store conversation history
  let isDarkTheme = localStorage.getItem('isDarkTheme') === 'true';
  let lastScrollPosition = 0;
  
  // API configuration
  const API_URL = 'http://localhost:8080/api/sonar';
  const DEFAULT_MODEL = 'perplexity/sonar-medium-chat';
  
  // Default suggested prompts
  const defaultPrompts = [
    "What's trending today?",
    "Summarize this article: https://example.com/article",
    "Find the best sushi in LA"
  ];
  
  // Initialize the app
  function init() {
    // Set theme based on user preference
    applyTheme();
    
    // Show appropriate screen
    setupWelcomeScreen();
    
    // Set up event listeners
    startExperienceBtn.addEventListener('click', startExperience);
    userInput.addEventListener('keydown', handleInputKeydown);
    userInput.addEventListener('input', autoResizeTextarea);
    sendButton.addEventListener('click', handleSendMessage);
    newChatButton.addEventListener('click', startNewConversation);
    themeToggleButton.addEventListener('click', toggleTheme);
    
    // Add event listeners to suggestion chips
    suggestionChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.suggestion-chip');
      if (chip) {
        userInput.value = chip.dataset.prompt;
        userInput.focus();
        autoResizeTextarea();
        handleSendMessage();
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
    
    // Initial resize check
    handleResize();
  }
  
  // Set up welcome screen
  function setupWelcomeScreen() {
    welcomeScreen.classList.remove('hidden');
    appInterface.classList.add('hidden');
  }
  
  // Apply theme based on user preference
  function applyTheme() {
    if (isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
  
  // Toggle between light and dark theme
  function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    localStorage.setItem('isDarkTheme', isDarkTheme);
    applyTheme();
  }
  
  // Start the chat experience
  function startExperience() {
    // Hide welcome screen with animation
    welcomeScreen.classList.add('hidden');
    
    // Show app interface after a short delay
    setTimeout(() => {
      appInterface.classList.remove('hidden');
      
      // Add welcome message
      addSystemMessage("How can I help you today?");
      
      // Show suggested prompts
      updateSuggestionChips(defaultPrompts);
      
      // Focus the input
      userInput.focus();
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
  
  // Handle input keydown events (e.g., Enter to send)
  function handleInputKeydown(e) {
    // Submit on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }
  
  // Auto-resize the textarea as user types
  function autoResizeTextarea() {
    userInput.style.height = 'auto';
    const newHeight = Math.min(userInput.scrollHeight, 150);
    userInput.style.height = newHeight + 'px';
    
    // Enable/disable send button based on input
    if (userInput.value.trim().length > 0 && !isProcessing) {
      sendButton.classList.remove('disabled');
    } else {
      sendButton.classList.add('disabled');
    }
  }
  
  // Handle sending a message
  function handleSendMessage() {
    const userMessage = userInput.value.trim();
    
    // Don't send empty messages or if processing
    if (userMessage.length === 0 || isProcessing) {
      return;
    }
    
    // Add user message to chat
    addMessageToChat(userMessage, 'user');
    
    // Clear input and adjust height
    userInput.value = '';
    userInput.style.height = 'auto';
    
    // Add user message to conversation history
    messages.push({
      role: 'user',
      content: userMessage
    });
    
    // Process the message
    processMessage(userMessage);
  }
  
  // Process message and fetch response
  async function processMessage(userMessage) {
    try {
      // Set processing state
      isProcessing = true;
      sendButton.classList.add('disabled');
      
      // Show typing indicator
      showTypingIndicator();
      
      // This is where we'll make the API call
      const response = await fetchChatResponse(messages);
      
      // Remove typing indicator
      removeTypingIndicator();
      
      if (response && response.content) {
        // Add assistant message to UI
        addMessageToChat(response.content, 'assistant');
        
        // Add assistant message to conversation history
        messages.push({
          role: 'assistant',
          content: response.content
        });
        
        // Generate new suggestion chips based on context
        generateSuggestionChips();
      } else {
        // Handle error
        addSystemMessage('Sorry, I encountered an error. Please try again.');
      }
    } catch (error) {
      console.error('Error processing message:', error);
      removeTypingIndicator();
      addSystemMessage(`Error: ${error.message || 'Failed to get response'}`);
    } finally {
      // Reset processing state
      isProcessing = false;
      if (userInput.value.trim().length > 0) {
        sendButton.classList.remove('disabled');
      }
    }
  }
  
  // Fetch response from OpenRouter API via our backend proxy
  async function fetchChatResponse(messagesHistory) {
    try {
      showToast('Sending request...', 1000);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messagesHistory,
          model: DEFAULT_MODEL
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }
      
      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message;
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('API call error:', error);
      // For demo, fall back to mock response
      return mockAPIResponse(messagesHistory);
    }
  }
  
  // Mock API response (for demo or when API key is not available)
  function mockAPIResponse(messagesHistory) {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        const lastMessage = messagesHistory[messagesHistory.length - 1].content;
        
        let responseContent = '';
        
        if (lastMessage.toLowerCase().includes('trending')) {
          responseContent = "Based on recent data, the top trending topics today include:\n\n1. **AI-driven climate solutions** - New research showing how AI can optimize renewable energy grids\n\n2. **Space tourism developments** - Recent announcements about civilian space flights\n\n3. **Novel protein structures** - Breakthroughs in protein folding leading to new drug discoveries\n\n4. **Decentralized finance evolution** - New protocols gaining adoption in the DeFi space\n\n5. **Immersive AR experiences** - New applications combining AR with spatial computing";
        } else if (lastMessage.toLowerCase().includes('summarize')) {
          responseContent = "**Article Summary:**\n\nThe article discusses the growing integration of artificial intelligence in healthcare diagnostics. Key points include:\n\n- AI systems now achieving 97% accuracy in identifying certain conditions from medical imaging\n- Reduction in diagnostic wait times by up to 60% in pilot programs\n- Concerns about data privacy and the need for human oversight\n- Cost benefits estimated at $15-20 billion annually in the US healthcare system\n- The importance of diverse training data to prevent algorithmic bias\n\nThe author concludes that while AI won't replace healthcare professionals, it will significantly augment their capabilities and improve patient outcomes.";
        } else if (lastMessage.toLowerCase().includes('sushi') || lastMessage.toLowerCase().includes('la')) {
          responseContent = "Here are the best sushi restaurants in LA according to recent reviews and ratings:\n\n1. **Sushi Ginza Onodera** - High-end omakase experience with fish imported from Japan\n   - Location: West Hollywood\n   - Price: $$$$\n\n2. **Q Sushi** - Authentic Edomae-style sushi in downtown\n   - Location: Downtown LA\n   - Price: $$$$\n\n3. **Sushi Note** - Wine bar and sushi counter with innovative pairings\n   - Location: Sherman Oaks\n   - Price: $$$\n\n4. **Sugarfish** - Consistent quality with their famous 'Trust Me' menu\n   - Multiple locations\n   - Price: $$$\n\n5. **KazuNori** - Specializing in handrolls, from the Sugarfish team\n   - Location: Downtown LA\n   - Price: $$";
        } else {
          responseContent = "I'm happy to help with that. Could you provide more details about what you're looking for? I can provide information on current events, explain complex topics, summarize articles, offer recommendations, and answer many other types of questions.";
        }
        
        resolve({
          role: 'assistant',
          content: responseContent
        });
      }, 1500); // Simulate network delay
    });
  }
  
  // Add a system message to the chat
  function addSystemMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.className = 'system-message';
    messageElement.innerText = text;
    
    chatContainer.appendChild(messageElement);
    scrollToBottom();
  }
  
  // Add a message to the chat
  function addMessageToChat(text, type) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Process markdown-like formatting
    let formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/\n\n/g, '<br><br>') // Line breaks
      .replace(/\n/g, '<br>'); // Line breaks
    
    // Process lists
    formattedText = formattedText
      .replace(/(\d+\. )(.*?)(<br>|$)/g, '<div class="list-item">$1$2</div>$3')
      .replace(/(\- )(.*?)(<br>|$)/g, '<div class="list-item">•&nbsp;$2</div>$3');
    
    messageContent.innerHTML = formattedText;
    messageElement.appendChild(messageContent);
    
    chatContainer.appendChild(messageElement);
    scrollToBottom();
  }
  
  // Show typing indicator
  function showTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.id = 'typingIndicator';
    
    const loadingDots = document.createElement('div');
    loadingDots.className = 'loading-dots';
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      loadingDots.appendChild(dot);
    }
    
    typingIndicator.appendChild(loadingDots);
    chatContainer.appendChild(typingIndicator);
    scrollToBottom();
  }
  
  // Remove typing indicator
  function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }
  
  // Scroll to the bottom of the chat
  function scrollToBottom() {
    setTimeout(() => {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100);
  }
  
  // Update suggestion chips
  function updateSuggestionChips(suggestions) {
    suggestionChips.innerHTML = '';
    
    suggestions.forEach(suggestion => {
      const chip = document.createElement('button');
      chip.className = 'suggestion-chip';
      chip.innerText = suggestion;
      chip.dataset.prompt = suggestion;
      suggestionChips.appendChild(chip);
    });
  }
  
  // Generate contextual suggestion chips based on conversation
  function generateSuggestionChips() {
    // In a real app, you might want to generate these dynamically
    // based on the conversation context
    const suggestions = [
      "Tell me more about that",
      "Can you explain it simply?",
      "What are the alternatives?"
    ];
    
    updateSuggestionChips(suggestions);
  }
  
  // Show toast notification
  function showToast(message, duration = 3000) {
    // Remove existing toast if present
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
      existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerText = message;
    
    document.body.appendChild(toast);
    
    // Remove toast after duration
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, duration);
  }
  
  // Start a new conversation
  function startNewConversation() {
    // Reset conversation history
    messages = [];
    currentConversationId = Date.now().toString();
    
    // Clear chat UI
    chatContainer.innerHTML = '';
    
    // Add welcome message
    addSystemMessage("How can I help you today?");
    
    // Reset suggestions
    updateSuggestionChips(defaultPrompts);
    
    // Focus input
    userInput.focus();
  }
  
  // Initialize the app
  init();
});