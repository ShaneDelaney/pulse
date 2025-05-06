document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const welcomeScreen = document.getElementById('welcomeScreen');
  const showTrendBtn = document.getElementById('showTrendBtn');
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
    showTrendBtn.addEventListener('click', showRandomTrend);
    newTrendBtn.addEventListener('click', showRandomTrend);
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
  
  // Show welcome screen
  function showWelcomeScreen() {
    // Show welcome screen, hide trend card and controls
    welcomeScreen.classList.remove('hidden');
    trendCardContainer.classList.add('hidden');
    controls.classList.add('hidden');
    
    // Clear any existing trend card
    trendCardContainer.innerHTML = '';
  }
  
  // Show a random trend card
  function showRandomTrend() {
    if (trendsData.length === 0) {
      showErrorMessage('No trend data available.');
      return;
    }
    
    // Hide welcome screen, show trend card container and controls
    welcomeScreen.classList.add('hidden');
    trendCardContainer.classList.remove('hidden');
    controls.classList.remove('hidden');
    
    // Get a random trend that hasn't been recently displayed
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * trendsData.length);
    } while (previousTrends.has(newIndex) && previousTrends.size < trendsData.length - 1);
    
    // Update tracking variables
    currentTrendIndex = newIndex;
    previousTrends.add(newIndex);
    
    // Keep previousTrends set to a reasonable size
    if (previousTrends.size > Math.min(5, trendsData.length - 1)) {
      // Remove the oldest added trend (convert to array, remove first item, convert back to set)
      const tempArr = Array.from(previousTrends);
      tempArr.shift();
      previousTrends = new Set(tempArr);
    }
    
    // Display the selected trend
    displayTrendCard(trendsData[currentTrendIndex]);
  }
  
  // Display a trend card with the given data
  function displayTrendCard(trendData) {
    // Clear existing content
    trendCardContainer.innerHTML = '';
    
    // Clone the template
    const trendCard = trendCardTemplate.content.cloneNode(true);
    
    // Populate the card with data
    trendCard.querySelector('.trend-title').textContent = trendData.title;
    
    // Create hashtags
    const hashtagsContainer = trendCard.querySelector('.trend-hashtags');
    trendData.hashtags.forEach(hashtag => {
      const hashtagElement = document.createElement('span');
      hashtagElement.className = 'trend-hashtag';
      hashtagElement.textContent = hashtag;
      hashtagsContainer.appendChild(hashtagElement);
    });
    
    // Set context, origin, and example
    trendCard.querySelector('.trend-context').textContent = trendData.context;
    trendCard.querySelector('.trend-origin').textContent = trendData.origin || 'Unknown';
    
    // Example might be a URL or text
    const exampleElement = trendCard.querySelector('.trend-example');
    if (trendData.example.startsWith('http')) {
      const link = document.createElement('a');
      link.href = trendData.example;
      link.textContent = 'View example';
      link.className = 'media-link';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      exampleElement.appendChild(link);
    } else {
      exampleElement.textContent = trendData.example;
    }
    
    // Add the card to the container
    trendCardContainer.appendChild(trendCard);
    
    // Apply slide-up animation class
    const cardElement = trendCardContainer.querySelector('.trend-card');
    // Force reflow for animation
    void cardElement.offsetWidth;
    
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