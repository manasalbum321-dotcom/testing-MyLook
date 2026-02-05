// 🔥 Firebase v12 imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getDatabase, ref, get, update } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

// 🔥 Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDPlU4bi3FUyv16Hm2ZKn9QaYXN__n4u5E",
    authDomain: "mylook-25be4.firebaseapp.com",
    databaseURL: "https://mylook-25be4-default-rtdb.firebaseio.com",
    projectId: "mylook-25be4",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// DOM
const nameInput = document.getElementById("name");

nameInput.addEventListener("input", (e) => {
  e.target.value = e.target.value
    .replace(/[^a-zA-Z ]/g, "")
    .slice(0, 22);
});

const usernameInput = document.getElementById("username");

usernameInput.addEventListener("input", (e) => {
  e.target.value = e.target.value
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 8);
});

const bioInput = document.getElementById("bio");

bioInput.addEventListener("input", (e) => {
  e.target.value = e.target.value
    // remove numbers & symbols, keep letters + space + emoji
    .replace(/[.]/g, "")
    // limit length
    .slice(0, 60);
});

// CHECK CHARECTERS COUNT BIO
bioInput.addEventListener("input", () => {
  document.getElementById("bioCount").innerText =
    bioInput.value.length + " / 40";
});

const emailInput = document.getElementById("email");

const dpInput = document.getElementById("dp");
const profileImg = document.getElementById("profileImg");
const navProfilePic = document.getElementById("navProfilePic");

// 🔐 Auth check + load data
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  emailInput.value = user.email;

  const snap = await get(ref(db, "users/" + user.uid));
  if (snap.exists()) {
    const data = snap.val();

    nameInput.value = data.name || "";
    usernameInput.value = data.username || "";
    bioInput.value = data.bio || "";

    if (data.profilePic) {
      profileImg.src = data.profilePic;
      navProfilePic.src = data.profilePic;
    }
  }
});

// 🖼 Image → Base64 → Realtime DB
dpInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    const base64Image = reader.result;
    const user = auth.currentUser;

    await update(ref(db, "users/" + user.uid), {
      profilePic: base64Image
    });

    profileImg.src = base64Image;
    navProfilePic.src = base64Image;
  };
  reader.readAsDataURL(file);
});


// 💾 Save profile info
document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

//   CHECK CODE CHARECTERS BEFORE SUBMIT
if (nameInput.value.length > 22) {
  alert("Name max 22 alphabets ❌");
  return;
}

if (usernameInput.value.length > 8) {
  alert("Username max 8 alphabets ❌");
  return;
}

if (bioInput.value.length > 40) {
  alert("Bio max 40 alphabets ❌");
  return;
}


  const user = auth.currentUser;
  if (!user) return;

  await update(ref(db, "users/" + user.uid), {
    name: nameInput.value.trim(),
    username: usernameInput.value.trim(),
    bio: bioInput.value.trim()
  });
   
  alert("Profile updated ✅");
   window.location.href = "profile.html";
});
