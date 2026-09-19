import { useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";

import AppScreen from "../../../shared/components/AppScreen";
import AppHeader from "../../../shared/components/AppHeader";
import AppButton from "../../../shared/components/AppButton";
import AppCard from "../../../shared/components/AppCard";
import AppTextArea from "../../../shared/components/AppTextArea";
import AppTag from "../../../shared/components/AppTag";

import { auth } from "../../../firebase/firebaseConfig";
import { getContacts } from "../../contacts/services/contactsService";
import { findContactsByDescription } from "../../ai/services/aiContactSearchService";

import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { radius } from "../../../theme/radius";

export default function AIContactSearchScreen({ navigation }) {
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  function handleDescriptionChange(text) {
    setDescription(text);

    if (descriptionError) {
      setDescriptionError("");
    }
  }

  async function handleSearch() {
    if (!description.trim()) {
      setDescriptionError("Describe the person you are looking for.");
      return;
    }

    try {
      setIsSearching(true);
      setHasSearched(false);
      setResults([]);

      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to search contacts.",
        );
        return;
      }

      const contacts = await getContacts(userId);

      if (contacts.length === 0) {
        setResults([]);
        setHasSearched(true);
        return;
      }

      const matches = await findContactsByDescription(description, contacts);

      const matchedContacts = matches
        .map((match) => {
          const contact = contacts.find((c) => c.id === match.id);

          if (!contact) {
            return null;
          }

          return {
            ...contact,
            reason: match.reason,
          };
        })
        .filter(Boolean);

      setResults(matchedContacts);
      setHasSearched(true);
    } catch (error) {
      Alert.alert("AI Search Error", error.message);
    } finally {
      setIsSearching(false);
    }
  }

  function getEventNames(contact) {
    if (contact.events && contact.events.length > 0) {
      return contact.events.map((event) => event.name).join(", ");
    }

    if (contact.eventName) {
      return contact.eventName;
    }

    return "";
  }

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader
          title="AI Contact Search"
          subtitle="Describe the person you're looking for in plain language"
        />

        <AppTextArea
          label="Description"
          placeholder={
            'e.g. "software engineer I met at a conference who was interested in AI and mentioned working on a startup"'
          }
          value={description}
          onChangeText={handleDescriptionChange}
          error={descriptionError}
        />

        <AppButton
          title={isSearching ? "Searching..." : "Find Contact"}
          onPress={handleSearch}
          disabled={isSearching}
        />

        {hasSearched && results.length === 0 ? (
          <AppCard style={styles.noResults}>
            <Text style={styles.noResultsTitle}>No matches found</Text>
            <Text style={styles.noResultsDetail}>
              Try rephrasing your description or adding more details like their
              role, company, or topics you discussed.
            </Text>
          </AppCard>
        ) : null}

        {results.map((contact) => (
          <AppCard
            key={contact.id}
            type="contact"
            title={contact.name}
            subtitle={`${contact.professionalTitle || "No title"}${
              contact.company ? ` · ${contact.company}` : ""
            }`}
            meta={
              getEventNames(contact)
                ? `Met at: ${getEventNames(contact)}`
                : "No event selected"
            }
          >
            <View style={styles.tagContainer}>
              {contact.relationshipLabel ? (
                <AppTag label={contact.relationshipLabel} variant="orange" />
              ) : null}

              {contact.categories?.map((category) => (
                <AppTag key={category} label={category} variant="purple" />
              ))}
            </View>

            <View style={styles.reasonBox}>
              <Text style={styles.reasonLabel}>Why this match</Text>
              <Text style={styles.reasonText}>{contact.reason}</Text>
            </View>

            <View style={styles.button}>
              <AppButton
                title="View Details"
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

        <View style={styles.bottomGap} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.xs,
  },

  reasonBox: {
    backgroundColor: "#F7F3FF",
    borderWidth: 1,
    borderColor: "#E7E2F2",
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.md,
  },

  reasonLabel: {
    ...typography.small,
    color: colors.primary,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },

  reasonText: {
    ...typography.small,
    color: colors.text,
    lineHeight: 18,
  },

  button: {
    marginTop: spacing.md,
  },

  noResults: {
    marginTop: spacing.md,
  },

  noResultsTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },

  noResultsDetail: {
    ...typography.body,
    color: colors.textMuted,
  },

  bottomGap: {
    height: spacing.xl,
  },
});
