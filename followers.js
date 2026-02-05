import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getDatabase, ref, onValue, get } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

/* 🔐 Firebase config */
const firebaseConfig = {
    apiKey: "AIzaSyDPlU4bi3FUyv16Hm2ZKn9QaYXN__n4u5E",
    authDomain: "mylook-25be4.firebaseapp.com",
    databaseURL: "https://mylook-25be4-default-rtdb.firebaseio.com",
    projectId: "mylook-25be4",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const list = document.getElementById("followersList");

/* 🔙 Back */
window.goBack = () => history.back();

// 🔑 URL se uid lo (jiski profile open hai)
const params = new URLSearchParams(window.location.search);
const uidToLoad = params.get("uid");

/* 🔐 Auth check */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  if (!uidToLoad) {
    list.innerHTML = "<p>User not found</p>";
    return;
  }

  // ✅ sirf profile wale user ke followers
  loadFollowers(uidToLoad);
});

/* 👥 Load Followers */

function loadFollowers(uid) {
  onValue(ref(db, "followers/" + uid), async (snapshot) => {
    list.innerHTML = "";

    if (!snapshot.exists()) {
      list.innerHTML = "<p>No followers yet</p>";
      return;
    }

    for (const followerUid of Object.keys(snapshot.val())) {
      const userSnap = await get(ref(db, "users/" + followerUid));
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
              alt="verified"
            >
          </h4>
          <p>@${u.username || ""}</p>
        </div>
      `;

      // 🔍 VERIFIED CHECK (PER FOLLOWER)
      const badge = div.querySelector(".verified-badge");
      const verifySnap = await get(
        ref(db, "verificationRequests/" + followerUid)
      );

      if (verifySnap.exists() && verifySnap.val().status === "approved") {
        badge.style.display = "inline-block";
      }

      // 👉 OPEN PROFILE
      div.onclick = () => {
        window.location.href = `profile.html?uid=${followerUid}`;
      };

      list.appendChild(div);
    }
  });
}
