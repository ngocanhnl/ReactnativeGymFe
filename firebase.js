// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore} from 'firebase/firestore';
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBHI91Pupwnx5Sck8M9E7Y1Uskn1ASe6Js",
  authDomain: "courseapp-9ea1e.firebaseapp.com",
  databaseURL: "https://courseapp-9ea1e-default-rtdb.firebaseio.com/",
  projectId: "courseapp-9ea1e",
  storageBucket: "courseapp-9ea1e.appspot.com",
  messagingSenderId: "1093403127439",
  appId: "1:1093403127439:web:09ac3a8d9a20a2f1d60afa",
  measurementId: "G-F6YVGLMCN3"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db,auth, app };