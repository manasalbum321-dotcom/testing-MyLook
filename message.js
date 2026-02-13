import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  get,
  update,
  onDisconnect,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

/* 🔥 Firebase */
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

/* 🧱 DOM */
const sidebar = document.getElementById("sidebar");
const chatArea = document.getElementById("chatArea");
const messagesDiv = document.getElementById("messages");
const chatName = document.getElementById("chatName");
const chatUserPic = document.getElementById("chatUserPic");
const chatLastSeen = document.getElementById("chatLastSeen");
const messageInput = document.getElementById("messageInput");
const typingIndicator = document.getElementById("typingIndicator");
let typingTimeout;

let myUid = "";
let chatId = "";
let currentChatUser = "";

/* 🔐 AUTH */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  myUid = user.uid;
  setupPresence();
  loadFollowingUsers();
});

/* 🟢 PRESENCE */
function setupPresence() {
  const statusRef = ref(db, "status/" + myUid);

  update(statusRef, {
    state: "online",
    lastSeen: serverTimestamp()
  });

  onDisconnect(statusRef).update({
    state: "offline",
    lastSeen: serverTimestamp()
  });
}

/* 👥 LOAD FOLLOWING USERS (SIDEBAR + VERIFIED BADGE) */
function loadFollowingUsers() {
  onValue(ref(db, "following/" + myUid), async (snap) => {

    sidebar.innerHTML = `<div class="sidebar-header">Messages</div>`;

    if (!snap.exists()) {
      sidebar.innerHTML += `<p style="padding:10px">No chats</p>`;
      return;
    }

    for (const uid of Object.keys(snap.val())) {

      const userSnap = await get(ref(db, "users/" + uid));
      if (!userSnap.exists()) continue;

      const u = userSnap.val();

      const div = document.createElement("div");
      div.className = "chat-user";
      div.onclick = () => openChat(uid);

      div.innerHTML = `
        <img src="${u.profilePic || "https://i.pravatar.cc/100"}">
        <div class="chat-info">
          <h4 class="name-line">
            <span>${u.name}</span>
            <img
              class="verified-badge"
              src="https://upload.wikimedia.org/wikipedia/commons/e/e4/Twitter_Verified_Badge.svg"
              style="display:none; width:18px; vertical-align:middle"
            >
          </h4>
          <p>@${u.username || ""}</p>
        </div>
        <div class="unread-badge" id="badge_${uid}" style="display:none">0</div>
      `;

      sidebar.appendChild(div);

      /* ✅ VERIFIED CHECK (PER USER) */
      const badgeIcon = div.querySelector(".verified-badge");
      const verifySnap = await get(ref(db, "verificationRequests/" + uid));
      if (verifySnap.exists() && verifySnap.val().status === "approved") {
        badgeIcon.style.display = "inline-block";
      }

      /* ⭐ UNREAD BADGE */
      const badge = div.querySelector(".unread-badge");
      const tempChatId = [myUid, uid].sort().join("_");

      onValue(ref(db, `chats/${tempChatId}/messages`), (snap) => {
        let unread = 0;

        if (snap.exists()) {
          snap.forEach((m) => {
            const msg = m.val();
            if (msg.sender !== myUid && !msg.seen) unread++;
          });
        }

        if (unread > 0) {
          badge.style.display = "flex";
          badge.innerText = unread;
        } else {
          badge.style.display = "none";
        }
      });
    }
  });
}

/* 💬 OPEN CHAT (HEADER VERIFIED BADGE) */
async function openChat(uid) {

  currentChatUser = uid;
  chatId = [myUid, uid].sort().join("_");
  messagesDiv.innerHTML = "";

  const userSnap = await get(ref(db, "users/" + uid));
  if (userSnap.exists()) {
    const u = userSnap.val();

    chatName.innerHTML = `
      <span>${u.name}</span>
      <img
        class="verified-badge"
        id="chatVerifiedBadge"
        src="https://upload.wikimedia.org/wikipedia/commons/e/e4/Twitter_Verified_Badge.svg"
        style="display:none; width:18px; height:18px; vertical-align:middle"
      >
    `;

    chatUserPic.src = u.profilePic || "https://i.pravatar.cc/100";
    autoDeleteOldMessages(chatId);
  }

  /* ✅ VERIFIED CHECK (CHAT HEADER) */
  const verifySnap = await get(ref(db, "verificationRequests/" + uid));
  const chatBadge = document.getElementById("chatVerifiedBadge");
  if (verifySnap.exists() && verifySnap.val().status === "approved") {
    chatBadge.style.display = "inline-block";
  }

  /* LAST SEEN */
  onValue(ref(db, "status/" + uid), (snap) => {
    if (!snap.exists()) return;
    const s = snap.val();
    chatLastSeen.classList.add("online");

    if (s.state === "online") chatLastSeen.innerText = "online";
    else chatLastSeen.innerText = "last seen " + formatLastSeen(s.lastSeen);
  });

  if (window.innerWidth <= 768) {
    sidebar.style.display = "none";
    chatArea.style.display = "flex";
  } else {
    chatArea.style.display = "flex";
  }

  /* 👀 LISTEN TYPING (ONLINE SYSTEM KO TOUCH NAHI KARTA) */
onValue(ref(db, "status/" + uid), (snap) => {
  if (!snap.exists()) return;

  const s = snap.val();

  if (s.typing && s.typingTo === chatId) {
    typingIndicator.style.display = "flex";
    typingIndicator.scrollIntoView({ behavior: "smooth" });
  } else {
    typingIndicator.style.display = "none";
  }
});


  /* LOAD MESSAGES */
  onValue(ref(db, `chats/${chatId}/messages`), (snap) => {
    messagesDiv.innerHTML = "";

    snap.forEach((s) => {
      const msg = s.val();
      showMessage(msg);

      if (msg.sender !== myUid && !msg.seen) {
        update(ref(db, `chats/${chatId}/messages/${s.key}`), {
          seen: true
        });
      }
    });
  });
}

/* ✍️ TYPING SEND (STATUS NODE USE KARKE) */
messageInput.addEventListener("input", () => {
  if (!chatId) return;

  const statusRef = ref(db, "status/" + myUid);

  update(statusRef, {
    typing: true,
    typingTo: chatId
  });

  clearTimeout(typingTimeout);

  typingTimeout = setTimeout(() => {
    update(statusRef, {
      typing: false,
      typingTo: ""
    });
  }, 1500);
});


/* ✉️ SEND MESSAGE */
window.sendMessage = () => {
  const text = messageInput.value.trim();
  if (!text || !chatId) return;

  push(ref(db, `chats/${chatId}/messages`), {
    sender: myUid,
    text,
    time: Date.now(),
    seen: false
  });

  messageInput.value = "";
};

update(ref(db, "status/" + myUid), {
  typing: false,
  typingTo: ""
});


/* 🧩 SHOW MESSAGE */
function showMessage(msg) {
  const wrapper = document.createElement("div");
  wrapper.className = "msg-wrapper " + (msg.sender === myUid ? "me" : "other");

  const bubble = document.createElement("div");
  bubble.className = "msg " + (msg.sender === myUid ? "sent" : "received");
  bubble.innerText = msg.text;

  const meta = document.createElement("div");
  meta.className = "msg-meta";

  const time = new Date(msg.time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  meta.innerHTML = `
    <small>${time}</small>
    ${msg.sender === myUid ? `<small>${msg.seen ? "✔✔ Seen" : "✔ Sent"}</small>` : ""}
  `;

  wrapper.appendChild(bubble);
  wrapper.appendChild(meta);
  messagesDiv.appendChild(wrapper);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/* ⏱️ LAST SEEN FORMAT */
function formatLastSeen(ts) {
  const d = new Date(ts);
  const now = new Date();

  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return d.toLocaleDateString() + " " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* 🔙 BACK */
window.goBack = () => {
  if (window.innerWidth <= 768) {
    chatArea.style.display = "none";
    sidebar.style.display = "block";
  }
};


// THIS LOGIC CREATED BY MANAS MESSAGE AUTOMATIC DELETE AFTER 24 HOURS 
import { remove } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-database.js";

const MESSAGE_LIFE = 24 * 60 * 60 * 1000; // 24 hours

async function autoDeleteOldMessages(chatId) {
  const msgRef = ref(db, `chats/${chatId}/messages`);
  const snap = await get(msgRef);

  if (!snap.exists()) return;

  const now = Date.now();

  snap.forEach((child) => {
    const msg = child.val();

    if (msg.time && now - msg.time >= MESSAGE_LIFE) {
      // ✅ REAL DELETE
      remove(ref(db, `chats/${chatId}/messages/${child.key}`));
    }
  });
}
