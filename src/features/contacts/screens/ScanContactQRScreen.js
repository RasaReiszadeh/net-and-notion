import { useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

import AppScreen from "../../../shared/components/AppScreen";
import AppHeader from "../../../shared/components/AppHeader";
import AppButton from "../../../shared/components/AppButton";

import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { radius } from "../../../theme/radius";
import { typography } from "../../../theme/typography";

export default function ScanContactQRScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);

  function getContactMethodValue(contactMethods, type) {
    const method = contactMethods?.find((item) => item.type === type);
    return method?.value || "";
  }

  function validateImportedContact(importedContact) {
    if (!importedContact || typeof importedContact !== "object") {
      return false;
    }

    if (
      importedContact.type &&
      importedContact.type !== "netnotion-contact-card"
    ) {
      return false;
    }

    if (!importedContact.name) {
      return false;
    }

    return true;
  }

  function buildContactDraft(importedContact) {
    const contactMethods = importedContact.contactMethods || [];

    return {
      name: importedContact.name || "",
      professionalTitle: importedContact.professionalTitle || "",
      company: importedContact.company || "",
      email: getContactMethodValue(contactMethods, "email"),
      phone: getContactMethodValue(contactMethods, "phone"),
      socialUrl:
        getContactMethodValue(contactMethods, "linkedin") ||
        getContactMethodValue(contactMethods, "social"),
      notes: importedContact.notes || "",
      relationshipLabel: importedContact.relationshipLabel || "",
      categories: importedContact.categories || [],
      selectedEvents: [],
    };
  }

  function handleBarcodeScanned({ data }) {
    if (hasScanned) {
      return;
    }

    setHasScanned(true);

    try {
      const importedContact = JSON.parse(data);

      if (!validateImportedContact(importedContact)) {
        Alert.alert(
          "Invalid Contact QR",
          "This QR code does not contain a valid Net&Notion contact.",
          [
            {
              text: "Scan Again",
              onPress: () => setHasScanned(false),
            },
          ],
        );
        return;
      }

      navigation.replace("CreateContact", {
        contactDraft: buildContactDraft(importedContact),
      });
    } catch (error) {
      Alert.alert(
        "Invalid QR Code",
        "This QR code does not contain readable contact information.",
        [
          {
            text: "Scan Again",
            onPress: () => setHasScanned(false),
          },
        ],
      );
    }
  }

  if (!permission) {
    return (
      <AppScreen>
        <Text style={styles.message}>Loading camera permissions...</Text>
      </AppScreen>
    );
  }

  if (!permission.granted) {
    return (
      <AppScreen>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <AppHeader
            title="Scan Contact QR"
            subtitle="Camera permission is required to scan contact cards"
            hideBackButton
          />

          <AppButton
            title="Grant Camera Permission"
            onPress={requestPermission}
          />

          <View style={styles.gap}>
            <AppButton
              title="Back"
              variant="secondary"
              onPress={() => navigation.goBack()}
            />
          </View>
        </ScrollView>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <AppHeader
          title="Scan Contact QR"
          subtitle="Scan a Net&Notion contact card to import it"
          hideBackButton
        />

        <View style={styles.scannerBox}>
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={hasScanned ? undefined : handleBarcodeScanned}
          />
        </View>

        <Text style={styles.helperText}>
          Point your camera at a QR code generated from a Net&Notion contact
          card. After scanning, you can review and save the contact.
        </Text>

        <View style={styles.gap}>
          <AppButton
            title="Scan Again"
            variant="secondary"
            onPress={() => setHasScanned(false)}
          />
        </View>

        <View style={styles.gap}>
          <AppButton
            title="Back"
            variant="secondary"
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xl,
  },

  scannerBox: {
    height: 320,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },

  camera: {
    flex: 1,
  },

  helperText: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.md,
    lineHeight: 20,
  },

  message: {
    ...typography.body,
    color: colors.textMuted,
    margin: spacing.md,
  },

  gap: {
    marginTop: spacing.md,
  },
});
