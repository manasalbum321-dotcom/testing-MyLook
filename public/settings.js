import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

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
const auth = getAuth(app);

// 🔁 Redirects
window.goEdit = () => {
  window.location.href = "edit.html";
};
window.notif = () => {
  window.location.href = "notification.html";
};
window.verify = () => {
  window.location.href = "get-verified.html";
};
window.privacy = () => {
  window.location.href = "privacy.html";
};
window.help = () => {
  window.location.href = "help.html";
};

// 🔐 Change Password
window.changePassword = () => {
  const user = auth.currentUser;
  if (!user) return;

  sendPasswordResetEmail(auth, user.email)
    .then(() => alert("Password reset email sent 📧\nDidn't receive the password reset email?\nCheck your Spam folder. If you still don't see the email, try again."))
    .catch(err => alert(err.message));
};

// 🚪 Logout
window.logout = () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
};
