import { initializeApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
    listAll
} from 'firebase/storage';

// Your Firebase configuration from Firebase Console
// Get this from: Firebase Console → Project Settings → General → Your apps → Config
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// ==========================================
// AUTHENTICATION FUNCTIONS
// ==========================================

// Sign in with Google
const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        console.log('User signed in:', user);
        return { user, error: null };
    } catch (error) {
        console.error('Error signing in with Google:', error);
        return { user: null, error: error.message };
    }
};

// Sign up with email and password
const signUpWithEmail = async (email, password, displayName) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Update profile with display name
        if (displayName) {
            await updateProfile(result.user, { displayName });
        }
        console.log('User signed up:', result.user);
        return { user: result.user, error: null };
    } catch (error) {
        console.error('Error signing up:', error);
        return { user: null, error: error.message };
    }
};

// Sign in with email and password
const signInWithEmail = async (email, password) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log('User signed in:', result.user);
        return { user: result.user, error: null };
    } catch (error) {
        console.error('Error signing in:', error);
        return { user: null, error: error.message };
    }
};

// Sign out
const signOutUser = async () => {
    try {
        await signOut(auth);
        console.log('User signed out');
        return { error: null };
    } catch (error) {
        console.error('Error signing out:', error);
        return { error: error.message };
    }
};

// Reset password
const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        console.log('Password reset email sent');
        return { error: null };
    } catch (error) {
        console.error('Error sending reset email:', error);
        return { error: error.message };
    }
};

// Get current user
const getCurrentUser = () => {
    return auth.currentUser;
};

// Auth state observer
const onAuthStateChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// ==========================================
// FIRESTORE FUNCTIONS
// ==========================================

// Create a document
const createDocument = async (collectionName, data, id = null) => {
    try {
        const collectionRef = collection(db, collectionName);
        let docRef;
        if (id) {
            docRef = doc(collectionRef, id);
            await setDoc(docRef, {
                ...data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        } else {
            docRef = await addDoc(collectionRef, {
                ...data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        }
        return { id: docRef.id, error: null };
    } catch (error) {
        console.error('Error creating document:', error);
        return { id: null, error: error.message };
    }
};

// Get a document
const getDocument = async (collectionName, id) => {
    try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
        } else {
            return { data: null, error: 'Document not found' };
        }
    } catch (error) {
        console.error('Error getting document:', error);
        return { data: null, error: error.message };
    }
};

// Update a document
const updateDocument = async (collectionName, id, data) => {
    try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
        return { error: null };
    } catch (error) {
        console.error('Error updating document:', error);
        return { error: error.message };
    }
};

// Delete a document
const deleteDocument = async (collectionName, id) => {
    try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
        return { error: null };
    } catch (error) {
        console.error('Error deleting document:', error);
        return { error: error.message };
    }
};

// Query documents
const queryDocuments = async (collectionName, conditions = [], orderByField = null, orderDirection = 'asc', limitTo = null) => {
    try {
        const collectionRef = collection(db, collectionName);
        let q = collectionRef;

        // Add where conditions
        conditions.forEach(condition => {
            q = query(q, where(condition.field, condition.operator, condition.value));
        });

        // Add order by
        if (orderByField) {
            q = query(q, orderBy(orderByField, orderDirection));
        }

        // Add limit
        if (limitTo) {
            q = query(q, limit(limitTo));
        }

        const querySnapshot = await getDocs(q);
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
        });
        return { data, error: null };
    } catch (error) {
        console.error('Error querying documents:', error);
        return { data: null, error: error.message };
    }
};

// Real-time listener for a document
const listenToDocument = (collectionName, id, callback) => {
    const docRef = doc(db, collectionName, id);
    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback({ data: { id: docSnap.id, ...docSnap.data() }, error: null });
        } else {
            callback({ data: null, error: 'Document not found' });
        }
    });
};

// Real-time listener for a collection
const listenToCollection = (collectionName, callback, conditions = []) => {
    const collectionRef = collection(db, collectionName);
    let q = collectionRef;

    conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
    });

    return onSnapshot(q, (querySnapshot) => {
        const data = [];
        querySnapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
        });
        callback({ data, error: null });
    });
};

// ==========================================
// STORAGE FUNCTIONS
// ==========================================

// Upload a file
const uploadFile = async (path, file) => {
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return { url: downloadURL, error: null };
    } catch (error) {
        console.error('Error uploading file:', error);
        return { url: null, error: error.message };
    }
};

// Delete a file
const deleteFile = async (path) => {
    try {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
        return { error: null };
    } catch (error) {
        console.error('Error deleting file:', error);
        return { error: error.message };
    }
};

// List files in a folder
const listFiles = async (folderPath) => {
    try {
        const storageRef = ref(storage, folderPath);
        const result = await listAll(storageRef);
        const files = result.items.map(item => item.name);
        return { files, error: null };
    } catch (error) {
        console.error('Error listing files:', error);
        return { files: null, error: error.message };
    }
};

// ==========================================
// EXPORTS
// ==========================================

// Export app instance
export { app };

// Export auth functions
export {
    auth,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    signOutUser,
    resetPassword,
    getCurrentUser,
    onAuthStateChange,
    googleProvider
};

// Export Firestore functions
export {
    db,
    createDocument,
    getDocument,
    updateDocument,
    deleteDocument,
    queryDocuments,
    listenToDocument,
    listenToCollection,
    collection,
    doc,
    serverTimestamp
};

// Export Storage functions
export {
    storage,
    uploadFile,
    deleteFile,
    listFiles,
    ref,
    getDownloadURL
};

// Default export
export default {
    app,
    auth,
    db,
    storage,
    googleProvider,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    signOutUser,
    resetPassword,
    getCurrentUser,
    onAuthStateChange,
    createDocument,
    getDocument,
    updateDocument,
    deleteDocument,
    queryDocuments,
    listenToDocument,
    listenToCollection,
    uploadFile,
    deleteFile,
    listFiles,
    collection,
    doc,
    ref,
    getDownloadURL,
    serverTimestamp
};