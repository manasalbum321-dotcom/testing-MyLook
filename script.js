// 🔥 Firebase Config (YAHAN APNA CONFIG DAALO)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Toggle post box
function togglePost(){
  const box = document.getElementById("postBox");
  box.style.display = box.style.display === "none" ? "block" : "none";
}

// Add post
function addPost(){
  const caption = document.getElementById("caption").value;
  const image = document.getElementById("image").value;

  if(caption === ""){
    alert("Write something");
    return;
  }

  db.collection("posts").add({
    caption: caption,
    image: image,
    time: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById("caption").value="";
  document.getElementById("image").value="";
}

// Load posts
db.collection("posts").orderBy("time","desc")
.onSnapshot(snapshot=>{
  let postsHTML = "";
  snapshot.forEach(doc=>{
    const post = doc.data();
    postsHTML += `
      <div class="post">
        <div class="post-header">username</div>
        ${post.image ? `<img src="${post.image}">` : ""}
        <div class="post-content">${post.caption}</div>
      </div>
    `;
  });
  document.getElementById("posts").innerHTML = postsHTML;
});
