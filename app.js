document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const welcomeScreen = document.getElementById('welcomeScreen');
  const aiSearchBtn = document.getElementById('aiSearchBtn');
  const trendCardContainer = document.getElementById('trendCardContainer');
  const trendCardTemplate = document.getElementById('trendCardTemplate');
  const newTrendBtn = document.getElementById('newTrendBtn');
  const backBtn = document.getElementById('backBtn');
  const controls = document.getElementById('controls');
  
  // State variables
  let trendsData = [];
  let currentTrendIndex = -1;
  let previousTrends = new Set(); // Track displayed trends to avoid immediate repetition
  
  // Initialize the app
  function init() {
    // Fetch trends data
    fetchTrendsData();
    
    // Set up event listeners
    aiSearchBtn.addEventListener('click', fetchGeminiTrend);
    newTrendBtn.addEventListener('click', fetchGeminiTrend);
    backBtn.addEventListener('click', showWelcomeScreen);
  }
  
  // Fetch trends data from JSON file
  function fetchTrendsData() {
    fetch('trends.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        trendsData = data;
        console.log('Trends data loaded:', trendsData.length, 'trends');
      })
      .catch(error => {
        console.error('Error fetching trends data:', error);
        showErrorMessage('Failed to load trends data. Please refresh the page.');
      });
  }
  
  // Fetch a trend using Gemini API
  function fetchGeminiTrend() {
    // Show loading state
    welcomeScreen.classList.add('hidden');
    trendCardContainer.classList.remove('hidden');
    controls.classList.remove('hidden');
    
    // Show loading message
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-trend';
    loadingElement.innerHTML = `
      <div class="loading-spinner"></div>
      <p>Searching for trending topics with AI...</p>
    `;
    trendCardContainer.innerHTML = '';
    trendCardContainer.appendChild(loadingElement);
    
    // Generate a random topic from a list of interesting categories
    const topics = [
      'technology', 'social media', 'entertainment', 'business', 
      'fashion', 'health', 'science', 'gaming', 'sustainability', 
      'education', 'politics', 'travel', 'food', 'sports'
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    
    // Call the Gemini API
    fetch('http://localhost:8080/api/gemini-trends', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        topic: randomTopic,
        count: 1
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.trends && data.trends.length > 0) {
        const trend = data.trends[0];
        displayGeminiTrend(trend);
      } else {
        showErrorMessage('No trends found. Please try again later.');
      }
    })
    .catch(error => {
      console.error('Error fetching Gemini trend:', error);
      showErrorMessage('Failed to fetch trend data. Please try again later.');
    });
  }
  
  // Show welcome screen
  function showWelcomeScreen() {
    // Show welcome screen, hide trend card and controls
    welcomeScreen.classList.remove('hidden');
    trendCardContainer.classList.add('hidden');
    controls.classList.add('hidden');
    
    // Clear any existing trend card
    trendCardContainer.innerHTML = '';
  }
  
  // Display a trend from Gemini API
  function displayGeminiTrend(trendData) {
    // Clear container
    trendCardContainer.innerHTML = '';
    
    // Clone the template
    const trendCard = trendCardTemplate.content.cloneNode(true);
    
    // Extract hashtags from the title or category
    const hashtags = [];
    if (trendData.category) {
      hashtags.push(trendData.category.toLowerCase().replace(/\s+/g, ''));
    }
    if (trendData.title) {
      const words = trendData.title.split(' ');
      if (words.length > 1) {
        hashtags.push(words.join('').toLowerCase());
      }
    }
    
    // Populate the card with data
    trendCard.querySelector('.trend-title').textContent = trendData.title;
    
    // Create hashtags
    const hashtagsContainer = trendCard.querySelector('.trend-hashtags');
    hashtags.forEach(hashtag => {
      const hashtagElement = document.createElement('span');
      hashtagElement.className = 'trend-hashtag';
      hashtagElement.textContent = '#' + hashtag;
      hashtagsContainer.appendChild(hashtagElement);
    });
    
    // Set context, origin, and example
    trendCard.querySelector('.trend-context').textContent = trendData.summary;
    trendCard.querySelector('.trend-origin').textContent = trendData.source || 'Various online platforms';
    
    // Example might be a URL or text
    const exampleElement = trendCard.querySelector('.trend-example');
    if (trendData.example && trendData.example.includes('http')) {
      const link = document.createElement('a');
      link.href = trendData.example;
      link.textContent = 'View example';
      link.className = 'media-link';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      exampleElement.appendChild(link);
    } else {
      exampleElement.textContent = trendData.example || 'Examples can be found by searching the hashtags.';
    }
    
    // Add the card to the container
    trendCardContainer.appendChild(trendCard);
    
    // Scroll to top of container if needed
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  
  // Show error message
  function showErrorMessage(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    // Clear container and add error
    trendCardContainer.innerHTML = '';
    trendCardContainer.appendChild(errorElement);
    
    // Show container and controls
    trendCardContainer.classList.remove('hidden');
    controls.classList.remove('hidden');
    welcomeScreen.classList.add('hidden');
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
  
  // Initialize the app
  init();
});