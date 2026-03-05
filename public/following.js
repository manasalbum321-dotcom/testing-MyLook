import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getDatabase, ref, onValue, get } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

/* 🔐 Firebase config */
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

const list = document.getElementById("followingList");

window.goBack = () => history.back();

const params = new URLSearchParams(window.location.search);
const uidToLoad = params.get("uid");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  if (!uidToLoad) {
    list.innerHTML = "<p>User not found</p>";
    return;
  }

  loadFollowing(uidToLoad);
});

/* 👥 Load Following */

function loadFollowing(uid) {
  onValue(ref(db, "following/" + uid), async (snapshot) => {
    list.innerHTML = "";

    if (!snapshot.exists()) {
      list.innerHTML = "<p>Not following anyone</p>";
      return;
    }

    for (const followingUid of Object.keys(snapshot.val())) {
      const userSnap = await get(ref(db, "users/" + followingUid));
      if (!userSnap.exists()) continue;

      const u = userSnap.val();

      const div = document.createElement("div");
      div.className = "user";

      div.innerHTML = `
        <img src="${u.profilePic || 'https://i.pravatar.cc/100'}">
        <div class="info">
          <h4 class="name-line">
            <span class="name-text">${u.name || ""}</span>
            <img
              class="verified-badge"
              src="https://upload.wikimedia.org/wikipedia/commons/e/e4/Twitter_Verified_Badge.svg"
              style="display:none"
            >
          </h4>
          <p>@${u.username || ""}</p>
        </div>
      `;

      // 🔍 VERIFIED CHECK (PER USER)
      const badge = div.querySelector(".verified-badge");
      const verifySnap = await get(ref(db, "verificationRequests/" + followingUid));

      if (verifySnap.exists() && verifySnap.val().status === "approved") {
        badge.style.display = "inline-block";
      }

      // 👉 OPEN PROFILE
      div.onclick = () => {
        window.location.href = `profile.html?uid=${followingUid}`;
      };

      list.appendChild(div);
    }
  });
}
