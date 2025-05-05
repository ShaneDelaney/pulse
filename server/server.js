require('dotenv').config(); // For loading environment variables
const express = require('express');
const cors = require('cors');
const { Anthropic } = require('@anthropic-ai/sdk');
const axios = require('axios');
const app = express();

// Initialize Anthropic with API key from environment variable
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'sk-ant-dummy-key',
});

// For web search functionality (using SerpAPI or similar)
const SEARCH_API_KEY = process.env.SEARCH_API_KEY || 'dummy_key';
const RESPONSE_MODE = process.env.RESPONSE_MODE || 'mock'; // 'mock' or 'api'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const USE_OPENAI = OPENAI_API_KEY && OPENAI_API_KEY.length > 0;
const USE_OPENROUTER = OPENROUTER_API_KEY && OPENROUTER_API_KEY.length > 0;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Add new endpoint for trend responses using OpenRouter
app.post('/api/trend', async (req, res) => {
  try {
    const { userInput } = req.body;
    
    if (!userInput) {
      return res.status(400).json({ error: 'User input is required' });
    }
    
    console.log('Trend request received:', userInput);
    
    if (USE_OPENROUTER) {
      const response = await fetchTrendResponse(userInput);
      return res.json({ response });
    } else {
      console.log('Falling back to mock trend response');
      return res.json({ response: `Here's what's trending about "${userInput}": This is a mock response since OpenRouter API key is not configured.` });
    }
  } catch (error) {
    console.error('Error in trend API:', error.message);
    res.status(500).json({ 
      error: 'Failed to get trend response', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Function to fetch trend response from OpenRouter
async function fetchTrendResponse(userInput) {
  try {
    console.log('Sending request to OpenRouter API...');
    console.log('Request body:', JSON.stringify({
      model: "anthropic/claude-3-opus-20240229",
      messages: [{ role: "user", content: userInput }],
      max_tokens: 500
    }));
    
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: "anthropic/claude-3-opus-20240229",
      messages: [{ role: "user", content: userInput }],
      max_tokens: 500
    }, {
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://trend-explorer.com",
        "X-Title": "Trend Explorer"
      }
    });
    
    console.log('Raw API response:', JSON.stringify(response.data));
    
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Invalid response structure from OpenRouter API');
    }
  } catch (error) {
    console.error('OpenRouter API error:', error.message);
    if (error.response && error.response.data) {
      console.error('Error details:', error.response.data);
    } else {
      console.error('No detailed error response available');
    }
    throw new Error(`OpenRouter API error: ${error.message}`);
  }
}

// Enhanced AI chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    // If in mock mode, redirect to mock endpoint
    if (RESPONSE_MODE === 'mock') {
      return handleMockResponse(req, res);
    }
    
    const { question, trend, context = [] } = req.body;
    
    // Determine if we need to search the web
    const needsWebSearch = 
      question.toLowerCase().includes('latest') || 
      question.toLowerCase().includes('recent') || 
      question.toLowerCase().includes('news') ||
      question.toLowerCase().includes('search');
    
    let webSearchResults = [];
    
    // If we need fresh information, perform a web search
    if (needsWebSearch) {
      try {
        webSearchResults = await performWebSearch(question);
      } catch (searchError) {
        console.error('Web search error:', searchError);
        // Continue without search results if there's an error
      }
    }
    
    // Create a system prompt that helps the AI understand its role
    const systemPrompt = `
      You are an AI assistant for a trend discovery app called PULSE.
      You specialize in explaining internet trends, memes, and cultural phenomena.
      
      When responding about trends:
      - Be extremely concise and efficient with your explanations (50-150 words max)
      - Use a conversational, slightly playful tone
      - Get straight to the point without unnecessary introductions
      - If asked for examples and you know of relevant videos, include YouTube links in this format: [VIDEO]https://www.youtube.com/watch?v=VIDEO_ID
      - Focus on factual information about the trend
      - Avoid making up specific details you're unsure about
      
      ${trend.title ? `
      The user is asking about this trend:
      Title: ${trend.title}
      Description: ${trend.context}
      When: ${trend.month}
      Where: ${trend.origin}
      ` : ''}
      
      ${webSearchResults.length > 0 ? `
      Here are some web search results that might be helpful for answering the query:
      ${webSearchResults.map((result, i) => 
        `[${i+1}] Title: ${result.title}
        URL: ${result.link}
        Snippet: ${result.snippet}`
      ).join('\n\n')}
      
      If the web search results are relevant to the query, incorporate this information in your response. 
      When using information from search results, you can format them as:
      [WEB_RESULT]
      <h3 class="web-result-title">Result Title</h3>
      <div class="web-result-url">source.com</div>
      <p class="web-result-snippet">The relevant information from the snippet...</p>
      [/WEB_RESULT]
      
      Use 1-3 of these formatted results if they're directly relevant, otherwise don't include them.
      ` : ''}
    `;
    
    // Convert context to the format expected by the AI
    const messages = context.map(item => ({
      role: item.role,
      content: item.content
    }));
    
    // Add the current question
    messages.push({
      role: "user",
      content: question
    });
    
    let aiResponse;
    
    // Use OpenAI if available, otherwise fall back to Anthropic
    if (USE_OPENAI) {
      console.log('Sending request to OpenAI API...');
      
      // Prepare messages for OpenAI format
      const openaiMessages = [
        {
          role: "system",
          content: systemPrompt
        },
        ...messages
      ];
      
      // Call the OpenAI API
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-4-turbo",
        messages: openaiMessages,
        max_tokens: 250,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.2
      }, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      aiResponse = response.data.choices[0].message.content;
      console.log('Received response from OpenAI API');
    } else {
      console.log('Sending request to Anthropic API...');
      
      // Call the Anthropic API
      const completion = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 800,
        system: systemPrompt,
        messages: messages
      });
      
      // Extract the response
      aiResponse = completion.content[0].text;
      console.log('Received response from Anthropic API');
    }
    
    // Send the response back to the client
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error calling AI API:', error);
    
    // Fall back to mock response if API call fails
    console.log('Falling back to mock response...');
    handleMockResponse(req, res);
  }
});

// Handle mock responses
function handleMockResponse(req, res) {
  const { question, trend = {}, context = [] } = req.body;
  
  console.log('Using mock response for:', question);
  
  // Simulate processing delay
  setTimeout(() => {
    // Generate a mock response
    const lowerQuestion = question.toLowerCase();
    let response;
    
    if (lowerQuestion.includes('example') || lowerQuestion.includes('show me')) {
      // Return examples with video embeds when available
      if (trend && trend.title) {
        switch(trend.title) {
          case "POV: You're Being Mugged Meme":
            response = "Here's a popular example of the mugging POV trend: [VIDEO]https://www.youtube.com/watch?v=dQw4w9WgXcQ These videos typically use humor to subvert expectations about mugging scenarios.";
            break;
          
          case "KATSEYE's Gnarly Release":
            response = "Here's the official music video for KATSEYE's 'Gnarly': [VIDEO]https://www.youtube.com/watch?v=dQw4w9WgXcQ The song's energetic beat and chaotic visuals helped it go viral.";
            break;
            
          default:
            response = `While I don't have a specific video example for "${trend.title}", this trend typically features ${trend.context || 'interesting content'} You can find many examples by searching the hashtag on ${trend.origin ? trend.origin.split(',')[0] : 'social media'}.`;
        }
      } else {
        response = "Here's a trending example: [VIDEO]https://www.youtube.com/watch?v=dQw4w9WgXcQ This type of content has been going viral recently across multiple platforms.";
      }
    } 
    else if (lowerQuestion.includes('why') && lowerQuestion.includes('trend')) {
      if (trend && trend.title) {
        response = `"${trend.title}" gained popularity because it resonated with audiences on ${trend.origin || 'social media'} during ${trend.month || 'recent months'}. ${trend.context || ''} The format was easy to participate in, highly shareable, and came at a time when users were looking for this type of content.`;
      } else {
        response = "Recent trends gain popularity due to their relatability, shareability, and often because they provide a creative outlet for users. The most successful trends are easy to participate in while allowing for personal expression.";
      }
    }
    else if (lowerQuestion.includes('who started') || lowerQuestion.includes('origin')) {
      if (trend && trend.title) {
        response = `While it's difficult to pinpoint exactly who started "${trend.title}", it first gained significant traction on ${trend.origin ? trend.origin.split(',')[0] : 'social media'} in ${trend.month || 'recent months'}. ${trend.context || ''} From there, it quickly spread to other platforms as more creators adapted the format.`;
      } else {
        response = "Most viral trends begin with a small group of creative users, often on TikTok or Instagram, before being amplified by algorithmic recommendations and celebrity participation. The exact origins can be difficult to trace as trends evolve rapidly.";
      }
    }
    else if (lowerQuestion.includes('search') || lowerQuestion.includes('latest')) {
      // Simulate web search results for queries asking for fresh information
      if (trend && trend.title) {
        response = `Based on the latest information I could find online:
        
        [WEB_RESULT]
        <h3 class="web-result-title">Latest Trends Report - June 2025</h3>
        <div class="web-result-url">trendanalysis.com</div>
        <p class="web-result-snippet">${trend.title} continues to evolve with new creators putting unique spins on the format. The hashtag has now reached over 2 billion views.</p>
        [/WEB_RESULT]
        
        [WEB_RESULT]
        <h3 class="web-result-title">Cultural Impact Study: Viral Phenomena</h3>
        <div class="web-result-url">digitalanthropology.edu</div>
        <p class="web-result-snippet">Researchers note that ${trend.title} represents a significant shift in how content is consumed and shared across generational divides.</p>
        [/WEB_RESULT]
        
        These findings suggest the trend has had staying power beyond initial expectations, likely due to its adaptability and cross-platform appeal.`;
      } else {
        response = `Based on the latest information I could find online:
        
        [WEB_RESULT]
        <h3 class="web-result-title">Latest Social Media Trends - May 2025</h3>
        <div class="web-result-url">digitalpulse.com</div>
        <p class="web-result-snippet">The latest trends include AI-generated dance challenges, seamless reality filters, and sustainability-focused content creation, with Gen Z leading adoption.</p>
        [/WEB_RESULT]
        
        [WEB_RESULT]
        <h3 class="web-result-title">TikTok Trend Report 2025</h3>
        <div class="web-result-url">tiktoktrends.com</div>
        <p class="web-result-snippet">Micro-storytelling formats under 15 seconds are dominating the platform, with audio-reactive AR effects seeing a 300% increase in creator adoption.</p>
        [/WEB_RESULT]
        
        These findings indicate that trends are becoming more technically sophisticated while paradoxically emphasizing authenticity and raw creativity.`;
      }
    }
    else {
      // Generic response for other questions
      if (trend && trend.title) {
        response = `About "${trend.title}": ${trend.context || 'This is a popular trend'} This trend was particularly popular on ${trend.origin || 'social media'} during ${trend.month || 'recent months'}. Is there something specific about it you'd like to know?`;
      } else {
        response = `The latest social media trends include AR filters that react to music, 'day in my life' micro-documentaries, and challenges that showcase unexpected talents. These trends are particularly popular on TikTok and Instagram, with creators finding innovative ways to put their personal spin on viral formats.`;
      }
    }
    
    res.json({ response });
  }, 1000);
}

// Fallback to mock responses - keeping for backward compatibility
app.post('/api/chat/mock', (req, res) => {
  handleMockResponse(req, res);
});

// Perform web search using SerpAPI or similar
async function performWebSearch(query) {
  try {
    // For development only - return mock results to avoid real API calls
    if (!SEARCH_API_KEY || SEARCH_API_KEY === 'dummy_key') {
      return getMockSearchResults(query);
    }
    
    // For production - use actual SerpAPI with your key
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        q: query,
        api_key: SEARCH_API_KEY,
        engine: 'google'
      }
    });
    
    if (response.data && response.data.organic_results) {
      return response.data.organic_results.slice(0, 5); // Return top 5 results
    }
    
    return [];
  } catch (error) {
    console.error('Search API error:', error);
    return [];
  }
}

// Mock search results for development
function getMockSearchResults(query) {
  const cleanQuery = query.toLowerCase();
  
  // Mock data for different types of queries
  if (cleanQuery.includes('tiktok') || cleanQuery.includes('social media')) {
    return [
      {
        title: 'Latest TikTok Trends 2025 - The Digital Pulse',
        link: 'https://digitalpulse.com/tiktok-trends-2025',
        snippet: 'The latest TikTok trends include AI-generated dance challenges, seamless reality filters, and sustainability-focused content creation.'
      },
      {
        title: 'How Virtual Reality Reshapes Social Media Engagement',
        link: 'https://tech-insights.com/vr-social-media',
        snippet: 'Virtual reality meetups on social platforms have increased 300% in 2025, with users spending an average of 45 minutes in immersive social spaces.'
      }
    ];
  } else if (cleanQuery.includes('fashion') || cleanQuery.includes('clothing')) {
    return [
      {
        title: 'Sustainable Fashion Leads 2025 Runway Shows',
        link: 'https://fashionfuture.com/sustainable-2025',
        snippet: 'Recycled materials and zero-waste manufacturing processes dominated fashion weeks globally, with major brands pledging 50% sustainable materials by 2026.'
      },
      {
        title: 'Digital Fashion NFTs Generate $2.3 Billion Market',
        link: 'https://metaverse-style.com/digital-fashion-market',
        snippet: 'Digital-only clothing for avatars and AR experiences has created a thriving market, with luxury brands generating significant revenue from virtual couture.'
      }
    ];
  } else {
    return [
      {
        title: 'Internet Culture Report 2025 - Emerging Trends Analysis',
        link: 'https://trendwatcher.com/internet-culture-2025',
        snippet: 'The latest analysis shows microcultures forming around niche interests, with specialized communities growing 200% faster than mainstream platforms.'
      },
      {
        title: 'How Gen Alpha Is Redefining Digital Entertainment',
        link: 'https://futuremedia.com/gen-alpha-entertainment',
        snippet: 'Interactive storytelling and creator-led content dominates preferences for under-15 audiences, with 78% preferring participatory media experiences.'
      }
    ];
  }
}

// Endpoint to check if the server is running
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'PULSE AI server is running', 
    mode: RESPONSE_MODE
  });
});

// Use environment variable or default to 8080
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`PULSE AI server running at http://localhost:${port} (${RESPONSE_MODE} mode)`);
}); 