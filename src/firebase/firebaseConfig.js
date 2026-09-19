import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

const firebaseConfig = {
  apiKey: "AIzaSyDvPmtbMXa9gDWVrmiACACm_oiRLW3yBH4",
  authDomain: "net-and-notion-test.firebaseapp.com",
  projectId: "net-and-notion-test",
  storageBucket: "net-and-notion-test.firebasestorage.app",
  messagingSenderId: "585294603259",
  appId: "1:585294603259:web:f211ba336141726a0a215e",
};

const app = initializeApp(firebaseConfig);

const ai = getAI(app, {
  backend: new GoogleAIBackend(),
});

export const auth = getAuth(app);

export const db = getFirestore(app);

export const geminiModel = getGenerativeModel(ai, {
  model: "gemini-2.5-flash-lite",
});

export default app;
