import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  remove,
  get
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

/* 🔥 FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyBkH7gqLLLtvQfH8buj4LJmlIN9ypu4_Hc",
    authDomain: "mylook-testing.firebaseapp.com",
    projectId: "mylook-testing",
    storageBucket: "mylook-testing.firebasestorage.app",
    messagingSenderId: "326729149691",
    appId: "1:326729149691:web:bbf601f07589912734d45e",
    measurementId: "G-QGME0V3Q8S"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

/* 🔐 AUTH CHECK */
onAuthStateChanged(auth, (user) => {
  if (!user) return;
  const uid = user.uid;

  loadProfile(uid);
  loadFollowers(uid);
});

/* 👤 LOAD PROFILE */
function loadProfile(uid) {
  const userRef = ref(db, "users/" + uid);

  onValue(userRef, (snapshot) => {
    if (!snapshot.exists()) return;
    const data = snapshot.val();

    const profilePic = document.getElementById("profilePic");
    if (profilePic && data.profilePic) profilePic.src = data.profilePic;

    const navProfilePic = document.getElementById("navProfilePic");
    if (navProfilePic && data.profilePic) navProfilePic.src = data.profilePic;

    if (document.getElementById("name"))
      document.getElementById("name").innerText = data.name || "";

    if (document.getElementById("username"))
      document.getElementById("username").innerText = "@" + (data.username || "");
  });
}

/* 🔔 LOAD FOLLOWERS */
function loadFollowers(myUid) {
  const container = document.getElementById("notifications");
  if (!container) return;

  const followersRef = ref(db, "followers/" + myUid);

  onValue(followersRef, (snapshot) => {
    container.innerHTML = "";

    if (!snapshot.exists()) {
      container.innerHTML = "<p>No followers</p>";
      return;
    }

    snapshot.forEach((child) => {
      const followerUid = child.key;
      renderFollower(container, myUid, followerUid);
    });
  });
}

/* 🧱 RENDER FOLLOWER CARD WITH REMOVE BUTTON (Your exact template) */
function renderFollower(container, myUid, followerUid) {
  const userRef = ref(db, "users/" + followerUid);

  onValue(userRef, async (snap) => {
    if (!snap.exists()) return;
    const u = snap.val();

    const div = document.createElement("div");
    div.className = "request-card";

    div.innerHTML = `
      <div class="notify-box">
        <img class="profile-pic" src="${u.profilePic || "https://i.pravatar.cc/100"}">

        <div class="info">
          <div class="name-line">
            <b>${u.name || "User"}</b>
            <img
              class="verified-badge"
              src="https://upload.wikimedia.org/wikipedia/commons/e/e4/Twitter_Verified_Badge.svg"
              style="display:none;width:16px;height:16px;vertical-align:middle;margin-left:4px"
            >
          </div>
          <span>started following you</span>
        </div>

        <div class="actions">
          <button class="reject">Remove</button>
        </div>
      </div>
    `;

    /* ✅ VERIFIED CHECK */
    const badge = div.querySelector(".verified-badge");
    const verifySnap = await get(ref(db, "verificationRequests/" + followerUid));
    if (verifySnap.exists() && verifySnap.val().status === "approved") {
      badge.style.display = "inline-block";
    }

    /* 👉 OPEN PROFILE */
    div.onclick = () => {
      window.location.href = `profile.html?uid=${followerUid}`;
    };

    /* ❌ REMOVE FOLLOWER */
    div.querySelector(".reject").addEventListener("click", (e) => {
      e.stopPropagation(); // profile open na ho
      remove(ref(db, `followers/${myUid}/${followerUid}`))
        .then(() => div.remove())
        .catch(console.error);
    });

    container.appendChild(div);

  }, { onlyOnce: true });
}

