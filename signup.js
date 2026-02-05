// 🔥 Firebase v12 imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

// 🔥 Firebase config (APNA CONFIG YAHA PASTE KARO)
const firebaseConfig = {
  apiKey: "AIzaSyDPlU4bi3FUyv16Hm2ZKn9QaYXN__n4u5E",
    authDomain: "mylook-25be4.firebaseapp.com",
    databaseURL: "https://mylook-25be4-default-rtdb.firebaseio.com",
    projectId: "mylook-25be4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// SIGNUP FUNCTION (global banaya)
window.signup = () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  if (!name || !email || !password) {
    msg.innerText = "All fields required❌";
    msg.style.color = "red";
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const uid = userCredential.user.uid;

      // Save user data in Realtime Database
      return set(ref(db, "users/" + uid), {
        name: name,
        email: email,
        createdAt: Date.now(),
        followersCount: 0,
        followingCount: 0
      });
    })
    .then(() => {
      msg.innerText = "Signup successful ✅";
      msg.style.color = "lightgreen";

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    })
    .catch((error) => {
      msg.innerText = error.message;
      msg.style.color = "red";
    });
};



// ADDITIONAL IMAGE BY MANAS 
const cards = document.querySelectorAll(".card");

function loadImages() {
  cards.forEach(card => {
    card.src = `https://loremflickr.com/400/600/people,face?lock=${Date.now()}${Math.floor(Math.random()*1000)}`;
  });
}

setInterval(() => {
    cards.forEach(card => {
        card.src = `https://loremflickr.com/400/600/people,face?lock=${Date.now()}${Math.floor(Math.random()*1000)}`;
    });
}, 3000);
