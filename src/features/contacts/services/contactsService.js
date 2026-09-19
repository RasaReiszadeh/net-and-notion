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

function getUserContactsCollection(userId) {
  return collection(db, "users", userId, "contacts");
}

function normalizeEvents(contactData) {
  if (Array.isArray(contactData.events)) {
    return contactData.events;
  }

  if (contactData.eventId) {
    return [
      {
        id: contactData.eventId,
        name: contactData.eventName || "",
        date: contactData.eventDate || "",
        location: contactData.eventLocation || "",
      },
    ];
  }

  return [];
}

export async function createContact(userId, contactData) {
  const contactsCollection = getUserContactsCollection(userId);

  const newContact = {
    name: contactData.name,
    professionalTitle: contactData.professionalTitle || "",
    company: contactData.company || "",

    contactMethods: contactData.contactMethods || [],

    events: normalizeEvents(contactData),

    notes: contactData.notes || "",
    categories: contactData.categories || [],
    relationshipLabel: contactData.relationshipLabel || "",

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(contactsCollection, newContact);

  return {
    id: docRef.id,
    ...newContact,
  };
}

export async function getContacts(userId) {
  const contactsCollection = getUserContactsCollection(userId);
  const contactsQuery = query(contactsCollection, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(contactsQuery);

  return snapshot.docs.map((contactDoc) => ({
    id: contactDoc.id,
    ...contactDoc.data(),
  }));
}

export async function getContactById(userId, contactId) {
  const contactRef = doc(db, "users", userId, "contacts", contactId);
  const snapshot = await getDoc(contactRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function updateContact(userId, contactId, contactData) {
  const contactRef = doc(db, "users", userId, "contacts", contactId);

  const updatedContact = {
    name: contactData.name,
    professionalTitle: contactData.professionalTitle || "",
    company: contactData.company || "",

    contactMethods: contactData.contactMethods || [],

    events: normalizeEvents(contactData),

    notes: contactData.notes || "",
    categories: contactData.categories || [],
    relationshipLabel: contactData.relationshipLabel || "",

    updatedAt: serverTimestamp(),
  };

  await updateDoc(contactRef, updatedContact);

  return {
    id: contactId,
    ...updatedContact,
  };
}

export async function deleteContact(userId, contactId) {
  const contactRef = doc(db, "users", userId, "contacts", contactId);

  await deleteDoc(contactRef);

  return contactId;
}

export async function getContactsByEventId(userId, eventId) {
  const allContacts = await getContacts(userId);

  return allContacts.filter((contact) => {
    if (Array.isArray(contact.events)) {
      return contact.events.some((event) => event.id === eventId);
    }

    return contact.eventId === eventId;
  });
}
