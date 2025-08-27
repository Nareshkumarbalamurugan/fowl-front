/**
 * Test Runner Script
 * 
 * This script makes it easy to run the connection test scripts
 * with the correct Firebase configuration.
 */

// Load environment variables from .env file if available
try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv not available, using hardcoded config');
}

// Firebase configuration - using environment variables with fallback values
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyAJBH_PVRcK2va6X_cXuVHTRchMrBvm7HM',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'poultrymitra-9221e.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'poultrymitra-9221e',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'poultrymitra-9221e.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '577769606246',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:577769606246:web:eeb6d0e2e23fdc22b0b1a7'
};

// Print current configuration
console.log('🔧 Using Firebase Configuration:');
console.log('Project ID:', firebaseConfig.projectId);
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('-----------------------------------');

// Initialize Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');
const { getAuth } = require('firebase/auth');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log('✅ Firebase initialized successfully');
console.log('-----------------------------------');

// Available test commands
const commands = {
  'display': 'Display all connections and invites',
  'system': 'Run full system test with test accounts',
  'full': 'Run complete test with real accounts'
};

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'help';

async function runTest() {
  try {
    if (command === 'display') {
      console.log('📊 Running Connection Display Test...');
      const { runLiveConnectionTest } = require('./test-connection-display');
      await runLiveConnectionTest();
    } 
    else if (command === 'system') {
      console.log('🧪 Running System Test...');
      const { runConnectionTests } = require('./test-connection-system');
      await runConnectionTests();
    } 
    else if (command === 'full') {
      console.log('🔄 Running Complete Test With Real Accounts...');
      // First check if the config has been updated
      const { TEST_CONFIG } = require('./test-connection-full');
      
      if (TEST_CONFIG.dealer.email === 'dealer@example.com') {
        console.log('⚠️ Warning: You need to update the test accounts in test-connection-full.js');
        console.log('Please edit the TEST_CONFIG object with real dealer and farmer credentials');
        return;
      }
      
      const { runCompleteConnectionTest } = require('./test-connection-full');
      await runCompleteConnectionTest();
    } 
    else if (command === 'help' || command === '--help' || command === '-h') {
      console.log('🛠️ Connection Test Runner');
      console.log('-------------------------');
      console.log('Available commands:');
      
      Object.entries(commands).forEach(([cmd, description]) => {
        console.log(`  node run.js ${cmd.padEnd(15)} - ${description}`);
      });
      console.log('\nExample: node run.js display');
    } 
    else {
      console.log(`❌ Unknown command: ${command}`);
      console.log('Run "node run.js help" to see available commands');
    }
  } catch (error) {
    console.error('❌ Error running test:', error);
  }
}

// Run the selected test
runTest();
