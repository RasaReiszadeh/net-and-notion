import { useCallback, useState } from "react";
import { Text, View, StyleSheet, Alert, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import AppScreen from "../../../shared/components/AppScreen";
import AppHeader from "../../../shared/components/AppHeader";
import AppCard from "../../../shared/components/AppCard";
import AppButton from "../../../shared/components/AppButton";
import AppTag from "../../../shared/components/AppTag";
import SearchBar from "../../../shared/components/SearchBar";

import { auth } from "../../../firebase/firebaseConfig";
import { getContacts } from "../../contacts/services/contactsService";

import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";

export default function SearchContactsScreen({ navigation }) {
  const [contacts, setContacts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function loadContacts() {
    try {
      setIsLoading(true);

      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to search contacts.",
        );
        return;
      }

      const userContacts = await getContacts(userId);
      setContacts(userContacts);
    } catch (error) {
      Alert.alert("Search Contacts Error", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function getEventNames(contact) {
    if (contact.events && contact.events.length > 0) {
      return contact.events.map((event) => event.name).join(" ");
    }

    if (contact.eventName) {
      return contact.eventName;
    }

    return "";
  }

  function contactMatchesSearch(contact) {
    const query = normalize(searchText);

    if (!query) {
      return true;
    }

    const searchableText = [
      contact.name,
      contact.company,
      contact.professionalTitle,
      getEventNames(contact),
      contact.notes,
      contact.relationshipLabel,
      ...(contact.categories || []),
      ...(contact.contactMethods || []).map((method) => method.value),
    ]
      .map(normalize)
      .join(" ");

    return searchableText.includes(query);
  }

  const filteredContacts = contacts.filter(contactMatchesSearch);

  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, []),
  );

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Search Contacts"
          subtitle="Search by name, company, title, event, notes, categories, or contact methods"
        />

        <SearchBar
          placeholder="Search contacts..."
          value={searchText}
          onChangeText={setSearchText}
        />

        <AppCard>
          <Text style={styles.filterTitle}>Searchable Fields</Text>
          <Text style={styles.filter}>
            Name · Company · Title · Event · Notes · Categories · Contact
            Methods
          </Text>
        </AppCard>

        {isLoading ? (
          <Text style={styles.message}>Loading contacts...</Text>
        ) : null}

        {!isLoading && filteredContacts.length === 0 ? (
          <AppCard>
            <Text style={styles.name}>No contacts found</Text>
            <Text style={styles.detail}>
              Try another name, event, company, note, or category.
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
                <AppTag label={contact.relationshipLabel} variant="orange" />
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

  name: {
    ...typography.subtitle,
    color: colors.text,
  },

  detail: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
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
