import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Alert, ScrollView } from "react-native";
import QRCode from "react-native-qrcode-svg";

import AppScreen from "../../../shared/components/AppScreen";
import AppHeader from "../../../shared/components/AppHeader";
import AppCard from "../../../shared/components/AppCard";
import AppButton from "../../../shared/components/AppButton";

import { auth } from "../../../firebase/firebaseConfig";
import { getContactById } from "../services/contactsService";

import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";

export default function ContactQRCodeScreen({ route, navigation }) {
  const { contactId } = route.params || {};

  const [contact, setContact] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadContact() {
    try {
      setIsLoading(true);

      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to share a contact.",
        );
        return;
      }

      if (!contactId) {
        Alert.alert("Missing Contact", "No contact was selected.");
        navigation.goBack();
        return;
      }

      const selectedContact = await getContactById(userId, contactId);

      if (!selectedContact) {
        Alert.alert("Not Found", "This contact does not exist.");
        navigation.goBack();
        return;
      }

      setContact(selectedContact);
    } catch (error) {
      Alert.alert("QR Code Error", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function buildQRValue() {
    return JSON.stringify({
      type: "netnotion-contact-card",
      version: 1,
      name: contact.name || "",
      professionalTitle: contact.professionalTitle || "",
      company: contact.company || "",
      contactMethods: contact.contactMethods || [],
      notes: contact.notes || "",
      categories: contact.categories || [],
      relationshipLabel: contact.relationshipLabel || "",
    });
  }

  useEffect(() => {
    loadContact();
  }, [contactId]);

  if (isLoading) {
    return (
      <AppScreen>
        <Text style={styles.message}>Loading QR code...</Text>
      </AppScreen>
    );
  }

  if (!contact) {
    return (
      <AppScreen>
        <Text style={styles.message}>No contact available.</Text>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Contact QR"
          subtitle="Let another user scan this code to save this contact"
        />

        <AppCard>
          <View style={styles.qrContainer}>
            <QRCode value={buildQRValue()} size={240} />
          </View>

          <Text style={styles.name}>{contact.name}</Text>

          <Text style={styles.subtitle}>
            {contact.professionalTitle || "No title"}
            {contact.company ? ` · ${contact.company}` : ""}
          </Text>

          <Text style={styles.helperText}>
            This QR code contains this contact's shared profile information.
          </Text>
        </AppCard>

        <AppButton
          title="Back to Contact"
          variant="secondary"
          onPress={() => navigation.goBack()}
        />

        <View style={styles.bottomGap} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  qrContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  name: {
    ...typography.subtitle,
    color: colors.text,
    textAlign: "center",
    fontWeight: "700",
  },

  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs,
  },

  helperText: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 20,
  },

  message: {
    ...typography.body,
    color: colors.textMuted,
    margin: spacing.md,
  },

  bottomGap: {
    height: spacing.xl,
  },
});
