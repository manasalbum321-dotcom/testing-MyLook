// 🔥 Firebase v12 imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// 🔥 Firebase config (same as signup)
const firebaseConfig = {
    apiKey: "AIzaSyDPlU4bi3FUyv16Hm2ZKn9QaYXN__n4u5E",
    authDomain: "mylook-25be4.firebaseapp.com",
    databaseURL: "https://mylook-25be4-default-rtdb.firebaseio.com",
    projectId: "mylook-25be4",
    appId: "1:334983389196:web:6932156aae4a7a14e2ce29",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔐 LOGIN FUNCTION
window.login = () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  if (!email || !password) {
    msg.innerText = "Email & Password required ❌";
    msg.style.color = "red";
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      msg.style.color = "lightgreen";
      msg.innerText = "Login successful ✅";

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    })
    .catch((error) => {
      msg.style.color = "red";
      msg.innerText = error.message;
    });
};

// 🔁 AUTO REDIRECT (already logged-in user)
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "index.html";
  }
});


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


// PASSWORD RESET CODE BY MANAS 

// 📩 Reset password function
window.reset = function () {
  const email = document.getElementById("email").value.trim();
  const msg = document.getElementById("msg");

  msg.textContent = "";
  
  if (!email) {
    msg.textContent = "Please enter your email";
    msg.style.color = "red";
    return;
  }

  sendPasswordResetEmail(auth, email)
    .then(() => {
      msg.textContent = "Password reset link sent to your email 📧";
      msg.style.color = "green";
    })
    .catch((error) => {

      // 🔥 Custom error handling
      if (error.code === "auth/user-not-found") {
        msg.textContent = "User does not exist ❌";
      } else if (error.code === "auth/invalid-email") {
        msg.textContent = "Invalid email address";
      } else {
        msg.textContent = error.message;
      }

      msg.style.color = "red";
    });
};