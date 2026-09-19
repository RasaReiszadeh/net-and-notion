import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Alert, ScrollView } from "react-native";
import QRCode from "react-native-qrcode-svg";

import AppScreen from "../../../shared/components/AppScreen";
import AppHeader from "../../../shared/components/AppHeader";
import AppCard from "../../../shared/components/AppCard";
import AppButton from "../../../shared/components/AppButton";

import { auth } from "../../../firebase/firebaseConfig";
import { getMyContactCard } from "../services/myContactCardService";

import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";

export default function MyQRCodeScreen({ navigation }) {
  const [myContactCard, setMyContactCard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function loadMyContactCard() {
    try {
      setIsLoading(true);

      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to share your card.",
        );
        return;
      }

      const card = await getMyContactCard(userId);

      if (!card) {
        Alert.alert(
          "Missing Card",
          "Create your contact card before generating a QR code.",
        );
        navigation.navigate("MyContactCard");
        return;
      }

      setMyContactCard(card);
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
      name: myContactCard.name || "",
      professionalTitle: myContactCard.professionalTitle || "",
      company: myContactCard.company || "",
      contactMethods: myContactCard.contactMethods || [],
    });
  }

  useEffect(() => {
    loadMyContactCard();
  }, []);

  if (isLoading) {
    return (
      <AppScreen>
        <Text style={styles.message}>Loading QR code...</Text>
      </AppScreen>
    );
  }

  if (!myContactCard) {
    return (
      <AppScreen>
        <Text style={styles.message}>No contact card available.</Text>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader
          title="My QR Card"
          subtitle="Let someone scan this code to add your contact information"
        />

        <AppCard>
          <View style={styles.qrContainer}>
            <QRCode value={buildQRValue()} size={240} />
          </View>

          <Text style={styles.name}>{myContactCard.name}</Text>

          <Text style={styles.subtitle}>
            {myContactCard.professionalTitle || "No title"}
            {myContactCard.company ? ` · ${myContactCard.company}` : ""}
          </Text>

          <Text style={styles.helperText}>
            Ask another Net&Notion user to scan this QR code to create a contact
            from your card.
          </Text>
        </AppCard>

        <AppButton
          title="Edit My Card"
          variant="secondary"
          onPress={() => navigation.navigate("MyContactCard")}
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
