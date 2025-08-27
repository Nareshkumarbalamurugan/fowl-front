const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, query, where, getDocs } = require('firebase/firestore');

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

async function checkConnectionData() {
  try {
    const connectionId = 'gLx4IutFQalTLwEPng3F';
    const dealerId = 'AfiKAc1AKWWB5qxrIbJQ80u6VXY2';
    const farmerId = 'iOWQ891KJbbArNYHHzDEkxTfJs02';
    
    console.log('=== CHECKING USER PROFILES ===');
    
    // Check dealer profile
    const dealerDoc = await getDoc(doc(db, 'users', dealerId));
    if (dealerDoc.exists()) {
      console.log('Dealer Profile:', JSON.stringify(dealerDoc.data(), null, 2));
    } else {
      console.log('❌ Dealer profile not found');
    }
    
    // Check farmer profile
    const farmerDoc = await getDoc(doc(db, 'users', farmerId));
    if (farmerDoc.exists()) {
      console.log('Farmer Profile:', JSON.stringify(farmerDoc.data(), null, 2));
    } else {
      console.log('❌ Farmer profile not found');
    }
    
    console.log('\n=== CHECKING CONNECTION DOCUMENTS ===');
    
    // Check dealerFarmers collection
    const dealerFarmersQuery = query(
      collection(db, 'dealerFarmers'),
      where('connectionId', '==', connectionId)
    );
    const dealerFarmersSnapshot = await getDocs(dealerFarmersQuery);
    
    if (!dealerFarmersSnapshot.empty) {
      dealerFarmersSnapshot.forEach(doc => {
        console.log('DealerFarmers Doc ID:', doc.id);
        console.log('DealerFarmers Data:', JSON.stringify(doc.data(), null, 2));
      });
    }
    
    // Check farmerDealers collection
    const farmerDealersQuery = query(
      collection(db, 'farmerDealers'),
      where('connectionId', '==', connectionId)
    );
    const farmerDealersSnapshot = await getDocs(farmerDealersQuery);
    
    if (!farmerDealersSnapshot.empty) {
      farmerDealersSnapshot.forEach(doc => {
        console.log('FarmerDealers Doc ID:', doc.id);
        console.log('FarmerDealers Data:', JSON.stringify(doc.data(), null, 2));
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkConnectionData();
