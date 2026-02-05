import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDPlU4bi3FUyv16Hm2ZKn9QaYXN__n4u5E",
    authDomain: "mylook-25be4.firebaseapp.com",
    databaseURL: "https://mylook-25be4-default-rtdb.firebaseio.com",
    projectId: "mylook-25be4",
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
