import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set } from "firebase/database"


const firebaseConfig = {
    apiKey: "AIzaSyDcacpYTrShmiUcGm8NgXucH6IRNlr3L5E",
    authDomain: "synq-data.firebaseapp.com",
    projectId: "synq-data",
    storageBucket: "synq-data.firebasestorage.app",
    messagingSenderId: "666582373055",
    appId: "1:666582373055:web:48a69368feb8c16ab52c0a",
    measurementId: "G-2E8MH39H3E"
  };

const app = initializeApp(firebaseConfig);


function writeUserData(userId, name, email, imageUrl){
  const db = getDatabase();
  const reference = ref(db, 'users/' + userId);
  set(reference, {
    username: name,
    email: email,
    profile_picture : imageUrl
  });
}

writeUserData("cart", "Cart", "jcarter6810@gmail.com", "image")