import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyBfgQOTURDfIPdR6QgDEx64jr55ezyOnhc",
    authDomain: "messenger-55f41.firebaseapp.com",
    projectId: "messenger-55f41",
    storageBucket: "messenger-55f41.appspot.com",
    messagingSenderId: "722539564765",
    appId: "1:722539564765:web:295e7482b146fe79c95534",
    measurementId: "G-TW2B5FNJSF",
    databaseURL: "https://messenger-55f41-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app);

export { db, auth, provider, storage };
