import { db } from './firebase';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

// Test Firestore connection and permissions
export const testFirestoreConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Testing Firestore connection...');
    
    // Try to write a test document
    const testDoc = doc(db, 'test', 'connection');
    await setDoc(testDoc, { 
      timestamp: new Date().toISOString(),
      message: 'Connection test successful' 
    });
    
    // Try to read it back
    const docSnap = await getDoc(testDoc);
    if (docSnap.exists()) {
      console.log('Firestore connection successful!');
      return { success: true };
    } else {
      return { success: false, error: 'Could not read test document' };
    }
  } catch (error: any) {
    console.error('Firestore connection test failed:', error);
    
    if (error.code === 'permission-denied') {
      return { 
        success: false, 
        error: 'Permission denied. Please set Firestore security rules to allow authenticated access.' 
      };
    } else if (error.code === 'unavailable') {
      return { 
        success: false, 
        error: 'Firestore is not available. Please enable Firestore database in Firebase console.' 
      };
    } else {
      return { 
        success: false, 
        error: `Firestore error: ${error.message}` 
      };
    }
  }
};

// Check if collections exist
export const checkCollections = async (): Promise<{ users: number; appointments: number; timeSlots: number }> => {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const appointmentsSnap = await getDocs(collection(db, 'appointments'));
    const timeSlotsSnap = await getDocs(collection(db, 'timeSlots'));
    
    return {
      users: usersSnap.size,
      appointments: appointmentsSnap.size,
      timeSlots: timeSlotsSnap.size
    };
  } catch (error) {
    console.error('Error checking collections:', error);
    return { users: 0, appointments: 0, timeSlots: 0 };
  }
};

// Get Firestore setup instructions
export const getFirestoreSetupInstructions = () => {
  return {
    title: 'Firebase Firestore Setup Required',
    steps: [
      {
        step: 1,
        title: 'Enable Firestore Database',
        description: 'Go to Firebase Console → Firestore Database → Create database → Start in test mode',
        url: `https://console.firebase.google.com/project/week-3-fcfa8/firestore`
      },
      {
        step: 2,
        title: 'Set Security Rules',
        description: 'In Firestore → Rules tab, replace with:\n\nrules_version = "2";\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if request.auth != null;\n    }\n  }\n}',
        url: `https://console.firebase.google.com/project/week-3-fcfa8/firestore/rules`
      },
      {
        step: 3,
        title: 'Enable Authentication',
        description: 'Go to Authentication → Sign-in method → Enable Email/Password',
        url: `https://console.firebase.google.com/project/week-3-fcfa8/authentication/providers`
      }
    ]
  };
};