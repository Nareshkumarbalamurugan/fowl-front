import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

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

async function fixAdminRole() {
  try {
    // The admin user ID you mentioned in the console
    const adminUserId = "jKSuUgcr9vhWvEp0bQ03NEsPVLR2";
    
    console.log('🔍 Checking admin user role...');
    
    // Check current user document
    const userRef = doc(db, 'users', adminUserId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      console.log('📋 Current user data:', userDoc.data());
      
      // Check if role is admin
      if (userDoc.data().role !== 'admin') {
        console.log('⚠️  Role is not admin, updating...');
        
        await setDoc(userRef, {
          email: 'admin@poultrymitra.com',
          displayName: 'Admin',
          role: 'admin',
          profileComplete: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
        
        console.log('✅ Admin role updated successfully!');
      } else {
        console.log('✅ Admin role is already correct!');
      }
    } else {
      console.log('⚠️  User document does not exist, creating...');
      
      await setDoc(userRef, {
        email: 'admin@poultrymitra.com',
        displayName: 'Admin',
        role: 'admin',
        profileComplete: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Admin user document created successfully!');
    }
    
    // Verify the update
    const updatedDoc = await getDoc(userRef);
    console.log('🔄 Updated user data:', updatedDoc.data());
    
  } catch (error) {
    console.error('❌ Error fixing admin role:', error);
  }
}

fixAdminRole();
