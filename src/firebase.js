import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAK6XFukT9yCE5BDBsuL8atriWQWA1no2E",
  authDomain: "eventsasturias.firebaseapp.com",
  projectId: "eventsasturias",
  storageBucket: "eventsasturias.firebasestorage.app",
  messagingSenderId: "296666664877",
  appId: "1:296666664877:web:838dc058503a9cf9bcdb24",
  measurementId: "G-HZTJN3JDQ7"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 🔐 Auth
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 🔘 LOGIN
window.googleLogin = function() {
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("✅ Usuario logueado:", result.user.displayName);
      alert(`Bienvenido ${result.user.displayName}`);
    })
    .catch((error) => {
      console.error("❌ Error en login:", error);
    });
};

// 🚪 LOGOUT
window.googleLogout = function() {
  signOut(auth)
    .then(() => {
      console.log("✅ Sesión cerrada");
      location.reload();
    })
    .catch((error) => {
      console.error("❌ Error cerrando sesión:", error);
    });
};

// 👀 DETECTAR SESIÓN
window.onFirebaseAuthChange = function(callback) {
  onAuthStateChanged(auth, callback);
};
