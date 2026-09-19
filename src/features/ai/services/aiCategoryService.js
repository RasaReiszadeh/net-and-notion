import { geminiModel } from "../../../firebase/firebaseConfig";
import { contactCategories } from "../../contacts/constants/contactOptions";

export async function generateCategoriesFromNotes({
  notes,
  name,
  professionalTitle,
  company,
}) {
  if (!notes || !notes.trim()) {
    return [];
  }

  const allowedCategories = contactCategories.join(", ");
  const contactName = name?.trim() || "Unknown";
  const contactTitle = professionalTitle?.trim() || "Unknown";
  const contactCompany = company?.trim() || "Unknown";

  const prompt = `
You are helping organize professional networking contacts.

Analyze the following contact context and networking note, then return only 3 to 5 short category labels.

Rules:
- Return only a JSON array of strings.
- Do not include explanations.
- Do not include markdown.
- Categories should be useful for filtering contacts.
- Use only categories from this exact list: ${allowedCategories}.
- Do not invent new category names.

Contact context:
- Name: ${contactName}
- Professional title: ${contactTitle}
- Company: ${contactCompany}

Networking note:
"${notes}"
`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text();

  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace("[", "")
      .replace("]", "")
      .split(",")
      .map((item) => item.replace(/"/g, "").trim())
      .filter(Boolean);
  }
}
