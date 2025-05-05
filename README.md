# PULSE - AI-Powered Trend Discovery

A modern, conversation-based trend discovery app that shows internet trends from 2025 with AI-powered explanations.

## Features
- ChatGPT-style conversation interface
- Responsive design for desktop and mobile
- Sidebar for saved trends history
- Voice input support (on supported browsers)
- Web search integration for up-to-date information
- Mock API responses for offline development

## Getting Started

### Prerequisites
- Node.js (v14 or newer)
- npm (v6 or newer)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/pulse.git
   cd pulse
   ```

2. Install all dependencies (both frontend and backend)
   ```
   npm run install-all
   ```
   
   Or install manually:
   ```
   npm install
   cd server
   npm install
   cd ..
   ```

### Configuration

1. Create a `.env` file in the server directory with your API keys

   ```
   # Server configuration
   PORT=8080

   # API Keys (replace with your actual keys)
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   SEARCH_API_KEY=your_search_api_key_here

   # Set to "mock" to use mock responses, "api" to use real API
   RESPONSE_MODE=mock
   ```

   Note: If you don't have API keys, you can leave the default values and the app will use mock responses.

### Running the Application

#### Option 1: Start both frontend and backend with a single command
```
npm start
```

This will start both the frontend server on port 3000 and the backend server on port 8080.

#### Option 2: Start servers individually

Start the backend server:
```
cd server
npm start
```

Start the frontend server (in a separate terminal):
```
http-server -p 3000
```

### Development Mode

To run both servers in development mode with auto-restart:
```
npm run dev
```

## Accessing the App

Once both servers are running:
1. Open your browser to http://localhost:3000
2. Click on "Show me what's trending" to start exploring trends
3. Ask questions about trends or request new ones

## Troubleshooting

### Common Issues

1. **"Server not available" error**
   - Make sure the backend server is running at http://localhost:8080
   - Check that you're not experiencing network issues
   - Verify the `.env` file has the correct configuration

2. **CORS errors in console**
   - The frontend and backend must be running on the expected ports
   - Check that CORS is properly enabled in the server

3. **API connection errors**
   - If using API mode, verify your API keys are valid
   - Try switching to mock mode by setting `RESPONSE_MODE=mock` in `.env`

## License

This project is licensed under the MIT License - see the LICENSE file for details.