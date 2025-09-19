#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'vite.config.ts');

// Read the current config
let config = fs.readFileSync(configPath, 'utf8');

// Replace https: false with https: true
config = config.replace('https: false', 'https: true');

// Write back the config
fs.writeFileSync(configPath, config);

console.log('✅ HTTPS enabled in vite.config.ts');
console.log('🔄 Restart the dev server: npm run dev');
console.log('🔒 Accept the self-signed certificate warning in your browser');
console.log('📹 Allow camera and microphone permissions when prompted');