#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Kaizen Job Portal...\n');

// Create .env file for server if it doesn't exist
const serverEnvPath = path.join(__dirname, 'server', '.env');
if (!fs.existsSync(serverEnvPath)) {
  const envContent = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/kaizen-job-portal
NODE_ENV=development
FRONTEND_URL=http://localhost:3000`;
  
  fs.writeFileSync(serverEnvPath, envContent);
  console.log('✅ Created server/.env file');
}

// Install server dependencies
console.log('\n📦 Installing server dependencies...');
try {
  execSync('npm install', { cwd: path.join(__dirname, 'server'), stdio: 'inherit' });
  console.log('✅ Server dependencies installed');
} catch (error) {
  console.error('❌ Failed to install server dependencies');
  process.exit(1);
}

// Install client dependencies
console.log('\n📦 Installing client dependencies...');
try {
  execSync('npm install', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });
  console.log('✅ Client dependencies installed');
} catch (error) {
  console.error('❌ Failed to install client dependencies');
  process.exit(1);
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Make sure MongoDB is running on your system');
console.log('2. Start the server: cd server && npm run dev');
console.log('3. Start the client: cd client && npm run dev');
console.log('4. Open http://localhost:3000 in your browser');
console.log('\n📚 Check README.md for more detailed instructions'); 