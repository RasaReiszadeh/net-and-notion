import { geminiModel } from "../../../firebase/firebaseConfig";

function serializeContacts(contacts) {
  return contacts
    .map((contact) => {
      const eventNames =
        contact.events && contact.events.length > 0
          ? contact.events.map((e) => e.name).filter(Boolean).join(", ")
          : contact.eventName || "";

      const categories =
        contact.categories && contact.categories.length > 0
          ? contact.categories.join(", ")
          : "";

      return [
        `ID: ${contact.id}`,
        `Name: ${contact.name || ""}`,
        `Title: ${contact.professionalTitle || ""}`,
        `Company: ${contact.company || ""}`,
        `Relationship: ${contact.relationshipLabel || ""}`,
        `Categories: ${categories}`,
        `Events: ${eventNames}`,
        `Notes: ${contact.notes || ""}`,
      ].join(" | ");
    })
    .join("\n");
}

function parseMatches(text) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item) => item && typeof item.id === "string" && typeof item.reason === "string",
      );
    }

    return [];
  } catch {
    return [];
  }
}

export async function findContactsByDescription(description, contacts) {
  if (!description || !description.trim() || contacts.length === 0) {
    return [];
  }

  const contactList = serializeContacts(contacts);

  const prompt = `
You are helping a user find contacts from their personal networking app.

The user is looking for: "${description.trim()}"

Below is a list of their contacts. Each line contains one contact's details separated by " | ".

${contactList}

Instructions:
- Return a JSON array of objects with the shape: { "id": "<contact id>", "reason": "<brief reason why this contact matches>" }
- Include only contacts that match the user's description.
- Reason should be 1–2 sentences, plain English.
- If no contacts match, return an empty array: []
- Return only the JSON array. No markdown. No explanations outside the array.
`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();

  return parseMatches(text);
}
