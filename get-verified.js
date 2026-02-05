import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set
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

/* 🧩 ELEMENTS */
const container = document.querySelector(".apply-container");
const form = document.querySelector(".apply-form");

/* 🔐 AUTH */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please login to apply for verification");
    location.href = "login.html";
    return;
  }

  const uid = user.uid;
  const requestRef = ref(db, `verificationRequests/${uid}`);
  const snap = await get(requestRef);

  // ✅ ALREADY APPLIED
  if (snap.exists()) {
    showAppliedDetails(snap.val());
  }
});

/* 📤 SUBMIT FORM */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const inputs = form.querySelectorAll("input, textarea");

  const name = inputs[0].value.trim();
  const username = inputs[1].value.trim();
  const profileLink = inputs[2].value.trim();
  const reason = inputs[3].value.trim();

  if (!name || !username || !profileLink || !reason) {
    alert("Please fill all fields");
    return;
  }

  const user = auth.currentUser;
  if (!user) return;

  const uid = user.uid;

  await set(ref(db, `verificationRequests/${uid}`), {
    name,
    username,
    profileLink,
    reason,
    status: "pending",
    appliedAt: Date.now()
  });

  showAppliedDetails({
    name,
    username,
    profileLink,
    reason,
    status: "pending"
  });
});

/* 🧾 SHOW APPLIED DETAILS */
function showAppliedDetails(data) {
  let statusClass = "status-pending";

  if (data.status === "approved") statusClass = "status-approved";
  if (data.status === "cancelled" || data.status === "rejected")
    statusClass = "status-cancelled";

  container.innerHTML = `
    <center>
      <img src="https://upload.wikimedia.org/wikipedia/commons/e/e4/Twitter_Verified_Badge.svg">
    </center>

    <h2>Verification Request</h2>

    <center>
      <div class="status-badge ${statusClass}">
        ${data.status.toUpperCase()}
      </div>
    </center>

    <div style="font-size:14px; line-height:1.6">
      <p><b>Name:</b> ${data.name}</p>
      <p><b>Username:</b> ${data.username}</p>
      <p><b>Profile:</b>
        <a href="${data.profileLink}" target="_blank">
          ${data.profileLink}
        </a>
      </p>
      <p><b>Reason:</b> ${data.reason}</p>
    </div>

    <p class="note">
      Please wait for manual review. Status will update automatically.
    </p>

    <p class="approved-by">
      This request will be approved by the Owner & Founder of MyLook
      <b>MANAS PRAJAPATI</b>
    </p>
  `;
}
