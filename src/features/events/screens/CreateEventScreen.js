import { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import AppScreen from "../../../shared/components/AppScreen";
import AppHeader from "../../../shared/components/AppHeader";
import AppInput from "../../../shared/components/AppInput";
import AppTextArea from "../../../shared/components/AppTextArea";
import AppButton from "../../../shared/components/AppButton";
import AppCard from "../../../shared/components/AppCard";

import { auth } from "../../../firebase/firebaseConfig";
import { createEvent } from "../services/eventsService";

import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";

function formatDisplayDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function CreateEventScreen({ route, navigation }) {
  const returnScreen = route.params?.returnScreen || "";
  const contactDraft = route.params?.contactDraft || null;

  const today = new Date();

  const [name, setName] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);
  const [date, setDate] = useState(formatDisplayDate(today));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function handleDateChange(event, pickedDate) {
    if (!pickedDate) {
      return;
    }

    setSelectedDate(pickedDate);
    setDate(formatDisplayDate(pickedDate));
  }

  async function handleSaveEvent() {
    if (!name.trim()) {
      Alert.alert("Missing Information", "Event name is required.");
      return;
    }

    try {
      setIsSaving(true);

      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to create an event.",
        );
        return;
      }

      const createdEvent = await createEvent(userId, {
        name: name.trim(),
        date: date.trim(),
        location: location.trim(),
        notes: notes.trim(),
      });

      Alert.alert("Success", "Event created successfully.");

      if (returnScreen === "CreateContact") {
        navigation.replace("CreateContact", {
          contactDraft: {
            ...(contactDraft || {}),
            selectedEventId: createdEvent.id,
            selectedEventName: createdEvent.name,
            selectedEventDate: createdEvent.date,
            selectedEventLocation: createdEvent.location,
          },
        });
      } else if (returnScreen === "EditContact") {
        navigation.replace("EditContact", {
          contactId: contactDraft?.contactId,
          contactDraft: {
            ...(contactDraft || {}),
            selectedEventId: createdEvent.id,
            selectedEventName: createdEvent.name,
            selectedEventDate: createdEvent.date,
            selectedEventLocation: createdEvent.location,
          },
        });
      } else {
        navigation.navigate("Events");
      }
    } catch (error) {
      Alert.alert("Create Event Error", error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Create Event"
          subtitle="Save an event to reuse it when creating contacts"
          hideBackButton={returnScreen === "CreateContact"}
        />

        <AppCard
          type="event"
          title={name.trim() || "New Event"}
          subtitle={location.trim() || "No location yet"}
          meta={date || "No date"}
        >
          <Text style={styles.sectionTitle}>Event Information</Text>

          <AppInput
            label="Event Name"
            placeholder="Tech Summit 2026"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.dateLabel}>Event Date</Text>

          <Pressable
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(!showDatePicker)}
          >
            <View>
              <Text style={styles.dateText}>{date}</Text>
              <Text style={styles.dateHint}>
                {showDatePicker
                  ? "Tap again to hide calendar"
                  : "Tap to select a date"}
              </Text>
            </View>

            <Text style={styles.calendarIcon}>📅</Text>
          </Pressable>

          {showDatePicker ? (
            <View style={styles.inlineDatePickerBox}>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="inline"
                onChange={handleDateChange}
              />
            </View>
          ) : null}

          <AppInput
            label="Location"
            placeholder="Toronto, Seneca, Online..."
            value={location}
            onChangeText={setLocation}
          />

          <AppTextArea
            label="Event Notes"
            placeholder="Add useful details about this event..."
            value={notes}
            onChangeText={setNotes}
          />
        </AppCard>

        <AppButton
          title={isSaving ? "Saving..." : "Save Event"}
          onPress={handleSaveEvent}
          disabled={isSaving}
        />

        {returnScreen === "CreateContact" || returnScreen === "EditContact" ? (
          <View style={styles.returnButton}>
            <AppButton
              title={
                returnScreen === "EditContact"
                  ? "Back to Edit Contact"
                  : "Back to Create Contact"
              }
              variant="secondary"
              onPress={() =>
                navigation.replace(returnScreen, {
                  contactId: contactDraft?.contactId,
                  contactDraft,
                })
              }
            />
          </View>
        ) : null}

        <View style={styles.bottomGap} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.md,
  },

  bottomGap: {
    height: spacing.xl,
  },

  returnButton: {
    marginTop: spacing.md,
  },

  dateLabel: {
    ...typography.small,
    color: colors.text,
    marginBottom: spacing.xs,
  },

  datePickerButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dateText: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
  },

  dateHint: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  calendarIcon: {
    fontSize: 22,
  },

  inlineDatePickerBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
});
