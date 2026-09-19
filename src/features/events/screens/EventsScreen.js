import { useCallback, useState } from "react";
import { Text, View, StyleSheet, Alert, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import AppScreen from "../../../shared/components/AppScreen";
import AppHeader from "../../../shared/components/AppHeader";
import AppCard from "../../../shared/components/AppCard";
import AppButton from "../../../shared/components/AppButton";

import { auth } from "../../../firebase/firebaseConfig";
import { getEvents } from "../services/eventsService";

import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";

export default function EventsScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function loadEvents() {
    try {
      setIsLoading(true);

      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to view events.",
        );
        return;
      }

      const userEvents = await getEvents(userId);
      setEvents(userEvents);
    } catch (error) {
      Alert.alert("Events Error", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, []),
  );

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Events"
          subtitle="Create and reuse networking events"
        />

        <View style={styles.buttonGap}>
          <AppButton
            title="Create New Event"
            onPress={() => navigation.navigate("CreateEvent")}
          />
        </View>

        {isLoading ? (
          <Text style={styles.message}>Loading events...</Text>
        ) : null}

        {!isLoading && events.length === 0 ? (
          <AppCard>
            <Text style={styles.name}>No events yet</Text>
            <Text style={styles.detail}>
              Create your first event and reuse it when saving contacts.
            </Text>
          </AppCard>
        ) : null}

        {events.map((event) => (
          <AppCard
            key={event.id}
            type="event"
            title={event.name}
            subtitle={event.location || "No location"}
            meta={event.date || "No date"}
          >
            {event.notes ? (
              <Text style={styles.notes}>{event.notes}</Text>
            ) : null}

            <View style={styles.cardButton}>
              <AppButton
                title="View Event"
                variant="secondary"
                onPress={() =>
                  navigation.navigate("EventDetails", {
                    eventId: event.id,
                  })
                }
              />
            </View>
          </AppCard>
        ))}

        <View style={styles.bottomGap} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  buttonGap: {
    marginBottom: spacing.md,
  },

  name: {
    ...typography.subtitle,
    color: colors.text,
  },

  detail: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  notes: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },

  message: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },

  cardButton: {
    marginTop: spacing.md,
  },

  bottomGap: {
    height: spacing.xl,
  },
});
