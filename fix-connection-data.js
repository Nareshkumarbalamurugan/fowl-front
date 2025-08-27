const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } = require('firebase/firestore');

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

async function fixConnectionData() {
  try {
    const connectionId = 'gLx4IutFQalTLwEPng3F';
    const dealerId = 'AfiKAc1AKWWB5qxrIbJQ80u6VXY2';
    const farmerId = 'iOWQ891KJbbArNYHHzDEkxTfJs02';
    
    console.log('Fixing connection data for connectionId:', connectionId);
    
    // Get the actual dealer and farmer profiles from users collection
    const dealerDoc = await getDoc(doc(db, 'users', dealerId));
    const farmerDoc = await getDoc(doc(db, 'users', farmerId));
    
    if (!dealerDoc.exists()) {
      console.error('Dealer not found:', dealerId);
      return;
    }
    
    if (!farmerDoc.exists()) {
      console.error('Farmer not found:', farmerId);
      return;
    }
    
    const dealerData = dealerDoc.data();
    const farmerData = farmerDoc.data();
    
    console.log('Dealer data:', {
      email: dealerData.email,
      displayName: dealerData.displayName,
      businessName: dealerData.businessName
    });
    
    console.log('Farmer data:', {
      email: farmerData.email,
      displayName: farmerData.displayName,
      farmSize: farmerData.farmSize
    });
    
    // Find and update dealerFarmers document
    const dealerFarmersQuery = query(
      collection(db, 'dealerFarmers'),
      where('connectionId', '==', connectionId)
    );
    const dealerFarmersSnapshot = await getDocs(dealerFarmersQuery);
    
    if (!dealerFarmersSnapshot.empty) {
      const dealerFarmerDoc = dealerFarmersSnapshot.docs[0];
      console.log('Updating dealerFarmers document:', dealerFarmerDoc.id);
      
      await updateDoc(dealerFarmerDoc.ref, {
        farmerEmail: farmerData.email,
        farmerName: farmerData.displayName || farmerData.email.split('@')[0],
        lastUpdated: new Date()
      });
      
      console.log('✅ Updated dealerFarmers document');
    }
    
    // Find and update farmerDealers document
    const farmerDealersQuery = query(
      collection(db, 'farmerDealers'),
      where('connectionId', '==', connectionId)
    );
    const farmerDealersSnapshot = await getDocs(farmerDealersQuery);
    
    if (!farmerDealersSnapshot.empty) {
      const farmerDealerDoc = farmerDealersSnapshot.docs[0];
      console.log('Updating farmerDealers document:', farmerDealerDoc.id);
      
      await updateDoc(farmerDealerDoc.ref, {
        dealerEmail: dealerData.email,
        dealerName: dealerData.displayName || dealerData.businessName || dealerData.email.split('@')[0],
        lastInteraction: new Date()
      });
      
      console.log('✅ Updated farmerDealers document');
    }
    
    console.log('🎉 Connection data fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing connection data:', error);
  }
}

fixConnectionData();
