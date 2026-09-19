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

import AppScreen from "../../../shared/components/AppScreen";
import AppHeader from "../../../shared/components/AppHeader";
import AppButton from "../../../shared/components/AppButton";
import AppCard from "../../../shared/components/AppCard";
import SearchBar from "../../../shared/components/SearchBar";
import AppTag from "../../../shared/components/AppTag";

import { auth } from "../../../firebase/firebaseConfig";
import { getContacts } from "../services/contactsService";

import {
  contactCategories,
  relationshipLabels,
} from "../constants/contactOptions";

import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";

export default function ContactListScreen({ navigation }) {
  const [contacts, setContacts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedRelationship, setSelectedRelationship] = useState("All");
  const [isLoading, setIsLoading] = useState(false);

  async function loadContacts() {
    try {
      setIsLoading(true);

      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to view contacts.",
        );
        return;
      }

      const userContacts = await getContacts(userId);
      setContacts(userContacts);
    } catch (error) {
      Alert.alert("Contacts Error", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, []),
  );

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function matchesSearch(contact) {
    const query = normalize(searchText);

    if (!query) return true;

    const searchableText = [
      contact.name,
      contact.company,
      contact.professionalTitle,
      getEventNames(contact),
      contact.notes,
      contact.relationshipLabel,
      ...(contact.categories || []),
    ]
      .map(normalize)
      .join(" ");

    return searchableText.includes(query);
  }

  function matchesCategory(contact) {
    if (selectedCategory === "All") return true;
    return (contact.categories || []).includes(selectedCategory);
  }

  function matchesRelationship(contact) {
    if (selectedRelationship === "All") return true;
    return contact.relationshipLabel === selectedRelationship;
  }

  function getEventNames(contact) {
    if (contact.events && contact.events.length > 0) {
      return contact.events.map((event) => event.name).join(" · ");
    }

    if (contact.eventName) {
      return contact.eventName;
    }

    return "";
  }

  const filteredContacts = contacts.filter(
    (contact) =>
      matchesSearch(contact) &&
      matchesCategory(contact) &&
      matchesRelationship(contact),
  );

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <AppHeader
          title="Contacts"
          subtitle="Browse and filter your networking connections"
        />

        <SearchBar
          placeholder="Search by name, company, event, notes..."
          value={searchText}
          onChangeText={setSearchText}
        />

        <AppCard>
          <Text style={styles.filterTitle}>Filter by Category</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {["All", ...contactCategories].map((category) => {
              const isSelected = selectedCategory === category;

              return (
                <Pressable
                  key={category}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.filterTitle}>Filter by Relationship</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {["All", ...relationshipLabels].map((label) => {
              const isSelected = selectedRelationship === label;

              return (
                <Pressable
                  key={label}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setSelectedRelationship(label)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.aiSearchRow}>
            <Text style={styles.aiSearchHint}>Can't find them by tag?</Text>
            <Pressable onPress={() => navigation.navigate("AIContactSearch")}>
              <Text style={styles.aiSearchLink}>Try AI Search</Text>
            </Pressable>
          </View>
        </AppCard>

        {isLoading ? (
          <Text style={styles.message}>Loading contacts...</Text>
        ) : null}

        {!isLoading && filteredContacts.length === 0 ? (
          <AppCard>
            <Text style={styles.name}>No contacts found</Text>
            <Text style={styles.detail}>
              Add your first networking contact or adjust your filters.
            </Text>
          </AppCard>
        ) : null}

        {filteredContacts.map((contact) => (
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
                <AppTag label={contact.relationshipLabel} variant="pink" />
              ) : null}

              {contact.categories?.map((category) => (
                <AppTag key={category} label={category} variant="purple" />
              ))}
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
      </ScrollView>

      <View style={styles.fixedButtonContainer}>
        <AppButton
          title="Add New Contact"
          onPress={() => navigation.navigate("CreateContact")}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  filterTitle: {
    ...typography.small,
    color: colors.text,
    fontWeight: "600",
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },

  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
  },

  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  chipText: {
    ...typography.small,
    color: colors.text,
  },

  chipTextSelected: {
    color: colors.surface,
    fontWeight: "600",
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

  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.md,
  },

  button: {
    marginTop: spacing.md,
  },

  message: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },

  scrollContent: {
    paddingBottom: 140,
  },

  fixedButtonContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },

  aiSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E7E2F2",
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },

  aiSearchHint: {
    ...typography.small,
    color: colors.textMuted,
  },

  aiSearchLink: {
    ...typography.small,
    color: colors.primary,
    fontWeight: "700",
  },
});
