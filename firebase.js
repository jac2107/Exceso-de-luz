// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyARYSgelNGVVpOryuq0Z3YCZxoqYA8TUns",
  authDomain: "exceso-de-luz.firebaseapp.com",
  projectId: "exceso-de-luz",
  storageBucket: "exceso-de-luz.firebasestorage.app",
  messagingSenderId: "442481525938",
  appId: "1:442481525938:web:e72a2672a589e594aeb5ab",
  measurementId: "G-GLTKTGY2GG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

import { getFirestore, collection, addDoc, serverTimestamp } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore(app);
async function registrarEvento(tipo, fondoId) {
  try {
    await addDoc(collection(db, "eventos_fondos"), {
      tipo: tipo, // "view" o "download"
      fondoId: fondoId,
      fecha: serverTimestamp(),
      userAgent: navigator.userAgent
    });

    console.log("Evento guardado:", tipo, fondoId);
  } catch (error) {
    console.error("Error guardando evento:", error);
  }
}
