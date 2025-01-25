// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbUvYrMejTOmCzbbdOwqu_TjDzvbQy9r0",
  authDomain: "agendajs-pm.firebaseapp.com",
  projectId: "agendajs-pm",
  storageBucket: "agendajs-pm.firebasestorage.app",
  messagingSenderId: "368267823655",
  appId: "1:368267823655:web:c793f4616cae44870adc02",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };