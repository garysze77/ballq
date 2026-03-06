import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCBUAjm-x0U8Hra0GRI3HAUf0cFsGyX10g",
  authDomain: "ballq-auth.firebaseapp.com",
  projectId: "ballq-auth",
  storageBucket: "ballq-auth.firebasestorage.app",
  messagingSenderId: "569748070005",
  appId: "1:569748070005:web:7afec800e9428b3699623c"
}

// Initialize Firebase only on client side
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)
