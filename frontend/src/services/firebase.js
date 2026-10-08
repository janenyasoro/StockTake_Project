import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  // These are Firebase's public web-app settings. Vercel variables can override them.
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAu9gkogPf4jQdAZNhF_AhwhzsoRqFUXp4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'stockpulse-99c9a.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'stockpulse-99c9a',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'stockpulse-99c9a.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '754393837827',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:754393837827:web:7d4e9fd7374fdb249c3936'
}

const requiredFields = [
  ['VITE_FIREBASE_API_KEY', firebaseConfig.apiKey],
  ['VITE_FIREBASE_AUTH_DOMAIN', firebaseConfig.authDomain],
  ['VITE_FIREBASE_PROJECT_ID', firebaseConfig.projectId],
  ['VITE_FIREBASE_STORAGE_BUCKET', firebaseConfig.storageBucket],
  ['VITE_FIREBASE_MESSAGING_SENDER_ID', firebaseConfig.messagingSenderId],
  ['VITE_FIREBASE_APP_ID', firebaseConfig.appId],
]

export let firebaseSetupIssue = requiredFields.some(([, value]) => !value)
  ? `Add the missing Firebase settings to Vercel: ${requiredFields.filter(([, value]) => !value).map(([name]) => name).join(', ')}.`
  : ''

let app = null
export let auth = null

if (!firebaseSetupIssue) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
  } catch (error) {
    firebaseSetupIssue = error.code === 'auth/invalid-api-key'
      ? 'Firebase rejected the API key. Check that VITE_FIREBASE_API_KEY is the Web API key from the correct Firebase project.'
      : 'Firebase could not start. Check the Firebase web app settings in Vercel.'
    console.error('Firebase initialization failed:', error)
  }
}

export default app
