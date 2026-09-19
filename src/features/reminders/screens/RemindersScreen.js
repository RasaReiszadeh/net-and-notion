import { useCallback, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Pressable,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";

import AppScreen from "../../../shared/components/AppScreen";
import AppHeader from "../../../shared/components/AppHeader";
import AppCard from "../../../shared/components/AppCard";
import AppButton from "../../../shared/components/AppButton";
import AppInput from "../../../shared/components/AppInput";
import AppTag from "../../../shared/components/AppTag";

import { auth } from "../../../firebase/firebaseConfig";
import {
  createReminder,
  getReminders,
  updateReminderStatus,
  deleteReminder,
} from "../services/remindersService";

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

export default function RemindersScreen() {
  const today = new Date();

  const [reminders, setReminders] = useState([]);
  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(today);
  const [dueDate, setDueDate] = useState(formatDisplayDate(today));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function handleDateChange(event, pickedDate) {
    if (!pickedDate) {
      return;
    }

    setSelectedDate(pickedDate);
    setDueDate(formatDisplayDate(pickedDate));
  }

  async function loadReminders() {
    try {
      setIsLoading(true);

      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to view reminders.",
        );
        return;
      }

      const userReminders = await getReminders(userId);
      setReminders(userReminders);
    } catch (error) {
      Alert.alert("Reminders Error", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateReminder() {
    if (!title.trim()) {
      Alert.alert("Missing Information", "Reminder title is required.");
      return;
    }

    try {
      setIsSaving(true);

      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to create reminders.",
        );
        return;
      }

      await createReminder(userId, {
        title: title.trim(),
        dueDate: dueDate.trim(),
      });
      setTitle("");
      setSelectedDate(new Date());
      setDueDate(formatDisplayDate(new Date()));
      setShowDatePicker(false);

      await loadReminders();
    } catch (error) {
      Alert.alert("Create Reminder Error", error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleReminder(reminder) {
    try {
      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to update reminders.",
        );
        return;
      }

      await updateReminderStatus(userId, reminder.id, !reminder.completed);
      await loadReminders();
    } catch (error) {
      Alert.alert("Update Reminder Error", error.message);
    }
  }

  function handleDeleteReminder(reminderId) {
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => confirmDeleteReminder(reminderId),
        },
      ],
    );
  }

  async function confirmDeleteReminder(reminderId) {
    try {
      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to delete reminders.",
        );
        return;
      }

      await deleteReminder(userId, reminderId);
      await loadReminders();
    } catch (error) {
      Alert.alert("Delete Reminder Error", error.message);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, []),
  );

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Reminders"
          subtitle="Follow up with important contacts"
        />

        <AppCard>
          <Text style={styles.sectionTitle}>Create Reminder</Text>

          <AppInput
            label="Title"
            placeholder="Follow up with Sarah"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.dateLabel}>Due Date</Text>

          <Pressable
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(!showDatePicker)}
          >
            <View>
              <Text style={styles.dateText}>{dueDate}</Text>

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

          <AppButton
            title={isSaving ? "Saving..." : "Add Reminder"}
            onPress={handleCreateReminder}
            disabled={isSaving}
          />
        </AppCard>

        {isLoading ? (
          <Text style={styles.message}>Loading reminders...</Text>
        ) : null}

        {!isLoading && reminders.length === 0 ? (
          <AppCard>
            <Text style={styles.name}>No reminders yet</Text>
            <Text style={styles.detail}>
              Create a reminder to follow up with a networking contact.
            </Text>
          </AppCard>
        ) : null}

        {reminders.map((reminder) => (
          <AppCard
            key={reminder.id}
            type="event"
            title={reminder.title}
            subtitle={
              reminder.contactName
                ? `Contact: ${reminder.contactName}`
                : "General reminder"
            }
            meta={`Due: ${reminder.dueDate}`}
          >
            <View style={styles.tagContainer}>
              <AppTag
                label={reminder.completed ? "Completed" : "Pending"}
                variant={reminder.completed ? "green" : "orange"}
              />
            </View>

            <View style={styles.buttonGap}>
              <AppButton
                title={reminder.completed ? "Mark Pending" : "Mark Complete"}
                variant="secondary"
                onPress={() => handleToggleReminder(reminder)}
              />
            </View>

            <AppButton
              title="Delete Reminder"
              variant="secondary"
              onPress={() => handleDeleteReminder(reminder.id)}
            />
          </AppCard>
        ))}

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

  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.md,
    marginBottom: spacing.md,
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

  message: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },

  buttonGap: {
    marginBottom: spacing.sm,
  },

  bottomGap: {
    height: spacing.xl,
  },
});
