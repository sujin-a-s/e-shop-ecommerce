// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAmkWqTj5Z7CNTa_zBL6mpOi-Ehj9ocA9A",
  authDomain: "e-shop-17c2d.firebaseapp.com",
  projectId: "e-shop-17c2d",
  storageBucket: "e-shop-17c2d.appspot.com",
  messagingSenderId: "407931317181",
  appId: "1:407931317181:web:6f22209956148e991380d4"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp