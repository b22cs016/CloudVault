const http = require('http');

console.log('Checking if backend server is running...');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET',
  timeout: 5000 // 5 seconds timeout
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    if (res.statusCode === 200) {
      console.log('Server is running!');
    } else {
      console.log('Server is not responding correctly.');
    }
  });
});

req.on('error', (error) => {
  console.error('Error checking server:', error.message);
  console.log('Server is not running. Please start the backend server.');
});

req.on('timeout', () => {
  console.error('Request timed out');
  req.destroy();
  console.log('Server is not responding. Please start the backend server.');
});

req.end(); 