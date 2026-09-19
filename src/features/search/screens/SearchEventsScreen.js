import { useCallback, useState } from "react";
import { Text, View, StyleSheet, Alert, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import AppScreen from "../../../shared/components/AppScreen";
import AppHeader from "../../../shared/components/AppHeader";
import AppCard from "../../../shared/components/AppCard";
import AppButton from "../../../shared/components/AppButton";
import SearchBar from "../../../shared/components/SearchBar";

import { auth } from "../../../firebase/firebaseConfig";
import { getEvents } from "../../events/services/eventsService";

import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";

export default function SearchEventsScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function loadEvents() {
    try {
      setIsLoading(true);

      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to search events.",
        );
        return;
      }

      const userEvents = await getEvents(userId);
      setEvents(userEvents);
    } catch (error) {
      Alert.alert("Search Events Error", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, []),
  );

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function eventMatchesSearch(event) {
    const query = normalize(searchText);

    if (!query) {
      return true;
    }

    const searchableText = [event.name, event.date, event.location, event.notes]
      .map(normalize)
      .join(" ");

    return searchableText.includes(query);
  }

  const filteredEvents = events.filter(eventMatchesSearch);

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Search Events"
          subtitle="Find networking events by name, date, location, or notes"
        />

        <SearchBar
          placeholder="Search events..."
          value={searchText}
          onChangeText={setSearchText}
        />

        <AppCard>
          <Text style={styles.filterTitle}>Searchable Fields</Text>
          <Text style={styles.filter}>Name · Date · Location · Notes</Text>
        </AppCard>

        {isLoading ? (
          <Text style={styles.message}>Loading events...</Text>
        ) : null}

        {!isLoading && filteredEvents.length === 0 ? (
          <AppCard>
            <Text style={styles.name}>No events found</Text>
            <Text style={styles.detail}>
              Try another event name, date, location, or note.
            </Text>
          </AppCard>
        ) : null}

        {filteredEvents.map((event) => (
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

            <View style={styles.button}>
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
  filterTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },

  filter: {
    ...typography.body,
    color: colors.primary,
  },

  notes: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },

  button: {
    marginTop: spacing.md,
  },

  message: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },

  bottomGap: {
    height: spacing.xl,
  },
});
