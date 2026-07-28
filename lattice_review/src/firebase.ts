import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "gen-lang-client-0577951303",
  appId: "1:563425104961:web:68a17f9b8190a3ae4c22c0",
  apiKey: "AIzaSyA92a36Wn7j83H5ff6muZTXAPKJNkaziXU",
  authDomain: "gen-lang-client-0577951303.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-codebaseconsiste-f1730869-d1fd-43f1-a6a3-08368bcb1a2d",
  storageBucket: "gen-lang-client-0577951303.firebasestorage.app",
  messagingSenderId: "563425104961",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
