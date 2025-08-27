// Migration script to populate farmerBalances collection from existing transactions
// Run this once to initialize the new farmerBalances collection

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc,
  Timestamp 
} from 'firebase/firestore';

// Firebase config - replace with your actual config
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

async function migrateBalances() {
  try {
    console.log('🔄 Starting balance migration...');
    
    // Get all farmer transactions
    const transactionsSnapshot = await getDocs(collection(db, 'farmerTransactions'));
    
    // Group transactions by farmer-dealer pairs
    const balanceMap = new Map();
    
    transactionsSnapshot.forEach((doc) => {
      const transaction = doc.data();
      const key = `${transaction.farmerId}_${transaction.dealerId}`;
      
      if (!balanceMap.has(key)) {
        balanceMap.set(key, {
          farmerId: transaction.farmerId,
          dealerId: transaction.dealerId,
          dealerName: transaction.dealerName,
          creditBalance: 0,
          debitBalance: 0,
          netBalance: 0,
          lastUpdated: transaction.date || Timestamp.now()
        });
      }
      
      const balance = balanceMap.get(key);
      
      if (transaction.transactionType === 'credit') {
        balance.debitBalance += transaction.amount; // Dealer owes farmer
      } else {
        balance.creditBalance += transaction.amount; // Farmer owes dealer
      }
      
      balance.netBalance = balance.creditBalance - balance.debitBalance;
      
      // Update last updated time
      if (transaction.date && transaction.date.toMillis() > balance.lastUpdated.toMillis()) {
        balance.lastUpdated = transaction.date;
      }
    });
    
    console.log(`📊 Found ${balanceMap.size} farmer-dealer balance pairs`);
    
    // Write balances to farmerBalances collection
    const promises = [];
    for (const [key, balance] of balanceMap.entries()) {
      const balanceRef = doc(db, 'farmerBalances', key);
      promises.push(setDoc(balanceRef, balance));
    }
    
    await Promise.all(promises);
    
    console.log('✅ Balance migration completed successfully!');
    console.log(`📝 Created ${balanceMap.size} balance documents in farmerBalances collection`);
    
  } catch (error) {
    console.error('❌ Error migrating balances:', error);
  }
}

// Run the migration
migrateBalances();
