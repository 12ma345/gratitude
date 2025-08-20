// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, where } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDVetSMjhXkHk4Gxqi0giVCJZ_vkYs6WuQ",
  authDomain: "gratitude-jar-146b2.firebaseapp.com",
  projectId: "gratitude-jar-146b2",
  storageBucket: "gratitude-jar-146b2.appspot.com",
  messagingSenderId: "715153798034",
  appId: "1:715153798034:web:aabf4121dce960f92d474b",
  measurementId: "G-Q592470VSD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// HTML elements
const gratitudeInput = document.getElementById("gratitude-input");
const saveBtn = document.getElementById("save-btn");
const randomBtn = document.getElementById("random-btn");
const entriesList = document.getElementById("entries-list");

let currentUserId = null;

// Anonymous login
signInAnonymously(auth)
  .catch(error => console.error("Anonymous sign-in failed:", error));

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid;
    console.log("Signed in with UID:", currentUserId);
    loadEntries();
  }
});

// Save entry
saveBtn.addEventListener("click", async () => {
  if (!currentUserId) {
    alert("Signing in… please wait a moment and try again.");
    return;
  }

  const text = gratitudeInput.value.trim();
  if (!text) {
    alert("Please enter a message!");
    return;
  }

  try {
    const docRef = await addDoc(collection(db, "gratitudeEntries"), {
      userId: currentUserId,
      text,
      timestamp: Date.now()
    });

    // Add new entry to the list immediately
    const li = document.createElement("li");
    li.textContent = text;
    entriesList.prepend(li); // show newest at top
    gratitudeInput.value = "";
  } catch (error) {
    console.error("Error saving entry:", error);
  }
});

// Load entries
async function loadEntries() {
  if (!currentUserId) return;

  entriesList.innerHTML = "";
  const q = query(
    collection(db, "gratitudeEntries"),
    where("userId", "==", currentUserId),
    orderBy("timestamp", "desc")
  );

  const snapshot = await getDocs(q);
  snapshot.forEach(doc => {
    const li = document.createElement("li");
    li.textContent = doc.data().text;
    entriesList.appendChild(li);
  });
}

// Show random entry
randomBtn.addEventListener("click", async () => {
  if (!currentUserId) return;

  const q = query(
    collection(db, "gratitudeEntries"),
    where("userId", "==", currentUserId)
  );

  const snapshot = await getDocs(q);
  if (snapshot.size === 0) {
    alert("No entries yet!");
    return;
  }

  const docsArray = snapshot.docs.map(doc => doc.data());
  const randomEntry = docsArray[Math.floor(Math.random() * docsArray.length)];

  // Add random entry to the top of the list
  const li = document.createElement("li");
  li.textContent = randomEntry.text;
  entriesList.prepend(li);
  alert(randomEntry.text);
});
