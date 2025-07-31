import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
// Replace these with your actual Firebase config values from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id", 
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

// Debug: Log config to ensure environment variables are loaded (remove in production)
if (import.meta.env.DEV) {
  console.log('Firebase Config:', {
    apiKey: firebaseConfig.apiKey ? '✓ Loaded' : '✗ Missing',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId ? '✓ Loaded' : '✗ Missing',
    appId: firebaseConfig.appId ? '✓ Loaded' : '✗ Missing'
  });
  
  // Check if we're using fallback values
  const usingFallbacks = [
    firebaseConfig.apiKey === "your-api-key",
    firebaseConfig.authDomain === "your-auth-domain",
    firebaseConfig.projectId === "your-project-id",
    firebaseConfig.storageBucket === "your-storage-bucket",
    firebaseConfig.messagingSenderId === "your-messaging-sender-id",
    firebaseConfig.appId === "your-app-id"
  ];
  
  if (usingFallbacks.some(Boolean)) {
    console.error('🚨 FIREBASE CONFIG ERROR: Using fallback values!');
    console.error('Please create a .env file with your Firebase credentials.');
    console.error('Copy .env.example to .env and fill in your values.');
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
// Add additional scopes for better user information
googleProvider.addScope('profile');
googleProvider.addScope('email');
// Configure for multi-domain support
googleProvider.setCustomParameters({
  prompt: 'select_account',
  hd: undefined // Allow any domain, not restricted to specific hosted domain
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
