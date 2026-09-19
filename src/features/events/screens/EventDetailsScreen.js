import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Alert, ScrollView } from "react-native";

import AppScreen from "../../../shared/components/AppScreen";
import AppHeader from "../../../shared/components/AppHeader";
import AppCard from "../../../shared/components/AppCard";
import AppButton from "../../../shared/components/AppButton";

import { auth } from "../../../firebase/firebaseConfig";
import { getEventById } from "../services/eventsService";
import { getContactsByEventId } from "../../contacts/services/contactsService";

import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";

export default function EventDetailsScreen({ route, navigation }) {
  const { eventId } = route.params || {};

  const [event, setEvent] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function loadEventDetails() {
    try {
      setIsLoading(true);

      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to view this event.",
        );
        return;
      }

      if (!eventId) {
        Alert.alert("Missing Event", "No event was selected.");
        navigation.navigate("Events");
        return;
      }

      const selectedEvent = await getEventById(userId, eventId);

      if (!selectedEvent) {
        Alert.alert("Not Found", "This event does not exist.");
        navigation.navigate("Events");
        return;
      }

      const eventContacts = await getContactsByEventId(userId, eventId);

      setEvent(selectedEvent);
      setContacts(eventContacts);
    } catch (error) {
      Alert.alert("Event Details Error", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  if (isLoading) {
    return (
      <AppScreen>
        <Text style={styles.message}>Loading event...</Text>
      </AppScreen>
    );
  }

  if (!event) {
    return (
      <AppScreen>
        <Text style={styles.message}>No event selected.</Text>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader
          title={event.name}
          subtitle={`${event.location || "No location"} · ${event.date}`}
        />

        <AppCard
          type="event"
          title={event.name}
          subtitle={event.location || "No location"}
          meta={event.date || "No date"}
        >
          <Text style={styles.text}>
            {event.notes ? event.notes : "No notes saved for this event."}
          </Text>
        </AppCard>

        <AppCard>
          <Text style={styles.sectionTitle}>Contacts from this Event</Text>

          {contacts.length === 0 ? (
            <Text style={styles.text}>
              No contacts have been connected to this event yet.
            </Text>
          ) : null}

          {contacts.map((contact) => (
            <AppCard
              key={contact.id}
              type="contact"
              title={contact.name}
              subtitle={`${contact.professionalTitle || "No title"}${
                contact.company ? ` · ${contact.company}` : ""
              }`}
              meta="Connected to this event"
            >
              <View style={styles.smallButton}>
                <AppButton
                  title="View Contact"
                  variant="secondary"
                  onPress={() =>
                    navigation.navigate("ContactDetails", {
                      contactId: contact.id,
                    })
                  }
                />
              </View>
            </AppCard>
          ))}
        </AppCard>

        <View style={styles.buttonGap}>
          <AppButton
            title="Add Contact from this Event"
            onPress={() =>
              navigation.navigate("CreateContact", {
                selectedEventId: event.id,
                selectedEventName: event.name,
                selectedEventDate: event.date,
                selectedEventLocation: event.location,
              })
            }
          />
        </View>

        <AppButton
          title="Back to Events"
          variant="secondary"
          onPress={() => navigation.navigate("Events")}
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
    marginTop: spacing.xs,
  },

  smallButton: {
    marginTop: spacing.sm,
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
});
