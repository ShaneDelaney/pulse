# PULSE - AI-Powered Trend Discovery

A minimalist trend discovery app that shows internet trends from 2025 with AI-powered explanations.

## Features
- Clean black and white design
- Non-repeating trend algorithm
- Mobile-optimized interface
- AI-powered trend explanations
- Video embedding for trend examples

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

### Backend
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

## Development

To run the server in development mode with auto-restart: 