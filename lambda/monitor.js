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
    
    // Check for any crash events (keys starting with 'crash:')
    const crashKeys = await redis.keys('crash:*');
    
    if (crashKeys.length > 0) {
      console.log(`Found ${crashKeys.length} crash events:`, crashKeys);
      
      // Get the most recent crash event
      const latestCrashKey = crashKeys[crashKeys.length - 1];
      const crashData = await redis.get(latestCrashKey);
      
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        body: JSON.stringify({
          message: 'CRASH DETECTED! 💥',
          status: 'crashed',
          crashCount: crashKeys.length,
          latestCrash: JSON.parse(crashData),
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // No crash events found - system is healthy
    console.log('No crash events found - system healthy');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        message: 'All systems operational! ✅',
        status: 'healthy',
        crashCount: 0,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Error checking crash events:', error);
    
    // If we can't connect to Redis, consider it a crash
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({
        message: 'Redis connection failed - CRASH! 💥',
        status: 'crashed',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}; 