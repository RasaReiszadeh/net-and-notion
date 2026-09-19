import { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Pressable,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Clipboard from "expo-clipboard";
import { Feather } from "@expo/vector-icons";

import AppScreen from "../../../shared/components/AppScreen";
import AppContactHeader from "../../../shared/components/AppContactHeader";
import AppCard from "../../../shared/components/AppCard";
import AppButton from "../../../shared/components/AppButton";
import AppInput from "../../../shared/components/AppInput";
import AppTag from "../../../shared/components/AppTag";

import { auth } from "../../../firebase/firebaseConfig";
import { getContactById, deleteContact } from "../services/contactsService";
import { createReminder } from "../../reminders/services/remindersService";

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

export default function ContactDetailsScreen({ route, navigation }) {
  const { contactId } = route.params || {};
  const today = new Date();

  const [contact, setContact] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [reminderTitle, setReminderTitle] = useState("");
  const [selectedReminderDate, setSelectedReminderDate] = useState(today);
  const [reminderDate, setReminderDate] = useState(formatDisplayDate(today));
  const [showReminderDatePicker, setShowReminderDatePicker] = useState(false);

  const [isCreatingReminder, setIsCreatingReminder] = useState(false);

  function getContactMethodLabel(type) {
    if (type === "phone") return "Phone";
    if (type === "email") return "Email";
    return "LinkedIn";
  }

  async function copyToClipboard(value) {
    await Clipboard.setStringAsync(value);
    Alert.alert("Copied", `"${value}" copied to clipboard.`);
  }

  function handleReminderDateChange(event, pickedDate) {
    if (!pickedDate) return;

    setSelectedReminderDate(pickedDate);
    setReminderDate(formatDisplayDate(pickedDate));
  }

  async function loadContact() {
    try {
      setIsLoading(true);

      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to view this contact.",
        );
        return;
      }

      if (!contactId) {
        Alert.alert("Missing Contact", "No contact was selected.");
        navigation.navigate("ContactList");
        return;
      }

      const selectedContact = await getContactById(userId, contactId);

      if (!selectedContact) {
        Alert.alert("Not Found", "This contact does not exist.");
        navigation.navigate("ContactList");
        return;
      }

      setContact(selectedContact);
    } catch (error) {
      Alert.alert("Contact Details Error", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleDeleteContact() {
    Alert.alert(
      "Delete Contact",
      "Are you sure you want to delete this contact? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDeleteContact,
        },
      ],
    );
  }

  async function confirmDeleteContact() {
    try {
      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to delete this contact.",
        );
        return;
      }

      await deleteContact(userId, contactId);

      Alert.alert("Deleted", "Contact deleted successfully.");
      navigation.navigate("ContactList");
    } catch (error) {
      Alert.alert("Delete Contact Error", error.message);
    }
  }

  async function handleCreateReminder() {
    if (!reminderTitle.trim()) {
      Alert.alert("Missing Information", "Reminder title is required.");
      return;
    }

    try {
      setIsCreatingReminder(true);

      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to create a reminder.",
        );
        return;
      }

      await createReminder(userId, {
        contactId: contact.id,
        contactName: contact.name,
        title: reminderTitle.trim(),
        dueDate: reminderDate.trim(),
      });

      setReminderTitle("");
      setSelectedReminderDate(new Date());
      setReminderDate(formatDisplayDate(new Date()));
      setShowReminderDatePicker(false);

      Alert.alert("Success", "Reminder created for this contact.");
    } catch (error) {
      Alert.alert("Create Reminder Error", error.message);
    } finally {
      setIsCreatingReminder(false);
    }
  }

  useEffect(() => {
    loadContact();
  }, [contactId]);

  if (isLoading) {
    return (
      <AppScreen>
        <Text style={styles.message}>Loading contact...</Text>
      </AppScreen>
    );
  }

  if (!contact) {
    return (
      <AppScreen>
        <Text style={styles.message}>No contact selected.</Text>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppContactHeader
          name={contact.name}
          professionalTitle={contact.professionalTitle}
          company={contact.company}
        />

        <AppCard>
          <Text style={styles.sectionTitle}>Contact</Text>

          {contact.contactMethods && contact.contactMethods.length > 0 ? (
            contact.contactMethods.map((method, index) => (
              <View
                key={index}
                style={[
                  styles.contactMethodRow,
                  index === contact.contactMethods.length - 1 &&
                    styles.lastContactMethodRow,
                ]}
              >
                <View style={styles.contactMethodTextBox}>
                  <Text style={styles.contactMethodLabel}>
                    {getContactMethodLabel(method.type)}
                  </Text>

                  <Text style={styles.contactMethodValue}>{method.value}</Text>
                </View>

                <Pressable
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(method.value)}
                >
                  <Feather name="copy" size={18} color={colors.primary} />
                </Pressable>
              </View>
            ))
          ) : (
            <Text style={styles.text}>No contact methods saved.</Text>
          )}
        </AppCard>

        <AppCard>
          <Text style={styles.sectionTitle}>Event Context</Text>

          {contact.events && contact.events.length > 0 ? (
            contact.events.map((event) => (
              <AppCard
                key={event.id}
                type="event"
                title={event.name}
                subtitle={event.location || "No location"}
                meta={event.date || "No date"}
                style={styles.innerEventCard}
              />
            ))
          ) : contact.eventId ? (
            <AppCard
              type="event"
              title={contact.eventName}
              subtitle={contact.eventLocation || "No location"}
              meta={contact.eventDate || "No date"}
              style={styles.innerEventCard}
            />
          ) : (
            <Text style={styles.text}>No event selected.</Text>
          )}
        </AppCard>

        <AppCard>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.text}>
            {contact.notes ? contact.notes : "No notes saved."}
          </Text>
        </AppCard>

        <AppCard>
          <Text style={styles.sectionTitle}>Relationship & Categories</Text>

          {contact.relationshipLabel ||
          (contact.categories && contact.categories.length > 0) ? (
            <View style={styles.tagContainer}>
              {contact.relationshipLabel ? (
                <AppTag label={contact.relationshipLabel} variant="pink" />
              ) : null}

              {contact.categories?.map((category) => (
                <AppTag key={category} label={category} variant="purple" />
              ))}
            </View>
          ) : (
            <Text style={styles.text}>
              No relationship or categories saved yet.
            </Text>
          )}
        </AppCard>

        <AppCard>
          <Text style={styles.sectionTitle}>Follow-Up Reminder</Text>

          <AppInput
            label="Reminder Title"
            placeholder="Follow up about internship opportunity"
            value={reminderTitle}
            onChangeText={setReminderTitle}
          />

          <Text style={styles.dateLabel}>Due Date</Text>

          <Pressable
            style={styles.datePickerButton}
            onPress={() => setShowReminderDatePicker(!showReminderDatePicker)}
          >
            <View>
              <Text style={styles.dateText}>{reminderDate}</Text>

              <Text style={styles.dateHint}>
                {showReminderDatePicker
                  ? "Tap again to hide calendar"
                  : "Tap to select a date"}
              </Text>
            </View>

            <Text style={styles.calendarIcon}>📅</Text>
          </Pressable>

          {showReminderDatePicker ? (
            <View style={styles.inlineDatePickerBox}>
              <DateTimePicker
                value={selectedReminderDate}
                mode="date"
                display="inline"
                onChange={handleReminderDateChange}
              />
            </View>
          ) : null}

          <AppButton
            title={
              isCreatingReminder ? "Saving Reminder..." : "Create Reminder"
            }
            variant="secondary"
            onPress={handleCreateReminder}
            disabled={isCreatingReminder}
          />
        </AppCard>

        <View style={styles.buttonGap}>
          <AppButton
            title="Share Contact QR"
            onPress={() =>
              navigation.navigate("ContactQRCode", {
                contactId: contact.id,
              })
            }
          />
        </View>

        <View style={styles.buttonGap}>
          <AppButton
            title="Edit Contact"
            variant="secondary"
            onPress={() =>
              navigation.navigate("EditContact", {
                contactId: contact.id,
              })
            }
          />
        </View>

        <AppButton
          title="Delete Contact"
          variant="secondary"
          onPress={handleDeleteContact}
        />

        <View style={styles.bottomGap} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  text: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },

  contactMethodRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E2F2",
  },

  lastContactMethodRow: {
    borderBottomWidth: 0,
  },

  contactMethodTextBox: {
    flex: 1,
  },

  contactMethodLabel: {
    ...typography.small,
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: 2,
  },

  contactMethodValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: "500",
  },

  copyButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  copyText: {
    fontSize: 18,
  },

  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.xs,
  },

  message: {
    ...typography.body,
    color: colors.textMuted,
    margin: spacing.md,
  },

  buttonGap: {
    marginBottom: spacing.md,
  },

  bottomGap: {
    height: spacing.xl,
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

  innerEventCard: {
    marginBottom: spacing.sm,
  },
});
