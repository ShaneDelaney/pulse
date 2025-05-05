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
        title: "Sinder VTuber Controversy",
        context: "VTuber Sinder faced backlash over alleged manipulation and slander within the community, leading to widespread discussions about creator accountability.",
        month: "April 2025",
        origin: "Twitch, Twitter, Reddit"
    },
    {
        title: "KATSEYE's Gnarly Release",
        context: "The girl group KATSEYE dropped their chaotic and energetic single 'Gnarly,' marking a new era in their musical journey.",
        month: "April 2025",
        origin: "Spotify, YouTube, TikTok"
    },
    {
        title: "ChatGPT's Over-Niceness Rollback",
        context: "OpenAI reverted a ChatGPT update after users reported the AI was excessively complimentary, sparking a wave of memes and discussions.",
        month: "April 2025",
        origin: "Reddit, Twitter, Tech Blogs"
    },
    {
        title: "Italian Brainrot Phenomenon",
        context: "A surreal meme trend featuring AI-generated characters with faux-Italian names and accents, captivating Gen Z and Gen Alpha audiences.",
        month: "January-April 2025",
        origin: "TikTok, Instagram"
    },
    {
        title: "Jaws Theme Resurgence",
        context: "TikTok users revived the classic 'Jaws' theme, creating humorous videos of people circling like sharks, leading up to the film's 50th anniversary.",
        month: "April 2025",
        origin: "TikTok, X, Reddit"
    },
    {
        title: "Lorde's Virgin Album Announcement",
        context: "Lorde announced her fourth studio album, 'Virgin,' described as emotionally raw and transparent, set for a June release.",
        month: "April 2025",
        origin: "Pitchfork, Twitter, Music Blogs"
    },
    {
        title: "Phonk Music's Mainstream Breakthrough",
        context: "Phonk, a subgenre blending Memphis rap and lo-fi aesthetics, gained massive popularity, dominating TikTok playlists and gym sessions.",
        month: "Early 2025",
        origin: "TikTok, Spotify"
    },
    {
        title: "Beyoncé's Cowboy Carter Tour Kickoff",
        context: "Beyoncé launched her 'Cowboy Carter' tour, blending country and R&B, with a grand opening in Inglewood, California.",
        month: "April 28, 2025",
        origin: "SoFi Stadium, Inglewood"
    },
    {
        title: "Sinners Film's Box Office Success",
        context: "Directed by Ryan Coogler and starring Michael B. Jordan, 'Sinners' became a surprise hit, grossing over $175 million globally.",
        month: "April 2025",
        origin: "Cinemas Worldwide"
    },
    {
        title: "James Charles' Prom Makeup Tutorial",
        context: "James Charles released a viral prom makeup tutorial, offering tips and tricks that resonated with high schoolers nationwide.",
        month: "April 2025",
        origin: "YouTube, TikTok"
    },
    {
        title: "Oh Who Is You Meme",
        context: "A viral TikTok soundbite used to humorously call out unexpected or audacious behavior, often accompanied by exaggerated reactions.",
        month: "March 2025",
        origin: "TikTok"
    },
    {
        title: "You Handled It So Well Sarcasm",
        context: "A sarcastic phrase employed to mock overreactions or dramatic responses, becoming a staple in reaction videos and commentaries.",
        month: "April 2025",
        origin: "TikTok, Twitter"
    },
    {
        title: "Imagine Not Liking Me Confidence Trend",
        context: "A self-assured statement turned meme, used to showcase personal achievements or glow-ups, often in a humorous context.",
        month: "April 2025",
        origin: "Instagram, TikTok"
    },
    {
        title: "Graduation Season Tips & Memes",
        context: "A surge of content offering advice for post-grad life, interspersed with memes about the uncertainties of adulthood.",
        month: "May 2025",
        origin: "TikTok, Reddit"
    },
    {
        title: "Butterfly Effect Reflection Posts",
        context: "Users share pivotal moments that led to significant life changes, emphasizing the impact of small decisions.",
        month: "April-May 2025",
        origin: "Instagram, Twitter"
    },
    {
        title: "The Photo I Hesitated to Post Challenge",
        context: "A trend encouraging users to share vulnerable or previously withheld photos, promoting authenticity and self-acceptance.",
        month: "May 2025",
        origin: "Instagram, TikTok"
    },
    {
        title: "Jessie Intro Parodies",
        context: "Creative reinterpretations of the Disney Channel's 'Jessie' theme song, often used to introduce personal stories or skits.",
        month: "April 2025",
        origin: "TikTok"
    },
    {
        title: "Where's Your Head At UFC Remix",
        context: "A mashup of Basement Jaxx's song with UFC fight clips, creating a high-energy meme format for various intense scenarios.",
        month: "April 2025",
        origin: "TikTok, YouTube"
    },
    {
        title: "Judas New Choreography Challenge",
        context: "A resurgence of Lady Gaga's 'Judas' with new dance routines, sparking widespread participation in dance challenges.",
        month: "April 2025",
        origin: "TikTok"
    },
    {
        title: "Summer 2025 Aesthetic Trends",
        context: "A blend of nostalgic and futuristic fashion styles, with influencers showcasing unique summer looks and accessories.",
        month: "May 2025",
        origin: "Instagram, TikTok"
    },
    {
        title: "Perhaps Not Polite Rejection Meme",
        context: "A humorous way to decline offers or ideas, often used in memes to depict gentle refusals.",
        month: "April 2025",
        origin: "Twitter, Reddit"
    },
    {
        title: "Walking Past My Dog Reaction Videos",
        context: "Owners film their dogs' reactions as they walk past them, capturing humorous and heartwarming responses.",
        month: "April 2025",
        origin: "TikTok"
    },
    {
        title: "Expedition 33 Game Release Hype",
        context: "Anticipation builds for the release of 'Expedition 33,' a sci-fi adventure game praised for its immersive storytelling.",
        month: "May 2025",
        origin: "Gaming forums, YouTube"
    },
    {
        title: "1 Gorilla vs. 100 Men Debate",
        context: "A hypothetical battle scenario sparks debates and memes about strategy and outcomes.",
        month: "April 2025",
        origin: "Reddit, Twitter"
    },
    {
        title: "Taurus Season Celebrations",
        context: "Content celebrating Taurus traits, including memes, horoscopes, and birthday shoutouts.",
        month: "April-May 2025",
        origin: "Instagram, TikTok"
    },
    {
        title: "You Season 5 Release Discussions",
        context: "Fans dissect plot twists and character developments from the latest season of the thriller series 'You.'",
        month: "April 2025",
        origin: "Netflix, Reddit"
    },
    {
        title: "I'm So Hungry I Could Eat... Fill-in-the-Blank Meme",
        context: "A humorous meme format where users exaggerate hunger levels with absurd or unexpected completions.",
        month: "April 2025",
        origin: "Twitter, TikTok"
    }
];

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded");
    
    // Get DOM elements
    const trendButton = document.getElementById("trendButton");
    const buttonText = trendButton.querySelector(".button-text");
    const trendCard = document.getElementById("trendCard");
    const idleMessage = document.getElementById("idleMessage");
    const refreshLink = document.getElementById("refreshLink");
    
    // Add refresh functionality to the PULSE logo
    refreshLink.addEventListener("click", function() {
        window.location.reload();
    });
    
    let isFirstClick = true;
    let idleTimer;
    let userInteracted = false;
    
    // Track recently shown trends
    let recentTrends = [];
    const maxRecentTrends = 5;
    
    // Add event listeners
    trendButton.addEventListener("click", function() {
        console.log("Button clicked");
        userInteracted = true;
        
        if (idleMessage.classList.contains("visible")) {
            idleMessage.classList.remove("visible");
            idleMessage.classList.add("hidden");
        }
        
        showRandomTrend();
        
        // Change button text after first click
        if (isFirstClick) {
            isFirstClick = false;
            buttonText.textContent = "🔁 HIT ME AGAIN";
        }
        
        // Reset idle timer
        resetIdleTimer();
    });
    
    // Function to get a non-repeating random trend
    function getNonRepeatingTrend() {
        // If we have fewer than 6 total trends, handle differently
        if (trendsData.length <= maxRecentTrends + 1) {
            // If we've shown all trends, reset the recent list
            if (recentTrends.length >= trendsData.length) {
                // Keep only the most recent trend to avoid immediate repeat
                recentTrends = recentTrends.slice(-1);
            }
            
            // Find available trends (those not in recent list)
            const availableTrends = trendsData.filter(trend => 
                !recentTrends.some(recent => recent.title === trend.title)
            );
            
            // If no available trends, use the oldest in our recent list
            if (availableTrends.length === 0) {
                // Remove oldest trend from recent list
                const oldestTrend = recentTrends.shift();
                return oldestTrend;
            }
            
            // Return a random available trend
            return availableTrends[Math.floor(Math.random() * availableTrends.length)];
        } 
        // Normal case: we have more than 6 trends total
        else {
            // Get indices of recent trends
            const recentIndices = recentTrends.map(trend => 
                trendsData.findIndex(t => t.title === trend.title)
            );
            
            // Filter out recent indices
            let availableIndices = [];
            for (let i = 0; i < trendsData.length; i++) {
                if (!recentIndices.includes(i)) {
                    availableIndices.push(i);
                }
            }
            
            // Get random index from available indices
            const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
            return trendsData[randomIndex];
        }
    }
    
    // Function to show a random trend
    function showRandomTrend() {
        console.log("showRandomTrend function called");
        
        // Hide the card first if it's the first click
        if (trendCard.classList.contains("hidden")) {
            trendCard.classList.remove("hidden");
        } else {
            // Fade out effect
            trendCard.classList.remove("visible");
        }
        
        // Also hide the elaboration interface
        const trendElaboration = document.getElementById('trendElaboration');
        trendElaboration.classList.remove("visible");
        trendElaboration.classList.add("hidden");
        
        setTimeout(function() {
            // Get non-repeating random trend
            const randomTrend = getNonRepeatingTrend();
            console.log("Selected trend:", randomTrend);
            
            // Add to recent trends
            recentTrends.push(randomTrend);
            
            // Keep only the most recent 5
            if (recentTrends.length > maxRecentTrends) {
                recentTrends.shift();
            }
            
            console.log("Recent trends:", recentTrends.map(t => t.title));
            
            // Update content
            document.getElementById("trendTitle").textContent = randomTrend.title;
            document.getElementById("trendContext").textContent = randomTrend.context;
            document.getElementById("trendMonth").textContent = randomTrend.month;
            document.getElementById("trendOrigin").textContent = randomTrend.origin;
            
            // Fade in effect
            trendCard.classList.add("visible");
            
            // Show elaboration interface
            elaborationSystem.showElaborationInterface(randomTrend);
        }, 400);
    }
    
    // Function to set up idle timer
    function resetIdleTimer() {
        clearTimeout(idleTimer);
        
        // Set up new idle timer (5 seconds)
        idleTimer = setTimeout(function() {
            if (!userInteracted) {
                // Show idle message
                idleMessage.classList.remove("hidden");
                idleMessage.classList.add("visible");
                
                // Show a random trend after a short delay
                setTimeout(function() {
                    showRandomTrend();
                    
                    // Change button text if it's still the first time
                    if (isFirstClick) {
                        isFirstClick = false;
                        buttonText.textContent = "🔁 HIT ME AGAIN";
                    }
                }, 1500);
            }
            userInteracted = false;
        }, 5000);
    }
    
    // Initialize idle timer
    resetIdleTimer();
});

// AI Elaboration System
function initializeElaborationSystem() {
  const chatInput = document.getElementById('chatInput');
  const sendButton = document.getElementById('sendQuestion');
  const chatMessages = document.getElementById('chatMessages');
  const trendElaboration = document.getElementById('trendElaboration');
  const suggestionChips = document.querySelectorAll('.suggestion-chip');
  
  let currentTrend = null;
  
  // Show elaboration interface after trend is displayed
  function showElaborationInterface(trend) {
    currentTrend = trend;
    
    // Clear previous messages
    chatMessages.innerHTML = '';
    
    // Show the interface with delay
    setTimeout(() => {
      trendElaboration.classList.remove('hidden');
      setTimeout(() => {
        trendElaboration.classList.add('visible');
      }, 100);
    }, 800);
  }
  
  // Add event listeners
  sendButton.addEventListener('click', () => {
    const question = chatInput.value.trim();
    if (question) {
      askQuestion(question);
      chatInput.value = '';
    }
  });
  
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const question = chatInput.value.trim();
      if (question) {
        askQuestion(question);
        chatInput.value = '';
      }
    }
  });
  
  // Add event listeners to suggestion chips
  suggestionChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const question = chip.dataset.question;
      askQuestion(question);
    });
  });
  
  // Function to ask a question
  function askQuestion(question) {
    // Add user message to chat
    addMessage(question, 'user');
    
    // Get AI response
    getAIResponse(question, currentTrend)
      .then(response => {
        // Add AI response to chat
        addMessage(response, 'ai');
      })
      .catch(error => {
        console.error('Error getting AI response:', error);
        addMessage('Sorry, I had trouble answering that question. Please try again.', 'ai');
      });
  }
  
  // Function to add a message to the chat
  function addMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    
    // Process text for any video embeds
    if (sender === 'ai' && text.includes('[VIDEO]')) {
      // Extract video content
      const parts = text.split('[VIDEO]');
      messageElement.innerHTML = parts[0];
      
      // Create video embed if present
      if (parts.length > 1 && parts[1].includes('youtube.com')) {
        const videoUrl = parts[1].trim();
        const videoEmbed = document.createElement('div');
        videoEmbed.classList.add('video-embed');
        videoEmbed.innerHTML = `
          <iframe 
            width="100%" 
            height="200" 
            src="${videoUrl.replace('watch?v=', 'embed/')}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        `;
        messageElement.appendChild(videoEmbed);
        
        // Add any remaining text
        if (parts.length > 2) {
          const remainingText = document.createElement('p');
          remainingText.textContent = parts.slice(2).join('');
          messageElement.appendChild(remainingText);
        }
      } else {
        messageElement.textContent = text;
      }
    } else {
      messageElement.textContent = text;
    }
    
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Function to get AI response (real API implementation)
  async function getAIResponse(question, trend) {
    try {
      // Show loading indicator
      const loadingMessage = document.createElement('div');
      loadingMessage.classList.add('message', 'ai-message', 'loading-message');
      loadingMessage.textContent = 'Thinking...';
      chatMessages.appendChild(loadingMessage);
      
      // Prepare the data to send to your API
      const requestData = {
        question: question,
        trend: {
          title: trend.title,
          context: trend.context,
          month: trend.month,
          origin: trend.origin
        }
      };
      
      // Try to call the real AI API first
      try {
        const response = await fetch('http://localhost:3000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        });
        
        // If successful, use the real AI response
        if (response.ok) {
          const data = await response.json();
          
          // Remove loading indicator
          const loadingElement = document.querySelector('.loading-message');
          if (loadingElement) {
            chatMessages.removeChild(loadingElement);
          }
          
          return data.response;
        }
        
        // If real API fails, fall back to mock API
        throw new Error('Real API failed, falling back to mock');
      } catch (realApiError) {
        console.warn('Falling back to mock API:', realApiError);
        
        // Call the mock API endpoint as fallback
        const mockResponse = await fetch('http://localhost:3000/api/chat/mock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestData)
        });
        
        if (!mockResponse.ok) {
          throw new Error(`Mock API error: ${mockResponse.status}`);
        }
        
        const mockData = await mockResponse.json();
        
        // Remove loading indicator
        const loadingElement = document.querySelector('.loading-message');
        if (loadingElement) {
          chatMessages.removeChild(loadingElement);
        }
        
        return mockData.response;
      }
    } catch (error) {
      console.error('Error fetching AI response:', error);
      
      // Remove loading indicator
      const loadingElement = document.querySelector('.loading-message');
      if (loadingElement) {
        chatMessages.removeChild(loadingElement);
      }
      
      return 'Sorry, I encountered an error while processing your question. Please try again later.';
    }
  }
  
  // Return public methods
  return {
    showElaborationInterface
  };
}

// Modify your showRandomTrend function to include the elaboration system
// First, initialize the elaboration system
const elaborationSystem = initializeElaborationSystem(); 