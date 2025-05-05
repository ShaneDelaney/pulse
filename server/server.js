require('dotenv').config(); // For loading environment variables
const express = require('express');
const cors = require('cors');
const { Anthropic } = require('@anthropic-ai/sdk');
const app = express();

// Initialize Anthropic with API key from environment variable
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Real AI response endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { question, trend } = req.body;
    
    // Create a system prompt that helps the AI understand its role
    const systemPrompt = `
      You are an AI assistant for a trend discovery app called PULSE.
      You specialize in explaining internet trends, memes, and cultural phenomena.
      
      When responding about trends:
      - Be concise but informative
      - Use a conversational, slightly playful tone
      - If asked for examples and you know of relevant videos, include YouTube links in this format: [VIDEO]https://www.youtube.com/watch?v=VIDEO_ID
      - Focus on factual information about the trend
      - Avoid making up specific details you're unsure about
      
      The user is asking about this trend:
      Title: ${trend.title}
      Description: ${trend.context}
      When: ${trend.month}
      Where: ${trend.origin}
    `;
    
    // Call the Anthropic API
    const completion = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        { role: "user", content: question }
      ]
    });
    
    // Extract the response
    const aiResponse = completion.content[0].text;
    
    // Send the response back to the client
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    res.status(500).json({ 
      error: 'An error occurred while processing your request',
      details: error.message
    });
  }
});

// Fallback to mock responses if AI API fails or for development
app.post('/api/chat/mock', (req, res) => {
  const { question, trend } = req.body;
  
  // Simulate processing delay
  setTimeout(() => {
    // Generate a mock response (same as your original code)
    const lowerQuestion = question.toLowerCase();
    let response;
    
    if (lowerQuestion.includes('example') || lowerQuestion.includes('show me')) {
      // Return examples with video embeds when available
      switch(trend.title) {
        case "POV: You're Being Mugged Meme":
          response = "Here's a popular example of the mugging POV trend: [VIDEO]https://www.youtube.com/watch?v=dQw4w9WgXcQ These videos typically use humor to subvert expectations about mugging scenarios.";
          break;
        
        case "KATSEYE's Gnarly Release":
          response = "Here's the official music video for KATSEYE's 'Gnarly': [VIDEO]https://www.youtube.com/watch?v=dQw4w9WgXcQ The song's energetic beat and chaotic visuals helped it go viral.";
          break;
          
        default:
          response = `While I don't have a specific video example for "${trend.title}", this trend typically features ${trend.context.toLowerCase()} You can find many examples by searching the hashtag on ${trend.origin.split(',')[0]}.`;
      }
    } 
    else if (lowerQuestion.includes('why') && lowerQuestion.includes('trend')) {
      response = `"${trend.title}" gained popularity because it resonated with audiences on ${trend.origin} during ${trend.month}. ${trend.context} The format was easy to participate in, highly shareable, and came at a time when users were looking for this type of content.`;
    }
    else if (lowerQuestion.includes('who started') || lowerQuestion.includes('origin')) {
      response = `While it's difficult to pinpoint exactly who started "${trend.title}", it first gained significant traction on ${trend.origin.split(',')[0]} in ${trend.month}. ${trend.context} From there, it quickly spread to other platforms as more creators adapted the format.`;
    }
    else {
      // Generic response for other questions
      response = `About "${trend.title}": ${trend.context} This trend was particularly popular on ${trend.origin} during ${trend.month}. Is there something specific about it you'd like to know?`;
    }
    
    res.json({ response });
  }, 1000);
});

// Use environment variable or default to 3000
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`AI server running at http://localhost:${port}`);
}); 