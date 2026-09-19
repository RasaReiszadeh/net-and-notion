import { useState, useEffect } from "react";
import { ScrollView, View, StyleSheet, Alert } from "react-native";

import AppScreen from "../../../shared/components/AppScreen";
import AppHeader from "../../../shared/components/AppHeader";
import AppButton from "../../../shared/components/AppButton";

import ContactForm from "../components/ContactForm";

import { generateCategoriesFromNotes } from "../../ai/services/aiCategoryService";
import { getEvents } from "../../events/services/eventsService";

import { auth } from "../../../firebase/firebaseConfig";
import { createContact } from "../services/contactsService";

import { spacing } from "../../../theme/spacing";

export default function CreateContactScreen({ route, navigation }) {
  const selectedEventId = route.params?.selectedEventId || "";
  const selectedEventName = route.params?.selectedEventName || "";
  const selectedEventDate = route.params?.selectedEventDate || "";
  const selectedEventLocation = route.params?.selectedEventLocation || "";

  const [name, setName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [company, setCompany] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [socialUrl, setSocialUrl] = useState(route.params?.scannedUrl || "");

  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  const [selectedEvents, setSelectedEvents] = useState(() => {
    if (!selectedEventId) {
      return [];
    }

    return [
      {
        id: selectedEventId,
        name: selectedEventName,
        date: selectedEventDate,
        location: selectedEventLocation,
      },
    ];
  });

  function handleNameChange(text) {
    setName(text);

    if (nameError) {
      setNameError("");
    }
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

    if (notesError) {
      setNotesError("");
    }
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

  async function handleSaveContact() {
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
          "You must be logged in to create a contact.",
        );
        return;
      }

      await createContact(userId, {
        name: name.trim(),
        professionalTitle: professionalTitle.trim(),
        company: company.trim(),
        contactMethods,
        events: selectedEvents,
        notes: notes.trim(),
        categories,
        relationshipLabel,
      });

      Alert.alert("Success", "Contact created successfully.");
      navigation.replace("ContactList");
    } catch (error) {
      Alert.alert("Create Contact Error", error.message);
    } finally {
      setIsSaving(false);
    }
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

  const availableEvents = events.filter(
    (event) =>
      !selectedEvents.some((selectedEvent) => selectedEvent.id === event.id),
  );

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

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Add Contact"
          subtitle="Save a new networking connection"
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
              returnScreen: "CreateContact",
              contactDraft: buildContactDraft(),
            })
          }
          onScanQR={() =>
            navigation.navigate("QRScanner", {
              returnScreen: "CreateContact",
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
          title={isSaving ? "Saving..." : "Save Contact"}
          onPress={handleSaveContact}
          disabled={isSaving}
        />

        <View style={styles.bottomGap} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  bottomGap: {
    height: spacing.xl,
  },
});
