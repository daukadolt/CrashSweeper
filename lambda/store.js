const Redis = require('ioredis');

let redis;

const initRedis = () => {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_ENDPOINT,
      port: process.env.REDIS_PORT,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });
  }
  return redis;
};

exports.handler = async (event) => {
  try {
    const redis = initRedis();
    
    // Create a unique key for this crash event
    const crashKey = `crash:${Date.now()}`;
    
    // Store the crash event with 5 minute TTL
    await redis.setex(crashKey, 300, JSON.stringify({
      timestamp: new Date().toISOString(),
      message: 'Mine clicked! 💥',
      player: event.queryStringParameters?.player || 'anonymous'
    }));
    
    console.log(`Crash event stored: ${crashKey}`);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        message: 'Crash event stored successfully! 💥',
        crashKey: crashKey,
        ttl: 300
      })
    };
    
  } catch (error) {
    console.error('Error storing crash event:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        message: 'Failed to store crash event',
        error: error.message
      })
    };
  }
}; 