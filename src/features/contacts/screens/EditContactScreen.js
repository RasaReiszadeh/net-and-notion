import { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, Alert, Text } from "react-native";

import AppScreen from "../../../shared/components/AppScreen";
import AppHeader from "../../../shared/components/AppHeader";
import AppButton from "../../../shared/components/AppButton";

import ContactForm from "../components/ContactForm";

import { auth } from "../../../firebase/firebaseConfig";
import { getContactById, updateContact } from "../services/contactsService";
import { getEvents } from "../../events/services/eventsService";
import { generateCategoriesFromNotes } from "../../ai/services/aiCategoryService";

import { spacing } from "../../../theme/spacing";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";

export default function EditContactScreen({ route, navigation }) {
  const { contactId } = route.params || {};

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [company, setCompany] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [socialUrl, setSocialUrl] = useState("");

  const [notes, setNotes] = useState("");

  const [selectedEvents, setSelectedEvents] = useState([]);

  const [relationshipLabel, setRelationshipLabel] = useState("");
  const [categories, setCategories] = useState([]);

  const [isGeneratingCategories, setIsGeneratingCategories] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [socialUrlError, setSocialUrlError] = useState("");
  const [notesError, setNotesError] = useState("");

  const [events, setEvents] = useState([]);
  const [showEventDropdown, setShowEventDropdown] = useState(false);

  function extractContactMethod(contactMethods, type) {
    const method = contactMethods?.find((item) => item.type === type);
    return method?.value || "";
  }

  function normalizeContactEvents(contact) {
    if (Array.isArray(contact.events)) {
      return contact.events;
    }

    if (contact.eventId) {
      return [
        {
          id: contact.eventId,
          name: contact.eventName || "",
          date: contact.eventDate || "",
          location: contact.eventLocation || "",
        },
      ];
    }

    return [];
  }

  function handleNameChange(text) {
    setName(text);
    if (nameError) setNameError("");
  }

  function handleEmailChange(text) {
    setEmail(text);

    if (emailError || phoneError || socialUrlError) {
      setEmailError("");
      setPhoneError("");
      setSocialUrlError("");
    }
  }

  function handlePhoneChange(text) {
    setPhone(text);

    if (emailError || phoneError || socialUrlError) {
      setEmailError("");
      setPhoneError("");
      setSocialUrlError("");
    }
  }

  function handleSocialUrlChange(text) {
    setSocialUrl(text);

    if (emailError || phoneError || socialUrlError) {
      setEmailError("");
      setPhoneError("");
      setSocialUrlError("");
    }
  }

  function handleNotesChange(text) {
    setNotes(text);
    if (notesError) setNotesError("");
  }

  function buildContactMethods() {
    const methods = [];

    if (email.trim()) {
      methods.push({
        type: "email",
        value: email.trim(),
        source: "manual",
      });
    }

    if (phone.trim()) {
      methods.push({
        type: "phone",
        value: phone.trim(),
        source: "manual",
      });
    }

    if (socialUrl.trim()) {
      methods.push({
        type: "linkedin",
        value: socialUrl.trim(),
        source: "manual",
      });
    }

    return methods;
  }

  function buildContactDraft() {
    return {
      contactId,
      name,
      professionalTitle,
      company,
      email,
      phone,
      socialUrl,
      notes,
      relationshipLabel,
      categories,
      selectedEvents,
    };
  }

  async function loadContact() {
    try {
      setIsLoading(true);

      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to edit this contact.",
        );
        return;
      }

      if (!contactId) {
        Alert.alert("Missing Contact", "No contact was selected.");
        navigation.replace("ContactList");
        return;
      }

      const contact = await getContactById(userId, contactId);

      if (!contact) {
        Alert.alert("Not Found", "This contact does not exist.");
        navigation.replace("ContactList");
        return;
      }

      setName(contact.name || "");
      setProfessionalTitle(contact.professionalTitle || "");
      setCompany(contact.company || "");

      setEmail(extractContactMethod(contact.contactMethods, "email"));
      setPhone(extractContactMethod(contact.contactMethods, "phone"));
      setSocialUrl(extractContactMethod(contact.contactMethods, "linkedin"));

      setNotes(contact.notes || "");
      setSelectedEvents(normalizeContactEvents(contact));

      setCategories(contact.categories || []);
      setRelationshipLabel(contact.relationshipLabel || "");
    } catch (error) {
      Alert.alert("Load Contact Error", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadEvents() {
    try {
      const userId = auth.currentUser?.uid;

      if (!userId) {
        return;
      }

      const userEvents = await getEvents(userId);
      setEvents(userEvents);
    } catch (error) {
      Alert.alert("Events Error", error.message);
    }
  }

  function handleSelectEvent(event) {
    const alreadySelected = selectedEvents.some(
      (selectedEvent) => selectedEvent.id === event.id,
    );

    if (alreadySelected) {
      return;
    }

    setSelectedEvents([
      ...selectedEvents,
      {
        id: event.id,
        name: event.name || "",
        date: event.date || "",
        location: event.location || "",
      },
    ]);

    setShowEventDropdown(false);
  }

  function handleRemoveEvent(eventId) {
    setSelectedEvents(selectedEvents.filter((event) => event.id !== eventId));
  }

  async function handleGenerateCategories() {
    if (!notes.trim()) {
      Alert.alert("Missing Notes", "Write notes before generating categories.");
      return;
    }

    try {
      setIsGeneratingCategories(true);

      const generatedCategories = await generateCategoriesFromNotes(notes);

      if (generatedCategories.length === 0) {
        Alert.alert("No Categories", "AI could not generate categories.");
        return;
      }

      setCategories(generatedCategories);
    } catch (error) {
      Alert.alert("AI Error", error.message);
    } finally {
      setIsGeneratingCategories(false);
    }
  }

  async function handleUpdateContact() {
    setNameError("");
    setEmailError("");
    setPhoneError("");
    setSocialUrlError("");
    setNotesError("");

    let isValid = true;

    if (!name.trim()) {
      setNameError("Contact name is required.");
      isValid = false;
    }

    const contactMethods = buildContactMethods();

    if (contactMethods.length === 0) {
      const message = "Add at least one contact method.";
      setEmailError(message);
      setPhoneError(message);
      setSocialUrlError(message);
      isValid = false;
    }

    if (!notes.trim()) {
      setNotesError("Notes are required.");
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    try {
      setIsSaving(true);

      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to update this contact.",
        );
        return;
      }

      await updateContact(userId, contactId, {
        name: name.trim(),
        professionalTitle: professionalTitle.trim(),
        company: company.trim(),
        contactMethods,
        events: selectedEvents,
        notes: notes.trim(),
        categories,
        relationshipLabel,
      });

      Alert.alert("Success", "Contact updated successfully.");

      navigation.replace("ContactDetails", {
        contactId,
      });
    } catch (error) {
      Alert.alert("Update Contact Error", error.message);
    } finally {
      setIsSaving(false);
    }
  }

  const availableEvents = events.filter(
    (event) =>
      !selectedEvents.some((selectedEvent) => selectedEvent.id === event.id),
  );

  useEffect(() => {
    loadContact();
    loadEvents();
  }, [contactId]);

  useEffect(() => {
    const draft = route.params?.contactDraft;

    if (!draft) {
      return;
    }

    setName(draft.name || "");
    setProfessionalTitle(draft.professionalTitle || "");
    setCompany(draft.company || "");
    setEmail(draft.email || "");
    setPhone(draft.phone || "");
    setSocialUrl(draft.socialUrl || "");
    setNotes(draft.notes || "");
    setRelationshipLabel(draft.relationshipLabel || "");
    setCategories(draft.categories || []);
    setSelectedEvents(draft.selectedEvents || []);
  }, [route.params?.contactDraft]);

  useEffect(() => {
    if (route.params?.scannedUrl) {
      setSocialUrl(route.params.scannedUrl);

      if (emailError || phoneError || socialUrlError) {
        setEmailError("");
        setPhoneError("");
        setSocialUrlError("");
      }
    }
  }, [route.params?.scannedUrl]);

  useEffect(() => {
    if (route.params?.selectedEventId) {
      handleSelectEvent({
        id: route.params.selectedEventId,
        name: route.params.selectedEventName || "",
        date: route.params.selectedEventDate || "",
        location: route.params.selectedEventLocation || "",
      });
    }
  }, [route.params?.selectedEventId]);

  if (isLoading) {
    return (
      <AppScreen>
        <Text style={styles.message}>Loading contact...</Text>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Edit Contact"
          subtitle="Update saved networking information"
        />

        <ContactForm
          name={name}
          setName={handleNameChange}
          professionalTitle={professionalTitle}
          setProfessionalTitle={setProfessionalTitle}
          company={company}
          setCompany={setCompany}
          email={email}
          setEmail={handleEmailChange}
          phone={phone}
          setPhone={handlePhoneChange}
          socialUrl={socialUrl}
          setSocialUrl={handleSocialUrlChange}
          notes={notes}
          setNotes={handleNotesChange}
          selectedEvents={selectedEvents}
          onRemoveEvent={handleRemoveEvent}
          onCreateEvent={() =>
            navigation.navigate("CreateEvent", {
              returnScreen: "EditContact",
              contactId,
              contactDraft: buildContactDraft(),
            })
          }
          onScanQR={() =>
            navigation.navigate("QRScanner", {
              returnScreen: "EditContact",
              contactId,
              contactDraft: buildContactDraft(),
            })
          }
          relationshipLabel={relationshipLabel}
          setRelationshipLabel={setRelationshipLabel}
          categories={categories}
          setCategories={setCategories}
          onGenerateCategories={handleGenerateCategories}
          isGeneratingCategories={isGeneratingCategories}
          nameError={nameError}
          emailError={emailError}
          phoneError={phoneError}
          socialUrlError={socialUrlError}
          notesError={notesError}
          events={availableEvents}
          showEventDropdown={showEventDropdown}
          setShowEventDropdown={setShowEventDropdown}
          onSelectEventFromDropdown={handleSelectEvent}
        />

        <AppButton
          title={isSaving ? "Saving..." : "Save Changes"}
          onPress={handleUpdateContact}
          disabled={isSaving}
        />

        <View style={styles.bottomGap} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  message: {
    ...typography.body,
    color: colors.textMuted,
    margin: spacing.md,
  },

  bottomGap: {
    height: spacing.xl,
  },
});
