import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "../../../firebase/firebaseConfig";

function getUserEventsCollection(userId) {
  return collection(db, "users", userId, "events");
}

export async function createEvent(userId, eventData) {
  const eventsCollection = getUserEventsCollection(userId);

  const newEvent = {
    name: eventData.name,
    date: eventData.date,
    location: eventData.location || "",
    notes: eventData.notes || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(eventsCollection, newEvent);

  return {
    id: docRef.id,
    ...newEvent,
  };
}

export async function getEvents(userId) {
  const eventsCollection = getUserEventsCollection(userId);

  const eventsQuery = query(eventsCollection, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(eventsQuery);

  const events = snapshot.docs.map((eventDoc) => ({
    id: eventDoc.id,
    ...eventDoc.data(),
  }));

  return events;
}

export async function getEventById(userId, eventId) {
  const eventRef = doc(db, "users", userId, "events", eventId);

  const snapshot = await getDoc(eventRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function updateEvent(userId, eventId, eventData) {
  const eventRef = doc(db, "users", userId, "events", eventId);

  const updatedEvent = {
    name: eventData.name,
    date: eventData.date,
    location: eventData.location || "",
    notes: eventData.notes || "",
    updatedAt: serverTimestamp(),
  };

  await updateDoc(eventRef, updatedEvent);

  return {
    id: eventId,
    ...updatedEvent,
  };
}

export async function deleteEvent(userId, eventId) {
  const eventRef = doc(db, "users", userId, "events", eventId);

  await deleteDoc(eventRef);

  return eventId;
}
