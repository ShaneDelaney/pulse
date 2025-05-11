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
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const USE_OPENAI = OPENAI_API_KEY && OPENAI_API_KEY.length > 0;
const USE_OPENROUTER = OPENROUTER_API_KEY && OPENROUTER_API_KEY.length > 0;
const USE_GEMINI = GEMINI_API_KEY && GEMINI_API_KEY.length > 0;

// Configure CORS to allow requests from frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle OPTIONS preflight requests
app.options('*', cors());

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'PULSE AI server is running',
    mode: RESPONSE_MODE
  });
});

// Create a new endpoint for the Perplexity Sonar API via OpenRouter
app.post('/api/sonar', async (req, res) => {
  try {
    const { messages, model = "perplexity/sonar-medium-chat" } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Valid messages array is required' });
    }
    
    console.log('Sonar request received for model:', model);
    
    if (USE_OPENROUTER) {
      const response = await fetchSonarResponse(messages, model);
      return res.json(response);
    } else {
      console.log('Falling back to mock response (OpenRouter API key not configured)');
      return res.json(mockSonarResponse(messages));
    }
  } catch (error) {
    console.error('Error in Sonar API:', error.message);
    res.status(500).json({ 
      error: 'Failed to get response', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Function to fetch response from Perplexity Sonar via OpenRouter
async function fetchSonarResponse(messages, model) {
  try {
    console.log('Sending request to OpenRouter API...');
    console.log('Request body:', JSON.stringify({
      model,
      messages,
      max_tokens: 1024,
      temperature: 0.7
    }));
    
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model,
      messages,
      max_tokens: 1024,
      temperature: 0.7
    }, {
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://sonar-chat.com",
        "X-Title": "Sonar Chat"
      }
    });
    
    console.log('Raw API response structure:', Object.keys(response.data));
    
    return response.data;
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

// Mock Sonar response for testing or when API key is not available
function mockSonarResponse(messages) {
  const lastMessage = messages[messages.length - 1].content;
  
  let responseContent = '';
  
  if (lastMessage.toLowerCase().includes('trending')) {
    responseContent = "Based on recent data, the top trending topics today include:\n\n1. **AI-driven climate solutions** - New research showing how AI can optimize renewable energy grids\n\n2. **Space tourism developments** - Recent announcements about civilian space flights\n\n3. **Novel protein structures** - Breakthroughs in protein folding leading to new drug discoveries\n\n4. **Decentralized finance evolution** - New protocols gaining adoption in the DeFi space\n\n5. **Immersive AR experiences** - New applications combining AR with spatial computing";
  } else if (lastMessage.toLowerCase().includes('summarize')) {
    responseContent = "**Article Summary:**\n\nThe article discusses the growing integration of artificial intelligence in healthcare diagnostics. Key points include:\n\n- AI systems now achieving 97% accuracy in identifying certain conditions from medical imaging\n- Reduction in diagnostic wait times by up to 60% in pilot programs\n- Concerns about data privacy and the need for human oversight\n- Cost benefits estimated at $15-20 billion annually in the US healthcare system\n- The importance of diverse training data to prevent algorithmic bias\n\nThe author concludes that while AI won't replace healthcare professionals, it will significantly augment their capabilities and improve patient outcomes.";
  } else if (lastMessage.toLowerCase().includes('sushi') || lastMessage.includes('la')) {
    responseContent = "Here are the best sushi restaurants in LA according to recent reviews and ratings:\n\n1. **Sushi Ginza Onodera** - High-end omakase experience with fish imported from Japan\n   - Location: West Hollywood\n   - Price: $$$$\n\n2. **Q Sushi** - Authentic Edomae-style sushi in downtown\n   - Location: Downtown LA\n   - Price: $$$$\n\n3. **Sushi Note** - Wine bar and sushi counter with innovative pairings\n   - Location: Sherman Oaks\n   - Price: $$$\n\n4. **Sugarfish** - Consistent quality with their famous 'Trust Me' menu\n   - Multiple locations\n   - Price: $$$\n\n5. **KazuNori** - Specializing in handrolls, from the Sugarfish team\n   - Location: Downtown LA\n   - Price: $$";
  } else {
    responseContent = "I'm happy to help with that. Could you provide more details about what you're looking for? I can provide information on current events, explain complex topics, summarize articles, offer recommendations, and answer many other types of questions.";
  }
  
  return {
    id: `mock-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: "perplexity/sonar-medium-chat-mock",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: responseContent
        },
        finish_reason: "stop"
      }
    ],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    }
  };
}

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
    
    const { question, trend = {}, context = [] } = req.body;
    
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
      
      ${trend && trend.title ? `
      The user is asking about this trend:
      Title: ${trend.title}
      Description: ${trend.context || ''}
      When: ${trend.month || ''}
      Where: ${trend.origin || ''}
      ` : ''}
      
      ${webSearchResults.length > 0 ? `
      Here are some web search results that might be helpful for answering the query:
      ${webSearchResults.map((result, i) => 
        `[${i+1}] Title: ${result.title || ''}
        URL: ${result.link || ''}
        Snippet: ${result.snippet || ''}`
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
      role: item.role || 'user',
      content: item.content || ''
    }));
    
    // Add the current question
    messages.push({
      role: "user",
      content: question || ''
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

// New endpoint for web-enabled GPT to fetch current trends
app.post('/api/web-trends', async (req, res) => {
  try {
    const { topic = 'current trending topics', count = 3 } = req.body;
    
    // Try to use Perplexity API for web trends
    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '';
    
    if (PERPLEXITY_API_KEY && PERPLEXITY_API_KEY.length > 0) {
      console.log(`Using Perplexity API to search for: ${topic}`);
      try {
        const trends = await fetchTrendsWithPerplexity(topic, count);
        return res.json({ trends });
      } catch (perplexityError) {
        console.error('Perplexity API error:', perplexityError.message);
        // Fall through to other methods if Perplexity fails
      }
    }
    
    // Check if OpenAI API is properly configured
    if (!OPENAI_API_KEY || OPENAI_API_KEY.startsWith('sk-or-v1') || OPENAI_API_KEY === 'dummy_key') {
      console.log('OpenAI API key not configured or using incorrect key format, falling back to mock web trends response');
      return res.json({
        trends: getMockWebTrends(topic, count)
      });
    }
    
    console.log(`Web-enabled trend search requested for: ${topic}`);
    
    // Use GPT-4 with web browsing capability - updated to use the correct model name
    const webPrompt = `
      You are a trend researcher for PULSE, a trend discovery application.
      Search the web for the most current ${count} trending topics related to "${topic}".
      For each trend, provide:
      1. Title: A concise name for the trend
      2. Summary: A 2-3 sentence explanation of what it is
      3. Source: Where this trend is most prevalent (platform, community, etc.)
      4. Example: A specific example, link, or reference
      5. Category: Which category this trend belongs to (Technology, Culture, Fashion, etc.)
      
      Format your response as valid JSON in this exact structure:
      {
        "trends": [
          {
            "title": "Trend name",
            "summary": "Brief explanation",
            "source": "Where it's trending",
            "example": "Specific example, preferably with a link if available",
            "category": "Category name"
          }
        ]
      }
    `;
    
    // Call the OpenAI API with web browsing enabled - updated to use the browsing tool properly
    const apiRequest = {
      model: "gpt-4o",  // Updated to use a model that supports browsing
      messages: [
        {
          role: "system",
          content: "You are a helpful trend research assistant with web browsing capability. Always respond with properly formatted JSON."
        },
        {
          role: "user",
          content: webPrompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
      tools: [{ "type": "browsing" }],
      tool_choice: "auto"  // Fixed the format to match OpenAI's API
    };
    
    console.log('Sending request to OpenAI API with the following parameters:', JSON.stringify(apiRequest, null, 2));
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', apiRequest, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Received response from OpenAI API with status:', response.status);
    
    // Handle tool use in the response - this addresses the multi-turn conversation needed for browsing
    let finalContent = '';
    const responseMessage = response.data.choices[0]?.message;
    
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      console.log('OpenAI used browsing tools, processing the results...');
      
      // When the model uses tools, we need to handle the tool outputs and continue the conversation
      const toolCalls = responseMessage.tool_calls;
      const toolResults = [];
      
      // Process each tool call - for web browsing, we simulate successful tool calls
      for (const toolCall of toolCalls) {
        if (toolCall.function.name === 'browsing') {
          const toolArgs = JSON.parse(toolCall.function.arguments);
          toolResults.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: "browsing",
            content: `Successfully retrieved information about trends related to "${toolArgs.query || topic}"`
          });
        }
      }
      
      // Continue the conversation with the tool results
      if (toolResults.length > 0) {
        const followUpResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a helpful trend research assistant with web browsing capability. Always respond with properly formatted JSON."
            },
            {
              role: "user",
              content: webPrompt
            },
            responseMessage,
            ...toolResults,
            {
              role: "user",
              content: "Based on the web search results, please provide the trends in the JSON format I requested."
            }
          ],
          max_tokens: 1500,
          temperature: 0.7
        }, {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        finalContent = followUpResponse.data.choices[0]?.message?.content || '';
      }
    } else {
      // If no tool calls, use the direct response
      finalContent = responseMessage.content || '';
    }
    
    console.log('Processing final response content...');
    
    try {
      // Try to extract JSON from the response if it's embedded in text
      const jsonMatch = finalContent.match(/```json\n([\s\S]*?)\n```/) || 
                     finalContent.match(/{[\s\S]*}/);
                      
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : finalContent;
      console.log('Extracted JSON string:', jsonStr);
      
      const trendsData = JSON.parse(jsonStr);
      
      console.log('Successfully parsed JSON data');
      return res.json(trendsData);
    } catch (parseError) {
      console.error('Error parsing trend data:', parseError);
      console.log('Raw content:', finalContent);
      
      // Fallback to a more forgiving parsing approach
      try {
        // Try to extract just the trends array if the whole JSON is invalid
        const trendsMatch = finalContent.match(/"trends":\s*(\[\s*{[\s\S]*?}\s*\])/);
        if (trendsMatch) {
          const trendsArray = JSON.parse(trendsMatch[1]);
          return res.json({ trends: trendsArray });
        }
      } catch (fallbackError) {
        console.error('Fallback parsing failed:', fallbackError);
      }
      
      // If all parsing fails, return mock data
      console.log('All parsing attempts failed, returning mock data');
      return res.json({
        trends: getMockWebTrends(topic, count)
      });
    }
  } catch (error) {
    console.error('Error in web trends API:', error.message);
    if (error.response) {
      console.error('OpenAI API error details:', error.response.data);
    }
    res.json({
      trends: getMockWebTrends(req.body.topic || 'current trending topics', req.body.count || 3)
    });
  }
});

// Generate mock web trends data for when API is not available
function getMockWebTrends(topic, count) {
  const trendTemplates = [
    {
      title: "AI-Generated Content Ethics",
      summary: "Growing discussions around the ethical implications of AI-generated content, including concerns about misinformation, copyright, and attribution.",
      source: "Twitter, academic forums, tech publications",
      example: "Recent controversy over AI art competitions accepting AI-generated artwork without disclosure: https://example.com/ai-art-controversy",
      category: "Technology"
    },
    {
      title: "Digital Sustainability",
      summary: "Focus on reducing digital carbon footprints through efficient code, sustainable server practices, and energy-conscious digital habits.",
      source: "Tech conferences, GitHub repositories, LinkedIn",
      example: "The Green Software Foundation's latest standards for carbon-efficient applications: https://example.com/green-software",
      category: "Environment"
    },
    {
      title: "Micro-Learning Platforms",
      summary: "The rise of educational platforms offering bite-sized learning modules that can be completed in under 10 minutes. Popular for professional upskilling.",
      source: "TikTok, YouTube Shorts, dedicated apps",
      example: "Byte Academy's 5-minute coding concepts are gaining millions of views: https://example.com/byte-academy",
      category: "Education"
    },
    {
      title: "Virtual Co-Working Spaces",
      summary: "Remote workers joining virtual environments that simulate office atmosphere, complete with background chatter and collaborative spaces.",
      source: "Discord servers, specialized platforms",
      example: "Gather.town's customizable office spaces seeing 200% growth year-over-year: https://example.com/virtual-coworking",
      category: "Work"
    },
    {
      title: "Ephemeral Commerce",
      summary: "Limited-time purchasing windows (sometimes as short as 15 minutes) creating artificial scarcity and driving rapid purchasing decisions.",
      source: "Instagram, specialized retail apps",
      example: "Fashion brand Kairos's 30-minute 'drop windows' consistently selling out inventory: https://example.com/ephemeral-drops",
      category: "Retail"
    }
  ];
  
  // Filter based on topic if relevant
  let filteredTrends = trendTemplates;
  if (topic && topic !== 'current trending topics') {
    const lowerTopic = topic.toLowerCase();
    filteredTrends = trendTemplates.filter(trend => 
      trend.title.toLowerCase().includes(lowerTopic) || 
      trend.summary.toLowerCase().includes(lowerTopic) ||
      trend.category.toLowerCase().includes(lowerTopic)
    );
    
    // If no matches, just return random ones
    if (filteredTrends.length === 0) {
      filteredTrends = trendTemplates;
    }
  }
  
  // Shuffle and take requested number
  const shuffled = filteredTrends.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Handle mock responses
function handleMockResponse(req, res) {
  try {
    const { question, trend = {}, context = [] } = req.body;
    
    console.log('Using mock response for:', question);
  
  // Simulate processing delay
  setTimeout(() => {
      // Generate a mock response
      const lowerQuestion = (question || '').toLowerCase();
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
              response = `While I don't have a specific video example for "${trend.title || 'this trend'}", this trend typically features ${trend.context || 'interesting content'} You can find many examples by searching the hashtag on ${trend.origin ? trend.origin.split(',')[0] : 'social media'}.`;
          }
        } else {
          response = "Here's a trending example: [VIDEO]https://www.youtube.com/watch?v=dQw4w9WgXcQ This type of content has been going viral recently across multiple platforms.";
      }
    } 
    else if (lowerQuestion.includes('why') && lowerQuestion.includes('trend')) {
        if (trend && trend.title) {
          response = `"${trend.title || 'This trend'}" gained popularity because it resonated with audiences on ${trend.origin || 'social media'} during ${trend.month || 'recent months'}. ${trend.context || ''} The format was easy to participate in, highly shareable, and came at a time when users were looking for this type of content.`;
        } else {
          response = "Recent trends gain popularity due to their relatability, shareability, and often because they provide a creative outlet for users. The most successful trends are easy to participate in while allowing for personal expression.";
        }
    }
    else if (lowerQuestion.includes('who started') || lowerQuestion.includes('origin')) {
        if (trend && trend.title) {
          response = `While it's difficult to pinpoint exactly who started "${trend.title || 'this trend'}", it first gained significant traction on ${trend.origin ? trend.origin.split(',')[0] : 'social media'} in ${trend.month || 'recent months'}. ${trend.context || ''} From there, it quickly spread to other platforms as more creators adapted the format.`;
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
          <p class="web-result-snippet">${trend.title || 'This trend'} continues to evolve with new creators putting unique spins on the format. The hashtag has now reached over 2 billion views.</p>
          [/WEB_RESULT]
          
          [WEB_RESULT]
          <h3 class="web-result-title">Cultural Impact Study: Viral Phenomena</h3>
          <div class="web-result-url">digitalanthropology.edu</div>
          <p class="web-result-snippet">Researchers note that ${trend.title || 'this trend'} represents a significant shift in how content is consumed and shared across generational divides.</p>
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
          response = `About "${trend.title || 'this trend'}": ${trend.context || 'This is a popular trend'} This trend was particularly popular on ${trend.origin || 'social media'} during ${trend.month || 'recent months'}. Is there something specific about it you'd like to know?`;
        } else {
          response = `The latest social media trends include AR filters that react to music, 'day in my life' micro-documentaries, and challenges that showcase unexpected talents. These trends are particularly popular on TikTok and Instagram, with creators finding innovative ways to put their personal spin on viral formats.`;
        }
    }
    
    res.json({ response });
  }, 1000);
  } catch (error) {
    console.error('Error in mock response handler:', error);
    res.status(500).json({ 
      error: 'Failed to generate mock response', 
      details: error.message 
    });
  }
}

// Web search function
async function performWebSearch(query) {
  if (SEARCH_API_KEY === 'dummy_key') {
    console.log('Using mock search results for:', query);
    return getMockSearchResults(query);
  }
  
  try {
    console.log('Performing web search for:', query);
    
    // This would be replaced with an actual API call to a search engine API
    // such as SerpAPI, Google Custom Search, or Bing Search
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        q: query,
        api_key: SEARCH_API_KEY,
        engine: 'google',
        num: 5
      }
    });
    
    if (response.data && response.data.organic_results) {
      return response.data.organic_results.map(result => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Search API error:', error);
    return getMockSearchResults(query);
  }
}

// Get mock search results when real search is unavailable
function getMockSearchResults(query) {
  return [
    {
      title: `Latest Info on: ${query}`,
      link: 'https://example.com/article1',
      snippet: `Comprehensive analysis of ${query} showing recent developments and future predictions based on current data trends.`
    },
    {
      title: `${query} - A Deep Dive`,
      link: 'https://example.com/article2',
      snippet: `Experts weigh in on ${query}, offering insights into how this trend is reshaping online discourse and consumer behavior in unexpected ways.`
    },
    {
      title: `Why Everyone is Talking About ${query}`,
      link: 'https://example.com/article3',
      snippet: `The viral phenomenon of ${query} explained - from its origins on TikTok to mainstream adoption and celebrity endorsements.`
    }
  ];
}

// Function to fetch trends using Perplexity API
async function fetchTrendsWithPerplexity(topic, count) {
  try {
    console.log(`Fetching trends from Perplexity for "${topic}"`);
    
    const systemPrompt = "You are a trend researcher for PULSE, a trend discovery application. Always respond in JSON format.";
    
    const userPrompt = `Search the web for the most current ${count} trending topics related to "${topic}".
    For each trend, provide:
    1. Title: A concise name for the trend
    2. Summary: A 2-3 sentence explanation of what it is
    3. Source: Where this trend is most prevalent (platform, community, etc.)
    4. Example: A specific example, link, or reference
    5. Category: Which category this trend belongs to (Technology, Culture, Fashion, etc.)
    
    Format your response as valid JSON in this exact structure:
    {
      "trends": [
        {
          "title": "Trend name",
          "summary": "Brief explanation",
          "source": "Where it's trending",
          "example": "Specific example, preferably with a link if available",
          "category": "Category name"
        }
      ]
    }
    
    Important: Make sure your response is well-formed JSON that can be parsed with JSON.parse().`;
    
    const requestData = {
      model: "sonar",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    };
    
    console.log('Sending request to Perplexity API...');
    
    const response = await axios.post('https://api.perplexity.ai/chat/completions', requestData, {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`, 
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Perplexity response status:', response.status);
    console.log('Perplexity response structure:', Object.keys(response.data));
    
    // Extract content from Perplexity response
    if (response.data.choices && response.data.choices.length > 0 && response.data.choices[0].message) {
      const content = response.data.choices[0].message.content;
      
      // Try to parse JSON from the response content
      try {
        // Check if the content is already JSON or needs extraction
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
        
        const parsedData = JSON.parse(jsonStr);
        console.log('Successfully parsed trend data from Perplexity response');
        
        if (parsedData.trends && Array.isArray(parsedData.trends)) {
          return parsedData.trends;
        } else {
          console.error('Invalid trend data structure from Perplexity');
          throw new Error('Invalid trend data structure');
        }
      } catch (parseError) {
        console.error('Error parsing JSON from Perplexity response:', parseError);
        console.error('Raw content:', content);
        throw new Error('Failed to parse trend data from response');
      }
    } else {
      throw new Error('Invalid response format from Perplexity API');
    }
  } catch (error) {
    console.error('Error fetching trends from Perplexity:', error);
    if (error.response) {
      console.error('Perplexity API error details:', error.response.data);
    }
    throw error;
  }
}

// New endpoint for Gemini API to fetch current trends
app.post('/api/gemini-trends', async (req, res) => {
  const { topic = 'current trending topics', count = 5 } = req.body;
  
  if (process.env.RESPONSE_MODE === 'mock') {
    return res.json({
      trends: getMockGeminiTrends(count)
    });
  }
  
  try {
    // Define the system message and prompt
    const systemMessage = "You are a trend analyzer specializing in identifying current trending topics. Provide concise, factual information about trending topics.";
    
    const prompt = `Identify the top ${count} trending topics related to "${topic}". 
    For each trend, provide:
    1. A title (brief name of the trend)
    2. A short 1-2 sentence summary explaining why it's trending
    3. The category it belongs to (e.g., Technology, Politics, Entertainment, Sports, etc.)
    4. A source (where this trend is most prominent, e.g., Twitter, News, TikTok, Research)
    
    Return ONLY a JSON array with each trend having these properties: title, summary, category, source.`;
    
    // Make the API call to Gemini
    const geminiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiKey) {
      console.error("Missing Gemini API key");
      return res.status(500).json({ error: "API configuration error" });
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: systemMessage + "\n\n" + prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the JSON from the response text
    let trends = [];
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && 
        data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      
      const responseText = data.candidates[0].content.parts[0].text;
      
      // Try to extract JSON from the response
      try {
        // Look for JSON array in the response
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          trends = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: try to parse the entire response
          trends = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error("Error parsing Gemini response as JSON:", parseError);
        console.log("Raw response:", responseText);
        trends = getMockGeminiTrends(count);
      }
    } else {
      console.error("Unexpected Gemini API response format:", data);
      trends = getMockGeminiTrends(count);
    }
    
    return res.json({ trends });
  } catch (error) {
    console.error("Error fetching trends from Gemini:", error);
    
    // Return mock data in case of error
    return res.json({
      trends: getMockGeminiTrends(count)
    });
  }
});

// Mock Gemini trends function
function getMockGeminiTrends(count = 5) {
  const allTrends = [
    {
      title: "Quantum Computing Breakthrough",
      summary: "Scientists achieved a new milestone in quantum error correction, making quantum computers more viable for practical applications.",
      category: "Technology",
      source: "Research Journals"
    },
    {
      title: "Global Climate Summit",
      summary: "World leaders are gathering for an emergency climate summit following recent extreme weather events and concerning climate data.",
      category: "Environment",
      source: "News Media"
    },
    {
      title: "AI-Generated Art Controversy",
      summary: "A major art competition has sparked debate after awarding first prize to an AI-generated piece, raising questions about creativity and authorship.",
      category: "Arts & Culture",
      source: "Social Media"
    },
    {
      title: "Space Tourism Milestone",
      summary: "The first fully civilian orbital mission has successfully completed its journey, marking a major step in commercial space travel.",
      category: "Science & Technology",
      source: "News Media"
    },
    {
      title: "Cryptocurrency Market Shift",
      summary: "A major cryptocurrency has implemented a proof-of-stake system, reducing energy consumption by over 99% and causing market-wide changes.",
      category: "Finance",
      source: "Financial News"
    },
    {
      title: "Novel Antibiotic Discovery",
      summary: "Researchers have discovered a new class of antibiotics effective against drug-resistant bacteria, potentially addressing the growing crisis of antibiotic resistance.",
      category: "Health & Medicine",
      source: "Medical Journals"
    },
    {
      title: "Sustainable Fashion Movement",
      summary: "Major fashion brands are pledging to achieve carbon neutrality and eliminate waste by 2030, transforming industry practices.",
      category: "Fashion & Retail",
      source: "Industry Publications"
    },
    {
      title: "Remote Work Policy Changes",
      summary: "Several major tech companies announced permanent flexible work arrangements, influencing workplace policies across industries.",
      category: "Business",
      source: "Corporate Announcements"
    },
    {
      title: "Hydroponic Farming Expansion",
      summary: "Vertical farming initiatives are expanding in urban areas, promising sustainable local food production with minimal environmental impact.",
      category: "Agriculture",
      source: "Industry Reports"
    },
    {
      title: "Digital Privacy Legislation",
      summary: "A comprehensive data privacy bill is gaining traction, potentially establishing new standards for how companies collect and use personal information.",
      category: "Politics & Policy",
      source: "Legislative News"
    }
  ];

  // Return the requested number of trends
  return allTrends.slice(0, Math.min(count, allTrends.length));
}

// New endpoint for daily trend summaries using OpenAI
app.post('/api/daily-summary', async (req, res) => {
  try {
    const { topics = [], date = new Date().toISOString().split('T')[0] } = req.body;
    
    if (!USE_OPENAI) {
      console.log('OpenAI API key not configured, falling back to mock daily summary');
      return res.json({
        summary: getMockDailySummary(topics, date)
      });
    }
    
    console.log(`Daily trend summary requested for date: ${date}, topics: ${topics.join(', ') || 'all'}`);
    
    // Build prompt for OpenAI
    const topicsStr = topics.length > 0 ? 
      `focusing on these topics: ${topics.join(', ')}` : 
      'covering a diverse range of topics';
    
    const prompt = `Create a daily trend summary for ${date} ${topicsStr}. 
    The summary should include:
    
    1. The top 3-5 trending topics of the day
    2. A brief explanation of why each topic is trending
    3. Key statistics or metrics where relevant
    4. Any notable predictions or forecasts
    
    Format the response in markdown with clear headings and bullet points.
    Keep the total summary under 500 words. Be informative, insightful, and analytical.`;
    
    // Call OpenAI API
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a trend analyst specializing in creating concise, data-driven daily summaries of current trends. Your analysis is based on real-time data and should be insightful, factual, and current. Include quantitative metrics where appropriate."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Extract and return the summary
    const summaryContent = response.data.choices[0]?.message?.content || '';
    
    return res.json({
      summary: summaryContent,
      date: date,
      topics: topics
    });
  } catch (error) {
    console.error('Error generating daily summary:', error);
    if (error.response) {
      console.error('OpenAI API error details:', error.response.data);
    }
    
    // Return mock data on error
    res.json({
      summary: getMockDailySummary(req.body.topics, req.body.date),
      error: error.message
    });
  }
});

// Generate mock daily summary
function getMockDailySummary(topics = [], date = new Date().toISOString().split('T')[0]) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const defaultTopics = [
    {
      name: "Sustainable Technology",
      explanation: "Growing interest in eco-friendly tech solutions as major tech companies announced carbon-neutral targets",
      stats: "43% increase in sustainable tech investments year-over-year"
    },
    {
      name: "Remote Work Innovations",
      explanation: "New collaborative tools and VR office spaces gaining traction as companies finalize hybrid work policies",
      stats: "Virtual office startups saw a 27% funding increase this quarter"
    },
    {
      name: "AI Regulation Developments",
      explanation: "Discussions intensifying around proposed international AI governance frameworks",
      stats: "72% of tech leaders support standardized AI ethics guidelines according to recent surveys"
    },
    {
      name: "Digital Health Platforms",
      explanation: "Telemedicine and health monitoring apps showing continued growth post-pandemic",
      stats: "Monthly active users up 18% across major telehealth platforms"
    }
  ];
  
  // Filter topics if specific ones were requested
  let selectedTopics = defaultTopics;
  if (topics && topics.length > 0) {
    // Simple matching - in a real app, this would be more sophisticated
    const filteredTopics = defaultTopics.filter(topic => 
      topics.some(requestedTopic => 
        topic.name.toLowerCase().includes(requestedTopic.toLowerCase())
      )
    );
    
    // If we found matches, use them, otherwise keep all topics
    if (filteredTopics.length > 0) {
      selectedTopics = filteredTopics;
    }
  }
  
  // Generate markdown summary
  const summary = `
# Daily Trend Summary for ${formattedDate}

## Today's Top Trends

${selectedTopics.map(topic => `
### ${topic.name}
- **Why it's trending**: ${topic.explanation}
- **Key metrics**: ${topic.stats}
`).join('')}

## Outlook

Based on current patterns, we anticipate continued momentum in ${selectedTopics[0].name.toLowerCase()} 
through the end of the quarter. Watch for new developments in ${selectedTopics[1].name.toLowerCase()} 
as major industry players announce their Q2 strategies.

---

*This is a mock summary. Connect your OpenAI API key for real-time trend analysis.*
`;

  return summary.trim();
}

// New endpoint for social media trends using OpenAI
app.post('/api/social-trends', async (req, res) => {
    try {
        const { platform = 'all', count = 5, maxAgeDays = 7 } = req.body;
        
        if (!USE_OPENAI) {
            console.log('OpenAI API key not configured, falling back to mock social trends');
            return res.json(getMockSocialTrends(count, maxAgeDays));
        }
        
        console.log(`Social media trends requested for platform: ${platform}, count: ${count}, maxAgeDays: ${maxAgeDays}`);
        
        // System prompt that instructs the assistant to be a social media trend analyst
        const systemPrompt = `You are a social media trend analyst with access to the latest viral content across all platforms.
                           Your specialty is identifying and explaining current viral social media trends.
                           Focus ONLY on trends that have emerged or gained significant traction WITHIN THE LAST ${maxAgeDays} DAYS.
                           Do not include older trends or general topics.
                           Everything you report must be current and time-sensitive, from the past week at most.`;
                           
        // User prompt that requests the trending topics with specific format instructions
        const userPrompt = `Identify the top ${count} currently viral social media trends${platform !== 'all' ? ` on ${platform}` : ''} that have emerged or gained significant traction ONLY within the past ${maxAgeDays} days.
                         
                         Format your response as a JSON array of objects with the following properties:
                         - title: A catchy, descriptive title for the trend
                         - summary: A brief explanation of what the trend is about
                         - platforms: An array of platforms where this trend is popular
                         - hashtags: An array of relevant hashtags
                         - examples: An array of objects, each with:
                           - text: Description of the example content
                           - url: Link to a representative example (real, functioning URLs)
                         - context: Cultural or historical context that helps explain why this trend is significant
                         - timestamp: The current date in ISO format
                         
                         Only include trends that are genuinely trending RIGHT NOW or within the past ${maxAgeDays} days.
                         Make sure ALL example URLs are real and functional links to actual content.
                         Do NOT generate fake or non-functioning URLs.
                         Return ONLY the JSON data without any explanations.`;
        
        // Make API call to OpenAI
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                max_tokens: 1500,
                temperature: 0.7,
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        // Extract the response content
        const responseContent = response.data.choices[0]?.message?.content || '';
        
        // Parse the JSON from the response
        let trendsData;
        try {
            // Look for JSON array in the response
            const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                trendsData = JSON.parse(jsonMatch[0]);
            } else {
                trendsData = JSON.parse(responseContent);
            }
            
            // Add current timestamp to each trend if not provided
            const now = new Date();
            trendsData = trendsData.map(trend => {
                if (!trend.timestamp) {
                    trend.timestamp = now.toISOString();
                }
                return trend;
            });
            
            // Log for debugging
            console.log(`Returning ${trendsData.length} recent social media trends (last ${maxAgeDays} days).`);
            
        } catch (error) {
            console.error('Error parsing OpenAI response:', error);
            return res.json(getMockSocialTrends(count, maxAgeDays));
        }
        
        res.json(trendsData);
    } catch (error) {
        console.error('Error in /api/social-trends:', error);
        res.json(getMockSocialTrends(count, maxAgeDays));
    }
});

// Get mock social trends with timestamps from the last week
function getMockSocialTrends(count = 5, maxAgeDays = 7) {
    const trends = [
        {
            title: "AI-Generated Art Exhibition Controversy",
            summary: "A major art gallery's decision to feature AI-generated artwork alongside traditional pieces has sparked intense debate in the art community about authorship, creativity, and the future of human artists.",
            platforms: ["Twitter", "Instagram", "Reddit"],
            hashtags: ["#AIArt", "#ArtistVsAI", "#FutureOfCreativity"],
            examples: [
                {
                    text: "Gallery opens 'Collaboration: Human & Machine' exhibition featuring works created with Midjourney and DALL-E",
                    url: "https://www.artnews.com/digital-art-exhibitions"
                },
                {
                    text: "Artists protest outside Metropolitan Museum against AI art inclusion",
                    url: "https://www.nytimes.com/arts/protests"
                }
            ],
            context: "This controversy highlights the growing tension between traditional creative industries and AI advancement. The art world has been particularly affected as generators like Midjourney and DALL-E have become sophisticated enough to create museum-quality images. Many artists fear loss of commissions and devaluation of human creativity, while supporters argue AI tools are simply new mediums for human expression.",
            timestamp: getRandomRecentDate(maxAgeDays).toISOString()
        },
        {
            title: "Viral 'Touch Grass Challenge' Encouraging Digital Detox",
            summary: "A new social media trend called the 'Touch Grass Challenge' has gone viral, encouraging people to disconnect from technology and spend time in nature, documenting their outdoor experiences.",
            platforms: ["TikTok", "Instagram", "Twitter"],
            hashtags: ["#TouchGrassChallenge", "#DigitalDetox", "#NatureReconnect"],
            examples: [
                {
                    text: "Influencers showing before/after mood improvements from spending 24 hours outdoors",
                    url: "https://www.tiktok.com/discover/touchgrasschallenge"
                },
                {
                    text: "Tech CEOs joining the challenge, sharing offline activities with followers",
                    url: "https://www.instagram.com/explore/tags/touchgrasschallenge/"
                }
            ],
            context: "This trend emerges amid growing concern about digital addiction and mental health impacts of constant connectivity. The phrase 'touch grass' began as online slang telling someone they're too obsessed with internet culture and need real-world perspective. The challenge has resonated widely as studies continue to link excessive screen time with anxiety and depression, particularly among younger users.",
            timestamp: getRandomRecentDate(maxAgeDays).toISOString()
        },
        {
            title: "Sustainable Fashion 'Outfit Repeat' Movement",
            summary: "Celebrities and influencers are increasingly posting 'outfit repeats' on social media, deliberately wearing the same clothing items multiple times to promote sustainable fashion and challenge fast fashion culture.",
            platforms: ["Instagram", "TikTok", "Twitter"],
            hashtags: ["#OutfitRepeat", "#SlowFashion", "#WearItAgain"],
            examples: [
                {
                    text: "A-list actress documents wearing same gown to three different award ceremonies",
                    url: "https://www.vogue.com/sustainable-celebrity-fashion"
                },
                {
                    text: "Fashion influencers showing creative ways to style same basic items for different occasions",
                    url: "https://www.instagram.com/explore/tags/30wears/"
                }
            ],
            context: "This trend represents a significant shift in fashion culture, which has traditionally celebrated constant newness. The movement gained traction following recent reports about fashion's environmental impact, with the industry responsible for approximately 10% of global carbon emissions. By normalizing outfit repeating, these influencers are challenging the 'wear once' social media culture that has fueled overconsumption.",
            timestamp: getRandomRecentDate(maxAgeDays).toISOString()
        },
        {
            title: "Collaborative Cooking Livestreams",
            summary: "Interactive cooking sessions where viewers guide chefs through recipe modifications in real-time are gaining popularity across streaming platforms.",
            platforms: ["Twitch", "TikTok Live", "Instagram Live"],
            hashtags: ["#CrowdSourcedCooking", "#LiveChef", "#CookWithMe"],
            examples: [
                {
                    text: "Professional chef lets viewers vote on ingredients for experimental dishes",
                    url: "https://www.twitch.tv/directory/game/Food%20%26%20Drink"
                },
                {
                    text: "Home cook creates fusion recipes based on live audience suggestions",
                    url: "https://www.tiktok.com/@cookingwithaudience"
                }
            ],
            context: "This trend blends entertainment, education, and community engagement, transforming passive cooking demonstrations into participatory experiences. It's part of a broader shift toward interactive content that builds connections between creators and audiences.",
            timestamp: getRandomRecentDate(maxAgeDays).toISOString()
        },
        {
            title: "Hyperrealistic AI Portrait Challenges",
            summary: "Users are creating and sharing eerily realistic AI-generated portraits that blur the line between real and artificial humans, often posting them alongside actual photos as a 'spot the difference' challenge.",
            platforms: ["Instagram", "TikTok", "Twitter"],
            hashtags: ["#AIorHuman", "#HyperrealisticAI", "#SpotTheDifference"],
            examples: [
                {
                    text: "Viral thread of AI-generated 'people' that don't exist gaining millions of views",
                    url: "https://twitter.com/hashtag/aiportrait"
                },
                {
                    text: "Artists demonstrating the creation process of hyperrealistic digital humans",
                    url: "https://www.instagram.com/explore/tags/aiportrait/"
                }
            ],
            context: "This trend highlights both the impressive advancements in generative AI technology and growing concerns around digital authenticity. As these tools become more accessible, discussions about ethics, identity verification, and the definition of authentic human content continue to evolve.",
            timestamp: getRandomRecentDate(maxAgeDays).toISOString()
        }
    ];

    // Shuffle and take the requested number of trends
    return trends
        .sort(() => 0.5 - Math.random())
        .slice(0, count);
}

// Helper function to generate a random date within the last maxAgeDays
function getRandomRecentDate(maxAgeDays) {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * maxAgeDays);
    const hoursAgo = Math.floor(Math.random() * 24);
    
    now.setDate(now.getDate() - daysAgo);
    now.setHours(now.getHours() - hoursAgo);
    
    return now;
}

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`PULSE AI server running at http://localhost:${PORT} (${RESPONSE_MODE} mode)`);
}); 