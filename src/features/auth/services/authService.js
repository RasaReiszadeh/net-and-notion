import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

import { auth } from "../../../firebase/firebaseConfig";

export async function registerUser({ fullName, email, password }) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  if (fullName) {
    await updateProfile(userCredential.user, {
      displayName: fullName,
    });
  }

  return userCredential.user;
}

export async function loginUser({ email, password }) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  return userCredential.user;
}

export async function logoutUser() {
  await signOut(auth);
}

export function listenToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}
