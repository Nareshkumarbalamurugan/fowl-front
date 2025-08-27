import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

// Load Firebase config
const serviceAccount = JSON.parse(readFileSync('./service-account-key.json', 'utf8'));

// Initialize Firebase
const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyAJBH_PVRcK2va6X_cXuVHTRchMrBvm7HM',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'poultrymitra-9221e.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'poultrymitra-9221e',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'poultrymitra-9221e.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '577769606246',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:577769606246:web:eeb6d0e2e23fdc22b0b1a7'
});

const db = getFirestore(app);

async function testCurrentConnection() {
  console.log('🧪 Testing Current Connection Setup\n');
  
  const dealerId = 'LCgRwFjsWbcIyEuIoUabj63OjwH3';
  const farmerId = 'MsoZtLFGmnhp7RLO6AdwVvNbW3q1';
  const inviteCode = 'LCgRwFjsWbcIyEuIoUabj63OjwH3_1754019313790_r6rdzb54o';
  
  try {
    // 1. Test dealer information lookup
    console.log('📋 1. Testing Dealer Information Lookup');
    console.log(`   Dealer ID: ${dealerId}`);
    
    // Check users collection
    const userDoc = await getDoc(doc(db, 'users', dealerId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('   ✅ Found dealer in users collection:');
      console.log(`      - Display Name: ${userData.displayName}`);
      console.log(`      - Business Name: ${userData.businessName}`);
      console.log(`      - Email: ${userData.email}`);
      console.log(`      - Role: ${userData.role}`);
    } else {
      console.log('   ❌ Dealer not found in users collection');
    }
    
    // Check dealers collection
    const dealerDoc = await getDoc(doc(db, 'dealers', dealerId));
    if (dealerDoc.exists()) {
      const dealerData = dealerDoc.data();
      console.log('   ✅ Found dealer in dealers collection:');
      console.log(`      - Business Name: ${dealerData.businessName}`);
      console.log(`      - Owner Name: ${dealerData.ownerName}`);
      console.log(`      - Email: ${dealerData.email}`);
    } else {
      console.log('   ⚠️ Dealer not found in dealers collection');
    }
    
    // 2. Test invitation code validation
    console.log('\n📋 2. Testing Invitation Code Validation');
    console.log(`   Invite Code: ${inviteCode}`);
    
    const invitationQuery = query(
      collection(db, 'dealerInvitations'),
      where('inviteCode', '==', inviteCode)
    );
    
    const invitationSnapshot = await getDocs(invitationQuery);
    
    if (!invitationSnapshot.empty) {
      const invitationData = invitationSnapshot.docs[0].data();
      console.log('   ✅ Found invitation:');
      console.log(`      - Dealer ID: ${invitationData.dealerId}`);
      console.log(`      - Dealer Name: ${invitationData.dealerName}`);
      console.log(`      - Dealer Email: ${invitationData.dealerEmail}`);
      console.log(`      - Is Active: ${invitationData.isActive}`);
      console.log(`      - Expires At: ${invitationData.expiresAt?.toDate()}`);
      console.log(`      - Used By: ${invitationData.usedBy}`);
      console.log(`      - Used At: ${invitationData.usedAt?.toDate()}`);
      
      // Test our validation logic
      console.log('\n   🔍 Testing validation logic...');
      let dealerName = invitationData.dealerName || invitationData.displayName || 'Unknown Dealer';
      let dealerEmail = invitationData.dealerEmail || invitationData.email;
      
      console.log(`   Initial name from invitation: ${dealerName}`);
      console.log(`   Initial email from invitation: ${dealerEmail}`);
      
      // Try to get updated dealer profile
      const dealerProfileDoc = await getDoc(doc(db, 'dealers', invitationData.dealerId));
      if (dealerProfileDoc.exists()) {
        const dealerProfile = dealerProfileDoc.data();
        dealerName = dealerProfile.businessName || dealerProfile.ownerName || dealerName;
        dealerEmail = dealerProfile.email || dealerEmail;
        console.log(`   ✅ Updated from dealers collection: ${dealerName}`);
      } else {
        // Fallback to users collection
        const userDoc = await getDoc(doc(db, 'users', invitationData.dealerId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          dealerName = userData.displayName || userData.businessName || userData.email?.split('@')[0] || dealerName;
          dealerEmail = userData.email || dealerEmail;
          console.log(`   ✅ Updated from users collection: ${dealerName}`);
        }
      }
      
      console.log(`   Final dealer name: ${dealerName}`);
      console.log(`   Final dealer email: ${dealerEmail}`);
    } else {
      console.log('   ❌ Invitation not found');
    }
    
    // 3. Test farmer information
    console.log('\n📋 3. Testing Farmer Information');
    console.log(`   Farmer ID: ${farmerId}`);
    
    const farmerDoc = await getDoc(doc(db, 'users', farmerId));
    if (farmerDoc.exists()) {
      const farmerData = farmerDoc.data();
      console.log('   ✅ Found farmer in users collection:');
      console.log(`      - Display Name: ${farmerData.displayName}`);
      console.log(`      - Email: ${farmerData.email}`);
      console.log(`      - Role: ${farmerData.role}`);
    } else {
      console.log('   ❌ Farmer not found in users collection');
    }
    
    // 4. Test existing connections
    console.log('\n📋 4. Testing Existing Connections');
    
    const connectionsQuery = query(
      collection(db, 'connections'),
      where('farmerId', '==', farmerId),
      where('dealerId', '==', dealerId)
    );
    
    const connectionsSnapshot = await getDocs(connectionsQuery);
    
    if (!connectionsSnapshot.empty) {
      console.log('   ✅ Found existing connections:');
      connectionsSnapshot.forEach((doc, index) => {
        const connData = doc.data();
        console.log(`   Connection ${index + 1}:`);
        console.log(`      - Status: ${connData.status}`);
        console.log(`      - Dealer Name: ${connData.dealerName}`);
        console.log(`      - Farmer Name: ${connData.farmerName}`);
        console.log(`      - Connection Date: ${connData.connectionDate?.toDate()}`);
      });
    } else {
      console.log('   ⚠️ No connections found');
    }
    
    // 5. Test dealer-farmer relationships
    console.log('\n📋 5. Testing Dealer-Farmer Relationships');
    
    const dealerFarmersQuery = query(
      collection(db, 'dealerFarmers'),
      where('dealerId', '==', dealerId),
      where('farmerId', '==', farmerId)
    );
    
    const dealerFarmersSnapshot = await getDocs(dealerFarmersQuery);
    
    if (!dealerFarmersSnapshot.empty) {
      console.log('   ✅ Found dealerFarmers records:');
      dealerFarmersSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   Record ${index + 1}:`);
        console.log(`      - Farmer Name: ${data.farmerName}`);
        console.log(`      - Farmer Email: ${data.farmerEmail}`);
      });
    } else {
      console.log('   ⚠️ No dealerFarmers records found');
    }
    
    const farmerDealersQuery = query(
      collection(db, 'farmerDealers'),
      where('farmerId', '==', farmerId),
      where('dealerId', '==', dealerId)
    );
    
    const farmerDealersSnapshot = await getDocs(farmerDealersQuery);
    
    if (!farmerDealersSnapshot.empty) {
      console.log('   ✅ Found farmerDealers records:');
      farmerDealersSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   Record ${index + 1}:`);
        console.log(`      - Dealer Name: ${data.dealerName}`);
        console.log(`      - Dealer Email: ${data.dealerEmail}`);
      });
    } else {
      console.log('   ⚠️ No farmerDealers records found');
    }
    
    console.log('\n✅ Connection test completed!');
    
  } catch (error) {
    console.error('❌ Error testing connection:', error);
  }
}

// Run the test
testCurrentConnection().then(() => {
  console.log('\n🏁 Test finished');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
