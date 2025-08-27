/**
 * Test script to verify Firestore queries are working without index errors
 * This script tests the basic functionality that was causing issues
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs,
  connectFirestoreEmulator 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAJBH_PVRcK2va6X_cXuVHTRchMrBvm7HM',
  authDomain: 'poultrymitra-9221e.firebaseapp.com',
  projectId: 'poultrymitra-9221e',
  storageBucket: 'poultrymitra-9221e.firebasestorage.app',
  messagingSenderId: '577769606246',
  appId: '1:577769606246:web:eeb6d0e2e23fdc22b0b1a7'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testQueries() {
  console.log('Testing Firestore queries...');

  try {
    // Test 1: Simple query without orderBy (should work now)
    console.log('Testing orderRequests without orderBy...');
    const orderQuery = query(
      collection(db, 'orderRequests'),
      where('farmerId', '==', 'test-farmer-id')
    );
    
    const orderSnapshot = await getDocs(orderQuery);
    console.log(`✅ Order requests query works: ${orderSnapshot.size} results`);

    // Test 2: Transactions query without orderBy
    console.log('Testing farmerTransactions without orderBy...');
    const transactionQuery = query(
      collection(db, 'farmerTransactions'),
      where('farmerId', '==', 'test-farmer-id')
    );
    
    const transactionSnapshot = await getDocs(transactionQuery);
    console.log(`✅ Farmer transactions query works: ${transactionSnapshot.size} results`);

    // Test 3: Connection query (should already work)
    console.log('Testing farmerDealers connection...');
    const connectionQuery = query(
      collection(db, 'farmerDealers'),
      where('farmerId', '==', 'test-farmer-id')
    );
    
    const connectionSnapshot = await getDocs(connectionQuery);
    console.log(`✅ Farmer dealers query works: ${connectionSnapshot.size} results`);

    console.log('🎉 All queries completed successfully!');
    console.log('The application should now work without index errors.');
    console.log('Note: Data will not be ordered until indexes are fully built.');

  } catch (error) {
    console.error('❌ Query failed:', error);
    console.log('The indexes may still be building. Please wait a few minutes and try again.');
  }
}

// Run the test
testQueries().then(() => {
  console.log('Test completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
