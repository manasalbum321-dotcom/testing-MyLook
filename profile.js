import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
  remove
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

/* 🔥 Firebase */
const firebaseConfig = {
  apiKey: "AIzaSyDPlU4bi3FUyv16Hm2ZKn9QaYXN__n4u5E",
  authDomain: "mylook-25be4.firebaseapp.com",
  databaseURL: "https://mylook-25be4-default-rtdb.firebaseio.com",
  projectId: "mylook-25be4",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

/* 🧩 DOM ELEMENTS (VERY IMPORTANT) */
const name = document.getElementById("name");
const verifiedBadge = document.getElementById("verifiedBadge");
const username = document.getElementById("username");
const bio = document.getElementById("bio");
const profilePic = document.getElementById("profilePic");

const followersCount = document.getElementById("followersCount");
const followingCount = document.getElementById("followingCount");

const followersLink = document.getElementById("followersLink");
const followingLink = document.getElementById("followingLink");

const ownProfileBtns = document.getElementById("ownProfileBtns");
const otherProfileBtns = document.getElementById("otherProfileBtns");
const followBtn = document.getElementById("followBtn");
const messageBtn = document.getElementById("messageBtn");
const shareProfile = document.getElementById("shareProfile");

/* 🔑 UID from URL */
const params = new URLSearchParams(window.location.search);
const profileUidFromUrl = params.get("uid");

/* 🔐 AUTH */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  const myUid = user.uid;
  const profileUid = profileUidFromUrl || myUid;

  loadProfile(profileUid);
  loadBadge(profileUid);
  loadCounts(profileUid);
  setupLinks(profileUid);
  setupButtons(myUid, profileUid);
  followState(myUid, profileUid);
});

/* 👤 PROFILE DATA */
function loadProfile(uid) {
  const userRef = ref(db, "users/" + uid);

  onValue(userRef, (snap) => {
    if (!snap.exists()) return;

    const d = snap.val();

    // NAME
    name.innerText = d.name || "";

    // USERNAME
    username.innerText = d.username ? "@" + d.username : "";

    // BIO
    bio.innerText = d.bio || "";

    // PROFILE PIC
    profilePic.src = d.profilePic || "https://i.pravatar.cc/150";

    // // ✅ VERIFIED BADGE (FIXED)
    // if (d.verified === true) {
    //   verifiedBadge.style.display = "inline-block";
    // } else {
    //   verifiedBadge.style.display = "none";
    // }

  }, { onlyOnce: true });
}

// PROFILE BADGE LOAD 
function loadBadge(uid) {
  const userRef = ref(db, "verificationRequests/" + uid);

  onValue(userRef, (snap) => {
    if (!snap.exists()) return;

    const d = snap.val();

    // ✅ VERIFIED BADGE (FIXED)
    if (d.status === "approved") {
      verifiedBadge.style.display = "inline-block";
    } else {
      verifiedBadge.style.display = "none";
    }

  }, { onlyOnce: true });
}


/* 🔢 COUNTS */
function loadCounts(uid) {
  onValue(ref(db, "followers/" + uid), (s) => {
    followersCount.innerText =
      s.exists() ? Object.keys(s.val()).length : 0;
  });

  onValue(ref(db, "following/" + uid), (s) => {
    followingCount.innerText =
      s.exists() ? Object.keys(s.val()).length : 0;
  });
}

/* 🔗 LINKS */
function setupLinks(uid) {
  followersLink.href = `followers.html?uid=${uid}`;
  followingLink.href = `following.html?uid=${uid}`;
}

/* 🔘 BUTTONS */
function setupButtons(myUid, profileUid) {
  if (myUid !== profileUid) {
    // 👤 OTHER USER
    ownProfileBtns.style.display = "none";
    otherProfileBtns.style.display = "flex";

    followBtn.onclick = () => toggleFollow(myUid, profileUid);
    messageBtn.onclick = () => {
    location.href = `message.html?uid=${profileUid}`;
  };


  } else {
    // 👑 OWN PROFILE
    ownProfileBtns.style.display = "flex";
    otherProfileBtns.style.display = "none";
  }
}

/* ❤️ FOLLOW */
function followUser(myUid, targetUid) {
  set(ref(db, `followers/${targetUid}/${myUid}`), true);
  set(ref(db, `following/${myUid}/${targetUid}`), true);
}

/* 🔁 FOLLOW STATE + COLOR */
function followState(myUid, profileUid) {
  if (myUid === profileUid) return;

  const followRef = ref(db, `following/${myUid}/${profileUid}`);

  onValue(followRef, (snap) => {
    if (snap.exists()) {
      followBtn.innerText = "Following";
      followBtn.classList.add("following");
    } else {
      followBtn.innerText = "Follow";
      followBtn.classList.remove("following");
    }
  });
}

/* 📤 SHARE PROFILE */
shareProfile?.addEventListener("click", () => {
  const url = location.href;

  if (navigator.share) {
    navigator.share({
      title: "MyLook Profile",
      url
    });
  } else {
    navigator.clipboard.writeText(url);
    alert("Profile link copied!");
  }
});

// FOLLOW UNFOLLOW SYSTEM

function toggleFollow(myUid, targetUid) {
  const followingRef = ref(db, `following/${myUid}/${targetUid}`);
  const followersRef = ref(db, `followers/${targetUid}/${myUid}`);

  onValue(followingRef, (snap) => {
    if (snap.exists()) {
      // 🔴 UNFOLLOW
      remove(followingRef);
      remove(followersRef);

      followBtn.innerText = "Follow";
      followBtn.classList.remove("following");

    } else {
      // 🟢 FOLLOW
      set(followingRef, true);
      set(followersRef, true);

      followBtn.innerText = "Following";
      followBtn.classList.add("following");
    }
  }, { onlyOnce: true });
}
