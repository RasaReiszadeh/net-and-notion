import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "../../../firebase/firebaseConfig";

function getUserRemindersCollection(userId) {
  return collection(db, "users", userId, "reminders");
}

export async function createReminder(userId, reminderData) {
  const remindersCollection = getUserRemindersCollection(userId);

  const newReminder = {
    contactId: reminderData.contactId || "",
    contactName: reminderData.contactName || "",
    title: reminderData.title,
    dueDate: reminderData.dueDate,
    completed: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(remindersCollection, newReminder);

  return {
    id: docRef.id,
    ...newReminder,
  };
}

export async function getReminders(userId) {
  const remindersCollection = getUserRemindersCollection(userId);

  const remindersQuery = query(
    remindersCollection,
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(remindersQuery);

  return snapshot.docs.map((reminderDoc) => ({
    id: reminderDoc.id,
    ...reminderDoc.data(),
  }));
}

export async function updateReminderStatus(userId, reminderId, completed) {
  const reminderRef = doc(db, "users", userId, "reminders", reminderId);

  await updateDoc(reminderRef, {
    completed,
    updatedAt: serverTimestamp(),
  });

  return reminderId;
}

export async function deleteReminder(userId, reminderId) {
  const reminderRef = doc(db, "users", userId, "reminders", reminderId);

  await deleteDoc(reminderRef);

  return reminderId;
}
