import { getDatabase, ref, onValue, get } 
from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

const db = getDatabase();
const auth = getAuth(app);

/* ================= COMMON SEARCH FUNCTION ================= */
/* 🔐 AUTH */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    location.href = "login.html";
    return;
  }

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
        const user = userSnap.val();

        if (
          user.username &&
          user.username.toLowerCase().includes(value)
        ) {
          createUserRow(userSnap.key, user, resultEl);
        }
      });
    }, { onlyOnce: true });
  });
}

/* ================= USER ROW WITH VERIFIED BADGE ================= */

function createUserRow(uid, user, container) {
  const div = document.createElement("div");
  div.className = "user-row";

  div.innerHTML = `
    <img src="${user.profilePic || 'https://i.pravatar.cc/100'}">
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

/* ================= APPLY TO BOTH SEARCHES ================= */

attachSearch(
  document.getElementById("searchInput"),
  document.getElementById("searchResults")
);

attachSearch(
  document.getElementById("search2"),
  document.getElementById("searchResults2")
);
