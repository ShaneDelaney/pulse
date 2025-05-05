# Sonar Chat

A sleek, mobile-responsive chat interface that integrates with the Perplexity Sonar API via OpenRouter. This application replicates the ChatGPT-like experience but uses Perplexity's powerful Sonar model for superior search-augmented conversations.

## Features

- **Minimalist UI**: Clean, distraction-free interface focused on the conversation
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Theme Toggle**: Switch between light and dark themes
- **Suggestion Chips**: Quick-access suggestion prompts
- **OpenRouter Integration**: Uses Perplexity Sonar via the OpenRouter API
- **Secure Backend Proxy**: All API calls go through a secure backend to protect your API key

## Screenshots

![Light Mode](/screenshots/light-mode.png)
![Dark Mode](/screenshots/dark-mode.png)

## Prerequisites

- Node.js (v14 or newer)
- npm (v6 or newer)
- An OpenRouter API key with access to the Perplexity models

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/sonar-chat.git
   cd sonar-chat
   ```

2. Install dependencies:
   ```
   npm run install-all
   ```

3. Create a `.env.local` file in the root directory with your OpenRouter API key:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

4. Start the application:
   ```
   npm start
   ```

5. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

1. Click "Start a Chat" on the welcome screen
2. Type your question in the input box or select a suggested prompt
3. Press Enter or click the send button
4. The response will appear in the chat thread
5. Use the "New Chat" button to start a fresh conversation
6. Toggle between light and dark themes using the theme button

## Project Structure

- `index.html` - Main HTML file with the UI structure
- `styles.css` - CSS styles for the application
- `app.js` - Frontend JavaScript for handling the UI and API calls
- `server/server.js` - Backend server that proxies requests to OpenRouter
- `.env.local` - Environment variables file for API keys

## Development

To run the application in development mode with hot reloading:

```
npm run dev
```

## Deployment

For production deployment, you'll need to:

1. Set up environment variables on your hosting platform
2. Build and deploy both the frontend and backend components
3. Configure CORS settings appropriately

## License

MIT

## Acknowledgements

- [Perplexity AI](https://www.perplexity.ai/) for their Sonar model
- [OpenRouter](https://openrouter.ai/) for providing access to various LLMs
- [Inter Font](https://rsms.me/inter/) for the clean typography