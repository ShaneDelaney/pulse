/**
 * PULSE Trend Analyzer
 * 
 * AI-powered tool to identify emerging niche trends and tentpole events
 * from social media data streams in real-time.
 */

// Configuration parameters
const TREND_THRESHOLDS = {
  NICHE: {
    MIN_GROWTH_RATE: 0.25, // 25% growth required
    MIN_TIME_WINDOW: 6,    // hours
    MIN_ENGAGEMENT_RATE: 0.05, // minimum 5% engagement rate
    MIN_CONFIDENCE: 0.70   // 70% confidence required to flag
  },
  TENTPOLE: {
    MIN_CONFIDENCE: 0.80,  // 80% confidence required for tentpole events
    CALENDAR_MATCH_THRESHOLD: 0.75 // 75% match required against event calendar
  }
};

// Sample event calendar (would be expanded and regularly updated)
const EVENT_CALENDAR = [
  {
    name: "Met Gala",
    date: "2025-05-05",
    keywords: ["met gala", "metropolitan museum", "fashion", "costume institute", "anna wintour"],
    expectedVolume: 1000000
  },
  {
    name: "NBA Playoffs",
    date: "2025-04-15",
    endDate: "2025-06-15",
    keywords: ["nba playoffs", "basketball playoffs", "nba finals"],
    teams: ["lakers", "celtics", "warriors", "bucks", "heat", "knicks", "nuggets", "suns"],
    expectedVolume: 750000
  },
  {
    name: "Super Bowl",
    date: "2025-02-09",
    keywords: ["super bowl", "superbowl", "football championship", "nfl championship"],
    expectedVolume: 2000000
  },
  {
    name: "Coachella",
    date: "2025-04-11",
    endDate: "2025-04-20",
    keywords: ["coachella", "music festival", "indio", "coachella valley"],
    expectedVolume: 500000
  }
];

/**
 * Main analysis function
 * @param {Array} posts - Batch of social media posts to analyze
 * @param {Object} historicalData - Previous trend data for comparison
 * @returns {Array} - Discovered trends
 */
function analyzePostBatch(posts, historicalData = {}) {
  // Extract data and normalize
  const normalizedPosts = normalizePosts(posts);
  
  // Identify topic clusters
  const topicClusters = identifyTopicClusters(normalizedPosts);
  
  // Calculate engagement and velocity metrics
  const topicsWithMetrics = calculateMetrics(topicClusters, historicalData);
  
  // Identify trends
  const trends = [];
  
  topicsWithMetrics.forEach(topic => {
    if (isTentpoleEvent(topic)) {
      trends.push(createTentpoleOutput(topic));
    } else if (isNicheTrend(topic)) {
      trends.push(createNicheOutput(topic));
    }
  });
  
  return trends;
}

/**
 * Normalize posts from different platforms into a standard format
 * @param {Array} posts - Raw posts from various platforms
 * @returns {Array} - Normalized posts
 */
function normalizePosts(posts) {
  return posts.map(post => {
    // Calculate standardized engagement rate based on follower count
    const engagementCount = (post.likes || 0) + (post.shares || 0) + (post.comments || 0);
    const engagementRate = post.followerCount ? engagementCount / post.followerCount : 0;
    
    return {
      content: post.text.toLowerCase(),
      hashtags: extractHashtags(post),
      timestamp: new Date(post.timestamp),
      engagementRate: engagementRate,
      engagementCount: engagementCount,
      isVerified: post.verified || false,
      isMicroCreator: (post.followerCount < 10000),
      platform: post.platform
    };
  });
}

/**
 * Extract and standardize hashtags from post
 * @param {Object} post - Social media post
 * @returns {Array} - Normalized hashtags
 */
function extractHashtags(post) {
  // If hashtags are already provided in an array
  if (Array.isArray(post.hashtags)) {
    return post.hashtags.map(tag => tag.toLowerCase().replace(/^#/, ''));
  }
  
  // Extract hashtags from text content
  const hashtagRegex = /#(\w+)/g;
  const matches = [...post.text.matchAll(hashtagRegex)];
  
  return matches.map(match => match[1].toLowerCase());
}

/**
 * Group posts into topic clusters using NLP techniques
 * @param {Array} posts - Normalized posts
 * @returns {Array} - Topic clusters
 */
function identifyTopicClusters(posts) {
  // This would use NLP/ML techniques in a full implementation
  // For our prototype, we'll use a simplified approach based on hashtags and keywords
  
  const topicMap = new Map();
  
  // Group posts by hashtags
  posts.forEach(post => {
    // Check hashtags
    post.hashtags.forEach(hashtag => {
      if (!topicMap.has(hashtag)) {
        topicMap.set(hashtag, {
          topic: hashtag,
          type: 'hashtag',
          posts: [],
          mentionsLast24h: 0
        });
      }
      
      topicMap.get(hashtag).posts.push(post);
    });
    
    // In a real implementation, we would also:
    // 1. Use NLP to extract named entities and topics
    // 2. Use ML to cluster semantically similar posts
    // 3. Identify emerging keywords and phrases
  });
  
  // Convert map to array
  return Array.from(topicMap.values());
}

/**
 * Calculate engagement and velocity metrics for identified topics
 * @param {Array} topicClusters - Topic clusters
 * @param {Object} historicalData - Historical data for comparison
 * @returns {Array} - Topics with added metrics
 */
function calculateMetrics(topicClusters, historicalData) {
  const now = new Date();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
  
  return topicClusters.map(cluster => {
    // Count mentions in the last 24 hours
    const mentionsLast24h = cluster.posts.filter(post => 
      post.timestamp >= oneDayAgo
    ).length;
    
    // Calculate average engagement rate
    const avgEngagementRate = cluster.posts.reduce((sum, post) => 
      sum + post.engagementRate, 0) / cluster.posts.length;
    
    // Calculate percentage from micro-creators (under 10K followers)
    const microCreatorPosts = cluster.posts.filter(post => post.isMicroCreator);
    const microCreatorPercentage = (microCreatorPosts.length / cluster.posts.length) || 0;
    
    // Calculate velocity (growth rate)
    // In a real implementation, this would compare to more granular historical data
    let velocityScore = 1.0; // Default
    if (historicalData && historicalData[cluster.topic]) {
      const previous = historicalData[cluster.topic].mentionsLast24h || 1;
      velocityScore = (mentionsLast24h / previous) - 1; // growth rate
    }
    
    return {
      ...cluster,
      mentionsLast24h,
      avgEngagementRate,
      microCreatorPercentage,
      velocityScore,
      engagementScore: avgEngagementRate * mentionsLast24h // Composite score
    };
  });
}

/**
 * Determine if a topic represents a tentpole event
 * @param {Object} topic - Topic with metrics
 * @returns {Boolean} - Whether it's a tentpole event
 */
function isTentpoleEvent(topic) {
  const today = new Date();
  
  // Check against event calendar
  for (const event of EVENT_CALENDAR) {
    const eventDate = new Date(event.date);
    const eventEndDate = event.endDate ? new Date(event.endDate) : eventDate;
    
    // Check if we're within the event timeframe (including 5 days before)
    const fiveDaysBefore = new Date(eventDate);
    fiveDaysBefore.setDate(fiveDaysBefore.getDate() - 5);
    
    const isWithinTimeframe = 
      (today >= fiveDaysBefore && today <= eventEndDate);
    
    if (!isWithinTimeframe) continue;
    
    // Check keyword matches
    const keywordMatches = event.keywords.some(keyword => 
      topic.topic.includes(keyword) || 
      topic.posts.some(post => post.content.includes(keyword))
    );
    
    if (keywordMatches) {
      // Calculate confidence based on volume vs expected volume
      const volumeRatio = Math.min(topic.mentionsLast24h / (event.expectedVolume / 10), 1);
      const confidence = 0.5 + (volumeRatio * 0.5); // Between 0.5 and 1.0
      
      if (confidence >= TREND_THRESHOLDS.TENTPOLE.MIN_CONFIDENCE) {
        return {
          isMatch: true,
          eventName: event.name,
          confidence: confidence
        };
      }
    }
  }
  
  return { isMatch: false };
}

/**
 * Determine if a topic represents a niche trend
 * @param {Object} topic - Topic with metrics
 * @returns {Boolean} - Whether it's a niche trend
 */
function isNicheTrend(topic) {
  // Check minimum growth rate
  if (topic.velocityScore < TREND_THRESHOLDS.NICHE.MIN_GROWTH_RATE) {
    return false;
  }
  
  // Check engagement rate
  if (topic.avgEngagementRate < TREND_THRESHOLDS.NICHE.MIN_ENGAGEMENT_RATE) {
    return false;
  }
  
  // Weigh factors for confidence calculation:
  // 1. Velocity score (higher is better)
  // 2. Micro-creator percentage (higher is better for niche trends)
  // 3. Engagement rate (higher is better)
  
  const velocityFactor = Math.min(topic.velocityScore / 2, 1.0) * 0.4;
  const microCreatorFactor = topic.microCreatorPercentage * 0.3;
  const engagementFactor = Math.min(topic.avgEngagementRate / 0.1, 1.0) * 0.3;
  
  const confidence = velocityFactor + microCreatorFactor + engagementFactor;
  
  return {
    isMatch: confidence >= TREND_THRESHOLDS.NICHE.MIN_CONFIDENCE,
    confidence: confidence
  };
}

/**
 * Create standardized output for a tentpole event
 * @param {Object} topic - Topic data
 * @returns {Object} - Standardized output
 */
function createTentpoleOutput(topic) {
  const tentpoleInfo = isTentpoleEvent(topic);
  
  return {
    type: "tentpole",
    trend: topic.topic,
    eventName: tentpoleInfo.eventName,
    confidence: tentpoleInfo.confidence,
    rationale: `Matches known event "${tentpoleInfo.eventName}" with ${(tentpoleInfo.confidence * 100).toFixed(1)}% confidence`,
    velocityScore: topic.velocityScore,
    engagementScore: topic.engagementScore,
    mentionsLast24h: topic.mentionsLast24h
  };
}

/**
 * Create standardized output for a niche trend
 * @param {Object} topic - Topic data
 * @returns {Object} - Standardized output
 */
function createNicheOutput(topic) {
  const nicheInfo = isNicheTrend(topic);
  
  let rationale = `${(topic.velocityScore * 100).toFixed(1)}% growth rate`;
  
  if (topic.microCreatorPercentage > 0.7) {
    rationale += ` with ${(topic.microCreatorPercentage * 100).toFixed(1)}% posts from micro-creators`;
  }
  
  if (topic.avgEngagementRate > 0.1) {
    rationale += `, high engagement rate of ${(topic.avgEngagementRate * 100).toFixed(1)}%`;
  }
  
  return {
    type: "niche",
    trend: topic.topic,
    confidence: nicheInfo.confidence,
    rationale: rationale,
    velocityScore: topic.velocityScore,
    engagementScore: topic.engagementScore,
    mentionsLast24h: topic.mentionsLast24h
  };
}

// Sample function to demonstrate how the analyzer would be used
function analyzeSampleData() {
  // This would come from real-time social media APIs in a real implementation
  const samplePosts = [
    {
      text: "Just tried #quietluxury fashion and I'm obsessed with the subtle elegance!",
      timestamp: "2025-05-06T10:00:00Z",
      likes: 120,
      shares: 45,
      comments: 23,
      followerCount: 2500,
      verified: false,
      platform: "instagram"
    },
    {
      text: "The stealth wealth aesthetic is the perfect antidote to logomania. #quietluxury #stealthwealth",
      timestamp: "2025-05-06T09:30:00Z",
      likes: 89,
      shares: 12,
      comments: 7,
      followerCount: 1800,
      verified: false,
      platform: "twitter"
    },
    {
      text: "My minimalist outfit details for today's meetings #mindfulconsumption #quietluxury",
      timestamp: "2025-05-06T11:20:00Z",
      likes: 210,
      shares: 15,
      comments: 31,
      followerCount: 3200,
      verified: false,
      platform: "instagram"
    },
    {
      text: "Super excited for the Met Gala tonight! Can't wait to see all the amazing fashion! #MetGala #fashion",
      timestamp: "2025-05-05T18:00:00Z",
      likes: 1500,
      shares: 230,
      comments: 145,
      followerCount: 45000,
      verified: true,
      platform: "twitter"
    },
    {
      text: "Red carpet is ready for the biggest fashion event of the year! #MetGala2025 #VogueMagazine",
      timestamp: "2025-05-05T17:30:00Z",
      likes: 2300,
      shares: 420,
      comments: 180,
      followerCount: 120000,
      verified: true,
      platform: "instagram"
    }
  ];
  
  // Sample historical data
  const historicalData = {
    "quietluxury": {
      mentionsLast24h: 120
    },
    "metgala": {
      mentionsLast24h: 10000
    }
  };
  
  // Run the analysis
  const trends = analyzePostBatch(samplePosts, historicalData);
  
  // Log the results
  console.log(JSON.stringify(trends, null, 2));
  
  return trends;
}

// Export the functions for use in the main application
module.exports = {
  analyzePostBatch,
  analyzeSampleData
}; 