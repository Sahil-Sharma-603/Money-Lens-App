// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBNHqYOhOP8O1Zm22S9_dNiXR9Kt5u6EHg",
  authDomain: "money-leanalyticsns.firebaseapp.com",
  projectId: "money-lens",
  storageBucket: "money-lens.firebasestorage.app",
  messagingSenderId: "395810291325",
  appId: "1:395810291325:web:cc245c225e1bcabd61fb14",
  measurementId: "G-EYMS233WC7"
};

//Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
//const analytics = getAnalytics(firebaseApp);
const auth = getAuth(firebaseApp);

export {firebaseApp,auth};
