import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  query,
  where
} from 'firebase/firestore';

// Firebase config
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

async function updateFarmerDealerContacts() {
  console.log('🔄 Updating existing farmer-dealer connections with contact information...\n');
  
  try {
    // Get all farmerDealers records
    const farmerDealersSnapshot = await getDocs(collection(db, 'farmerDealers'));
    
    if (farmerDealersSnapshot.empty) {
      console.log('No farmer-dealer connections found.');
      return;
    }
    
    console.log(`Found ${farmerDealersSnapshot.size} farmer-dealer connections to update.\n`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const farmerDealerDoc of farmerDealersSnapshot.docs) {
      const farmerDealerData = farmerDealerDoc.data();
      const dealerId = farmerDealerData.dealerId;
      
      console.log(`Processing connection for dealer: ${dealerId}`);
      
      // Check if this record already has phone information
      if (farmerDealerData.dealerPhone) {
        console.log(`  ✓ Already has phone: ${farmerDealerData.dealerPhone}`);
        skippedCount++;
        continue;
      }
      
      // Try to get dealer profile information
      let dealerPhone = '';
      let dealerAddress = '';
      let dealerCompany = '';
      
      try {
        // First try dealers collection
        const dealerProfileDoc = await getDoc(doc(db, 'dealers', dealerId));
        if (dealerProfileDoc.exists()) {
          const dealerProfile = dealerProfileDoc.data();
          dealerPhone = dealerProfile.phone || '';
          dealerAddress = dealerProfile.address || '';
          dealerCompany = dealerProfile.businessName || '';
          console.log(`  📞 Found in dealers: ${dealerPhone || 'no phone'}`);
        } else {
          // Fallback to users collection
          const userDoc = await getDoc(doc(db, 'users', dealerId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            dealerPhone = userData.phone || '';
            dealerAddress = userData.address || '';
            dealerCompany = userData.businessName || userData.displayName || '';
            console.log(`  📞 Found in users: ${dealerPhone || 'no phone'}`);
          } else {
            console.log(`  ❌ No dealer profile found for: ${dealerId}`);
            continue;
          }
        }
        
        // Update the farmerDealer record with contact information
        const updates = {};
        if (dealerPhone) updates.dealerPhone = dealerPhone;
        if (dealerAddress) updates.dealerAddress = dealerAddress;
        if (dealerCompany) updates.dealerCompany = dealerCompany;
        
        if (Object.keys(updates).length > 0) {
          await updateDoc(farmerDealerDoc.ref, updates);
          console.log(`  ✅ Updated with: phone=${dealerPhone || 'none'}, company=${dealerCompany || 'none'}`);
          updatedCount++;
        } else {
          console.log(`  ⚠️ No contact info to update`);
          skippedCount++;
        }
        
      } catch (error) {
        console.error(`  ❌ Error processing dealer ${dealerId}:`, error);
      }
      
      console.log(''); // Empty line for readability
    }
    
    console.log('\n📊 Update Summary:');
    console.log(`✅ Updated: ${updatedCount} connections`);
    console.log(`⏭️ Skipped: ${skippedCount} connections`);
    console.log(`📝 Total: ${farmerDealersSnapshot.size} connections`);
    
  } catch (error) {
    console.error('❌ Error updating farmer-dealer contacts:', error);
  }
}

// Run the update
updateFarmerDealerContacts().then(() => {
  console.log('\n🏁 Update completed!');
  process.exit(0);
}).catch(error => {
  console.error('Update failed:', error);
  process.exit(1);
});
