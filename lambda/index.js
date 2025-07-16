exports.handler = async (event) => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  // Crash between 2-4 PM (14:00-16:00)
  if (hour >= 14 && hour < 16) {
    console.log('Crash time! Returning 500 error');
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({
        message: 'Crash time! 💥',
        timestamp: now.toISOString(),
        hour: hour,
        minute: minute,
        status: 'crashed'
      })
    };
  }
  
  // Random crash (5% chance)
  const randomCrash = Math.random() < 0.05;
  if (randomCrash) {
    console.log('Random crash! Returning 500 error');
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({
        message: 'Random crash! 🎲',
        timestamp: now.toISOString(),
        hour: hour,
        minute: minute,
        status: 'crashed'
      })
    };
  }
  
  // Normal response
  console.log('All good! Returning 200');
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    },
    body: JSON.stringify({
      message: 'All systems operational! ✅',
      timestamp: now.toISOString(),
      hour: hour,
      minute: minute,
      status: 'healthy'
    })
  };
}; 