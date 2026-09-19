import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Pressable,
  Image,
} from "react-native";

import AppScreen from "../../../shared/components/AppScreen";
import AppInput from "../../../shared/components/AppInput";
import AppButton from "../../../shared/components/AppButton";

import { loginUser } from "../services/authService";

import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";

const appLogo = require("../../../../assets/icon.png");

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function validateForm() {
    let isValid = true;

    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email is required.");
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required.");
      isValid = false;
    }

    return isValid;
  }

  async function handleLogin() {
    if (!validateForm()) {
      return;
    }

    try {
      await loginUser({
        email: email.trim(),
        password,
      });

      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Login Error", error.message);
    }
  }

  return (
    <AppScreen style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={Keyboard.dismiss}>
            <View style={styles.hero}>
              <View style={styles.logoCard}>
                <Image source={appLogo} style={styles.logo} />
              </View>

              <Text style={styles.title}>Net & Notion</Text>

              <Text style={styles.subtitle}>
                Welcome back. Pick up where your network left off.
              </Text>
            </View>

            <View style={styles.form}>
              <AppInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError("");
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                error={emailError}
              />

              <AppInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError("");
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                error={passwordError}
                rightContent={
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Text style={styles.showPasswordText}>
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                }
              />

              <AppButton title="Login" onPress={handleLogin} />

              <View style={styles.linkGap}>
                <AppButton
                  title="Create Account"
                  variant="secondary"
                  onPress={() => navigation.navigate("Register")}
                />
              </View>
            </View>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 0,
    backgroundColor: colors.background,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },

  hero: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },

  logoCard: {
    width: 98,
    height: 78,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  logo: {
    width: 72,
    height: 70,
    borderRadius: 18,
  },

  title: {
    ...typography.title,
    color: colors.text,
    textAlign: "center",
    fontWeight: "700",
  },

  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
    maxWidth: 300,
  },

  form: {
    width: "100%",
  },

  linkGap: {
    marginTop: spacing.md,
  },

  showPasswordText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: "600",
  },
});
