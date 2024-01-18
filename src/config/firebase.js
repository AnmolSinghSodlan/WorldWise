import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCfx7eeTFC3NSVF-u8sfaEGVuOFfYoqejs",
  authDomain: "worldwise-3a9f5.firebaseapp.com",
  projectId: "worldwise-3a9f5",
  storageBucket: "worldwise-3a9f5.appspot.com",
  messagingSenderId: "124038663939",
  appId: "1:124038663939:web:5ebcabe21cc6ad30552336",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
