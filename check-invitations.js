// Check dealer invitations and create test invitation
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyAJBH_PVRcK2va6X_cXuVHTRchMrBvm7HM',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'poultrymitra-9221e.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'poultrymitra-9221e',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'poultrymitra-9221e.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '577769606246',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:577769606246:web:eeb6d0e2e23fdc22b0b1a7'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkInvitations() {
  console.log('🔍 Checking dealer invitations...');
  
  try {
    // Check all dealer invitations
    const invitationsSnapshot = await getDocs(collection(db, 'dealerInvitations'));
    console.log(`Found ${invitationsSnapshot.docs.length} invitation records`);
    
    invitationsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`Invitation: ${data.inviteCode} - Active: ${data.isActive} - Dealer: ${data.dealerId}`);
    });
    
    // Check if we have any dealers
    const dealersSnapshot = await getDocs(collection(db, 'users'));
    const dealers = [];
    dealersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.role === 'dealer') {
        dealers.push({ id: doc.id, ...data });
      }
    });
    
    console.log(`Found ${dealers.length} dealers:`);
    dealers.forEach(dealer => {
      console.log(`- ${dealer.displayName || 'Unknown'} (${dealer.email}) - ID: ${dealer.id || dealer.uid}`);
    });
    
    // Create a test invitation if we have dealers but no invitations
    if (dealers.length > 0 && invitationsSnapshot.docs.length === 0) {
      const dealer = dealers[0];
      const inviteCode = `DEALER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      console.log('🔧 Creating test invitation...');
      await addDoc(collection(db, 'dealerInvitations'), {
        dealerId: dealer.id || dealer.uid,
        dealerName: dealer.displayName || 'Test Dealer',
        dealerEmail: dealer.email,
        inviteCode: inviteCode,
        isActive: true,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });
      
      console.log(`✅ Created invitation code: ${inviteCode}`);
      console.log(`🔗 Test URL: http://localhost:8080/farmer-connect?code=${inviteCode}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkInvitations();
