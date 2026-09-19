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

export default function QRScannerScreen({ route, navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);

  const returnScreen = route.params?.returnScreen || "CreateContact";
  const contactId = route.params?.contactId;
  const contactDraft = route.params?.contactDraft || null;

  function goBackWithDraft() {
    navigation.replace(returnScreen, {
      contactId,
      contactDraft,
    });
  }

  function handleBarcodeScanned({ data }) {
    if (hasScanned) {
      return;
    }

    setHasScanned(true);

    if (!data || !data.startsWith("http")) {
      Alert.alert(
        "Invalid QR Code",
        "This QR code does not contain a valid URL.",
        [
          {
            text: "Scan Again",
            onPress: () => setHasScanned(false),
          },
        ],
      );
      return;
    }

    navigation.replace(returnScreen, {
      scannedUrl: data,
      contactId,
      contactDraft: {
        ...(contactDraft || {}),
        socialUrl: data,
      },
    });
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
            title="QR Scanner"
            subtitle="Camera permission is required to scan QR codes"
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
              onPress={goBackWithDraft}
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
          title="QR Scanner"
          subtitle="Scan a LinkedIn or social profile QR code"
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
          Point your camera at a QR code containing a LinkedIn or social profile
          URL.
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
            onPress={goBackWithDraft}
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
    height: 300,
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
