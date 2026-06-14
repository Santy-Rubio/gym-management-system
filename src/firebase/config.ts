import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAjKMkxPmjZnyOsRXMV35ztw_tyCJ_Ic_E",
  authDomain: "proyectofinal-36fe4.firebaseapp.com",
  projectId: "proyectofinal-36fe4",
  storageBucket: "proyectofinal-36fe4.firebasestorage.app",
  messagingSenderId: "590576519497",
  appId: "1:590576519497:web:33dea08e2af2b4ac3a7298",
  measurementId: "G-FMQYWKD1B1"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);