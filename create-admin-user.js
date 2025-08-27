import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAJBH_PVRcK2va6X_cXuVHTRchMrBvm7HM',
  authDomain: 'poultrymitra-9221e.firebaseapp.com',
  projectId: 'poultrymitra-9221e',
  storageBucket: 'poultrymitra-9221e.firebasestorage.app',
  messagingSenderId: '577769606246',
  appId: '1:577769606246:web:eeb6d0e2e23fdc22b0b1a7'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser() {
  // Set a timeout to prevent hanging
  const timeout = setTimeout(() => {
    console.log('⏰ Script timeout - exiting...');
    process.exit(1);
  }, 30000); // 30 seconds timeout

  try {
    const email = 'admin@poultrymitra.com';
    const password = 'Admin@123';
    const displayName = 'Admin';
    
    console.log('🔐 Creating admin user:', email);
    
    // Create the user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ User account created with UID:', user.uid);
    
    // Update the display name
    await updateProfile(user, {
      displayName: displayName
    });
    
    console.log('✅ Display name updated');
    
    // Create user profile in Firestore
    const userProfile = {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      role: 'admin',
      createdAt: new Date(),
      lastActive: new Date(),
      profileComplete: true
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    console.log('✅ User profile created in Firestore');
    console.log('🎉 Admin user created successfully!');
    console.log('📋 Admin Details:', {
      email: email,
      password: password,
      uid: user.uid,
      role: 'admin'
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  Email already exists. Trying to get existing user info...');
      
      try {
        // If user already exists, just update their profile to admin
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        console.log('✅ Signed in to existing account:', user.uid);
        
        // Update profile to admin
        const userProfile = {
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          role: 'admin',
          lastActive: new Date(),
          profileComplete: true
        };
        
        await setDoc(doc(db, 'users', user.uid), userProfile, { merge: true });
        
        console.log('✅ Updated existing user to admin role');
        console.log('🎉 Admin user ready!');
        console.log('📋 Admin Details:', {
          email: email,
          password: password,
          uid: user.uid,
          role: 'admin'
        });
        
        process.exit(0);
        
      } catch (signInError) {
        console.error('❌ Could not sign in to existing account:', signInError);
        console.log('💡 The email might already exist with a different password.');
        console.log('💡 Try logging in with the existing credentials or reset the password.');
      }
    } else if (error.code === 'auth/weak-password') {
      console.error('❌ Password is too weak. Please use a stronger password.');
    } else if (error.code === 'auth/invalid-email') {
      console.error('❌ Invalid email address format.');
    } else {
      console.error('❌ Unknown error:', error.message);
    }
    
    process.exit(1);
  }
}

createAdminUser();
