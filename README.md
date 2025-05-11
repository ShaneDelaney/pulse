# EMRG Pulse

EMRG Pulse is a modern web application that delivers real-time trend analysis from various sources including social media platforms. It provides users with up-to-date information about what's currently trending across multiple platforms with rich contextual information.

## Features

- **Real-time Social Media Trend Analysis**: Get the latest trending topics from across social media platforms like Twitter, Instagram, TikTok, Reddit, and more.
- **Rich Context**: Each trend includes detailed information such as:
  - Descriptive summaries
  - Relevant hashtags
  - Platforms where the trend is popular
  - Real examples with functional links
  - Cultural context explaining the significance of the trend
- **Mobile-Optimized Interface**: Fully responsive design that works beautifully on all devices from desktop to smartphones.
- **Link Validation**: All example links are validated to ensure they're correctly formatted and functional.
- **Recency Guarantee**: Only trends from the past week are displayed, ensuring content is current and relevant.
- **Interactive UI**: Modern, clean interface with visual feedback and smooth animations.
- **OpenAI GPT-4o Integration**: Uses advanced AI to analyze and explain current trends.

## Screenshots

(Add screenshots here)

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js with Express
- **APIs**: OpenAI GPT-4o for trend analysis
- **Deployment**: Local development server (can be easily deployed to platforms like Vercel, Netlify, etc.)

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/emrg-pulse.git
cd emrg-pulse
```

2. Install dependencies:
```bash
cd server
npm install
```

3. Create a `.env` file in the server directory:
```bash
RESPONSE_MODE=live  # Use 'mock' for testing without API calls
OPENAI_API_KEY=your_openai_api_key
PORT=8080
```

4. Start the server:
```bash
node server.js
```

5. In a separate terminal, start the frontend server:
```bash
cd ..  # Return to the project root
npx http-server -p 3000
```

6. Visit `http://localhost:3000` in your browser.

## Usage

1. Open the application in your browser
2. Click the main button to discover trending topics
3. Browse through the trend information including examples, platforms, and hashtags
4. Ask follow-up questions about any trend to get additional information
5. Click "Discover New Trend" to see different trends

## API Endpoints

- **POST /api/social-trends**: Get trending topics from social media
  - Parameters:
    - `platform` (optional): Specific platform to search (default: 'all')
    - `count` (optional): Number of trends to return (default: 5)
    - `maxAgeDays` (optional): Maximum age of trends in days (default: 7)

- **POST /api/daily-summary**: Get trending topics from OpenAI
  - Parameters:
    - `topic` (optional): Specific topic to search (default: 'current trending topics')
    - `count` (optional): Number of trends to return (default: 5)

- **POST /api/gemini-trends**: Get trending topics from Gemini
  - Parameters:
    - `topic` (optional): Specific topic to search (default: 'current trending topics')
    - `count` (optional): Number of trends to return (default: 5)

- **POST /api/chat**: Ask follow-up questions about trends
  - Parameters:
    - `message`: The user's question
    - `context`: JSON string with trend information

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the GPT-4o API
- The open-source community for inspiration and tools

---

Created with ❤️ by [Your Name]