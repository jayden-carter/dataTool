import { auth, db } from './firebaseConfig.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Store fetched data
let fetchedData = [];

async function fetchData() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No authenticated user found.');
      fetchedData = [];
      return;
    }

    const uid = user.uid;
    let collectionName = 'coffee'; // Default to coffee
    if (uid === 'IkRSbHJJgmU1VX0o5BwnLP56VFo2') {
      collectionName = 'main';
    }

    const querySnapshot = await getDocs(collection(db, collectionName));
    fetchedData = querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Parse transaction_date (assuming both coffee and main have this field in "MM/DD/YY" format)
      if (data.transaction_date) {
        const [month, day, year] = data.transaction_date.split('/');
        const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
        data.transaction_date = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      }
      return data;
    });
    console.log(`Fetched ${collectionName} data:`, fetchedData);
  } catch (e) {
    console.error(`Error fetching data: ${e.message}`);
    fetchedData = [];
  }
}

// Monitor auth state and fetch data when user changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    fetchData();
  } else {
    fetchedData = [];
    console.log('User signed out or not authenticated.');
  }
});

// Logout functionality
document.getElementById('logout').addEventListener('click', () => {
  console.log("Logout button clicked");
  signOut(auth)
    .then(() => {
      console.log("User signed out successfully");
      window.location.href = 'login.html';
    })
    .catch((error) => {
      console.error("Error signing out:", error.message);
    });
});

export { fetchedData };