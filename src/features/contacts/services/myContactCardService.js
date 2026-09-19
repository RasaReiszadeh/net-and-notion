import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { db } from "../../../firebase/firebaseConfig";

function getUserMyContactCardRef(userId) {
  return doc(db, "users", userId, "profile", "myContactCard");
}

export async function getMyContactCard(userId) {
  const cardRef = getUserMyContactCardRef(userId);
  const snapshot = await getDoc(cardRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function saveMyContactCard(userId, cardData) {
  const cardRef = getUserMyContactCardRef(userId);

  const contactMethods = [];

  if (cardData.email?.trim()) {
    contactMethods.push({
      type: "email",
      value: cardData.email.trim(),
      source: "my-card",
    });
  }

  if (cardData.phone?.trim()) {
    contactMethods.push({
      type: "phone",
      value: cardData.phone.trim(),
      source: "my-card",
    });
  }

  if (cardData.socialUrl?.trim()) {
    contactMethods.push({
      type: "linkedin",
      value: cardData.socialUrl.trim(),
      source: "my-card",
    });
  }

  const savedCard = {
    name: cardData.name.trim(),
    professionalTitle: cardData.professionalTitle?.trim() || "",
    company: cardData.company?.trim() || "",
    contactMethods,
    updatedAt: serverTimestamp(),
  };

  await setDoc(cardRef, savedCard, { merge: true });

  return savedCard;
}
