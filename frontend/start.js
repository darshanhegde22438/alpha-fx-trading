const { spawn } = require('child_process');
const path = require('path');

// Set environment variables to fix the development server issue
process.env.DANGEROUSLY_DISABLE_HOST_CHECK = 'true';
process.env.WDS_SOCKET_HOST = 'localhost';
process.env.WDS_SOCKET_PORT = '3000';

// Start the React development server
const child = spawn('npx', ['react-scripts', 'start'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    DANGEROUSLY_DISABLE_HOST_CHECK: 'true',
    WDS_SOCKET_HOST: 'localhost',
    WDS_SOCKET_PORT: '3000'
  }
});

child.on('error', (error) => {
  console.error('Error starting development server:', error);
});

child.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
});
