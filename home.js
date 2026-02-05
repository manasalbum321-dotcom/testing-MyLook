import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
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
  if (!user) {
    // ❌ Not logged in → login page
    window.location.replace("login.html");
    return;
  }

  // ✅ Logged in → app start
  startApp(user);
});

/* 🚀 MAIN APP */
function startApp(user) {

  /* 🔍 SEARCH FUNCTION */
  function attachSearch(inputEl, resultEl) {
    if (!inputEl || !resultEl) return;

    inputEl.addEventListener("input", () => {
      const value = inputEl.value.trim().toLowerCase();
      resultEl.innerHTML = "";

      if (!value) return;

      const usersRef = ref(db, "users");

      onValue(usersRef, (snapshot) => {
        if (!snapshot.exists()) return;

        snapshot.forEach((userSnap) => {
          const userData = userSnap.val();

          if (
            userData.username &&
            userData.username.toLowerCase().includes(value)
          ) {
            createUserRow(userSnap.key, userData, resultEl);
          }
        });
      }, { onlyOnce: true });
    });
  }

  /* 👤 USER ROW */
  function createUserRow(uid, user, container) {
    const div = document.createElement("div");
    div.className = "user-row";

    div.innerHTML = `
      <img src="${user.profilePic || "https://i.pravatar.cc/100"}">
      <div>
        <div style="display:flex;align-items:center;gap:4px">
          <strong>${user.name || ""}</strong>
          <img
            class="verified-badge"
            src="https://upload.wikimedia.org/wikipedia/commons/e/e4/Twitter_Verified_Badge.svg"
            style="display:none;width:14px;height:14px"
          >
        </div>
        <small>@${user.username || ""}</small>
      </div>
    `;

    /* ✅ VERIFIED CHECK */
    const badge = div.querySelector(".verified-badge");
    get(ref(db, "verificationRequests/" + uid)).then((snap) => {
      if (snap.exists() && snap.val().status === "approved") {
        badge.style.display = "inline-block";
      }
    });

    /* 👉 OPEN PROFILE */
    div.addEventListener("click", () => {
      window.location.href = `profile.html?uid=${uid}`;
    });

    container.appendChild(div);
  }

  /* 🔗 ATTACH SEARCHES */
  attachSearch(
    document.getElementById("searchInput"),
    document.getElementById("searchResults")
  );

  attachSearch(
    document.getElementById("search2"),
    document.getElementById("searchResults2")
  );
}
