/**
 * Debug script to check farmer ordering system data
 * This will help us understand why products aren't showing and orders can't be placed
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc
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

async function debugOrderingSystem() {
  console.log('🔍 Debugging Farmer Ordering System...\n');

  try {
    // 1. Check if there are any users in the database
    console.log('1. Checking users...');
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`   Found ${usersSnapshot.size} users total`);
    
    let farmerCount = 0;
    let dealerCount = 0;
    let sampleFarmerId = null;
    let sampleDealerId = null;
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.role === 'farmer') {
        farmerCount++;
        if (!sampleFarmerId) sampleFarmerId = doc.id;
      } else if (userData.role === 'dealer') {
        dealerCount++;
        if (!sampleDealerId) sampleDealerId = doc.id;
      }
    });
    
    console.log(`   - Farmers: ${farmerCount}`);
    console.log(`   - Dealers: ${dealerCount}`);
    console.log(`   - Sample Farmer ID: ${sampleFarmerId}`);
    console.log(`   - Sample Dealer ID: ${sampleDealerId}\n`);

    // 2. Check farmer-dealer connections
    console.log('2. Checking farmer-dealer connections...');
    const connectionsSnapshot = await getDocs(collection(db, 'farmerDealers'));
    console.log(`   Found ${connectionsSnapshot.size} farmer-dealer connections`);
    
    if (connectionsSnapshot.size > 0) {
      console.log('   Sample connections:');
      connectionsSnapshot.docs.slice(0, 3).forEach((doc, index) => {
        const connection = doc.data();
        console.log(`   ${index + 1}. Farmer: ${connection.farmerId} -> Dealer: ${connection.dealerId}`);
        console.log(`      Dealer Name: ${connection.dealerName}`);
      });
    }
    console.log('');

    // 3. Check dealer products
    console.log('3. Checking dealer products...');
    const productsSnapshot = await getDocs(collection(db, 'dealerProducts'));
    console.log(`   Found ${productsSnapshot.size} dealer products total`);
    
    if (productsSnapshot.size > 0) {
      console.log('   Sample products:');
      productsSnapshot.docs.slice(0, 5).forEach((doc, index) => {
        const product = doc.data();
        console.log(`   ${index + 1}. ${product.productName} (${product.category})`);
        console.log(`      Dealer: ${product.dealerId}`);
        console.log(`      Stock: ${product.currentStock} ${product.unit}`);
        console.log(`      Price: ₹${product.pricePerUnit}/${product.unit}`);
      });
    }
    console.log('');

    // 4. Test specific farmer query if we have a sample farmer
    if (sampleFarmerId) {
      console.log(`4. Testing queries for sample farmer: ${sampleFarmerId}`);
      
      // Check connections for this farmer
      const farmerConnectionsQuery = query(
        collection(db, 'farmerDealers'),
        where('farmerId', '==', sampleFarmerId)
      );
      
      const farmerConnections = await getDocs(farmerConnectionsQuery);
      console.log(`   Farmer has ${farmerConnections.size} dealer connections`);
      
      if (farmerConnections.size > 0) {
        console.log('   Connected dealers:');
        farmerConnections.forEach((doc, index) => {
          const connection = doc.data();
          console.log(`   ${index + 1}. ${connection.dealerName} (ID: ${connection.dealerId})`);
        });
        
        // Check products for connected dealers
        const dealerIds = farmerConnections.docs.map(doc => doc.data().dealerId);
        console.log(`   Checking products for these dealers...`);
        
        for (const dealerId of dealerIds) {
          const dealerProductsQuery = query(
            collection(db, 'dealerProducts'),
            where('dealerId', '==', dealerId)
          );
          
          const dealerProducts = await getDocs(dealerProductsQuery);
          console.log(`   Dealer ${dealerId} has ${dealerProducts.size} products`);
          
          if (dealerProducts.size > 0) {
            dealerProducts.docs.slice(0, 2).forEach((doc, productIndex) => {
              const product = doc.data();
              console.log(`     - ${product.productName}: ${product.currentStock} ${product.unit} @ ₹${product.pricePerUnit}/${product.unit}`);
            });
          }
        }
      }
    }
    console.log('');

    // 5. Check orders
    console.log('5. Checking order requests...');
    const ordersSnapshot = await getDocs(collection(db, 'orderRequests'));
    console.log(`   Found ${ordersSnapshot.size} order requests total`);
    
    if (ordersSnapshot.size > 0) {
      console.log('   Sample orders:');
      ordersSnapshot.docs.slice(0, 3).forEach((doc, index) => {
        const order = doc.data();
        console.log(`   ${index + 1}. ${order.orderType} order from farmer ${order.farmerId}`);
        console.log(`      Status: ${order.status}`);
        console.log(`      Dealer: ${order.dealerId}`);
      });
    }
    console.log('');

    // Summary
    console.log('📋 SUMMARY:');
    console.log(`✅ Users: ${usersSnapshot.size} (${farmerCount} farmers, ${dealerCount} dealers)`);
    console.log(`✅ Connections: ${connectionsSnapshot.size} farmer-dealer connections`);
    console.log(`✅ Products: ${productsSnapshot.size} dealer products`);
    console.log(`✅ Orders: ${ordersSnapshot.size} order requests`);
    
    if (connectionsSnapshot.size === 0) {
      console.log('❌ ISSUE: No farmer-dealer connections found!');
      console.log('   Farmers need to connect to dealers to see products.');
    }
    
    if (productsSnapshot.size === 0) {
      console.log('❌ ISSUE: No dealer products found!');
      console.log('   Dealers need to add products to their inventory.');
    }

  } catch (error) {
    console.error('❌ Error debugging system:', error);
  }
}

// Run the debug
debugOrderingSystem().then(() => {
  console.log('\n🎯 Debug completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Debug failed:', error);
  process.exit(1);
});
