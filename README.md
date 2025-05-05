# PULSE - AI-Powered Trend Discovery

A modern, conversation-based trend discovery app that shows internet trends from 2025 with AI-powered explanations.

## Features
- ChatGPT-style conversation interface
- Responsive design for desktop and mobile
- Sidebar for saved trends history
- Non-repeating trend algorithm
- Follow-up questions and suggestions
- Share functionality
- Keyboard shortcuts

## Setup Instructions

### Frontend
1. Clone the repository
   ```
   git clone https://github.com/ShaneDelaney/pulse.git
   cd pulse
   ```

2. Serve the frontend files using any static file server
   ```
   npx http-server -p 8000
   ```

### Backend (for AI integration)
1. Navigate to the server directory
   ```
   cd server
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file with your API key
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

4. Start the server
   ```
   npm start
   ```

5. Open your browser to `http://localhost:8000`

## Keyboard Shortcuts
- `Enter`: Send message
- `Shift + Enter`: New line
- `Escape`: Clear input
- `Up Arrow`: Edit last message

## Technologies Used
- HTML, CSS, JavaScript
- Express.js for the backend
- Anthropic Claude API for AI responses

## Development

To run the server in development mode with auto-restart:
```
cd server
npm run dev
```