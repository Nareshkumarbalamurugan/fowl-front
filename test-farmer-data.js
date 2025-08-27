// Test script to verify farmer can see real dealer products
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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

async function testFarmerData() {
  console.log('🔍 Testing farmer data flow...\n');
  
  const farmerId = 'phiv8YCZYFSpb0cVgJ34m5UciIs2';
  
  try {
    // 1. Get farmer's connected dealers
    console.log('1. Checking farmer\'s connected dealers:');
    const farmerDealersQuery = query(
      collection(db, 'farmerDealers'),
      where('farmerId', '==', farmerId)
    );
    const farmerDealersSnapshot = await getDocs(farmerDealersQuery);
    
    if (farmerDealersSnapshot.empty) {
      console.log('   ❌ No connected dealers found');
      return;
    }
    
    farmerDealersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   ✅ Connected to dealer: ${data.dealerName} (${data.dealerEmail})`);
      console.log(`      Dealer ID: ${data.dealerId}`);
      console.log(`      Connected at: ${data.connectedAt?.toDate?.() || data.connectedAt}`);
    });
    
    // 2. Get products from connected dealers
    console.log('\n2. Checking products from connected dealers:');
    const dealerIds = farmerDealersSnapshot.docs.map(doc => doc.data().dealerId);
    
    for (const dealerId of dealerIds) {
      console.log(`   📦 Products from dealer ${dealerId}:`);
      const productsQuery = query(
        collection(db, 'dealerProducts'),
        where('dealerId', '==', dealerId)
      );
      const productsSnapshot = await getDocs(productsQuery);
      
      if (productsSnapshot.empty) {
        console.log('      ❌ No products found');
      } else {
        productsSnapshot.forEach(doc => {
          const product = doc.data();
          console.log(`      ✅ ${product.productName} (${product.productType})`);
          console.log(`         Price: ₹${product.pricePerUnit}/${product.unit}`);
          console.log(`         Stock: ${product.currentStock} ${product.unit}`);
          console.log(`         Supplier: ${product.supplier}`);
        });
      }
    }
    
    console.log('\n✅ Test completed! The farmer should now see real dealer products instead of demo data.');
    
  } catch (error) {
    console.error('❌ Error testing farmer data:', error);
  }
}

testFarmerData();
