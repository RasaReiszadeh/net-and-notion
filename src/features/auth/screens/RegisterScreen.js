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

import { registerUser } from "../services/authService";

import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";

const appLogo = require("../../../../assets/icon.png");

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validateForm() {
    let isValid = true;

    setFullNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");

    if (!fullName.trim()) {
      setFullNameError("Full name is required.");
      isValid = false;
    }

    if (!email.trim()) {
      setEmailError("Email is required.");
      isValid = false;
    } else if (!isValidEmail(email.trim())) {
      setEmailError("Enter a valid email address.");
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      isValid = false;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Please confirm your password.");
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match.");
      isValid = false;
    }

    return isValid;
  }

  async function handleRegister() {
    if (!validateForm()) {
      return;
    }

    try {
      await registerUser({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Register Error", error.message);
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
                Remember everyone — and the context behind every connection.
              </Text>
            </View>

            <View style={styles.form}>
              <AppInput
                label="Full Name"
                placeholder="Enter your name"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (fullNameError) setFullNameError("");
                }}
                error={fullNameError}
              />

              <AppInput
                label="Email"
                placeholder="you@email.com"
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
                placeholder="Create a password"
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

              <AppInput
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) setConfirmPasswordError("");
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                error={confirmPasswordError}
                rightContent={
                  <Pressable
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Text style={styles.showPasswordText}>
                      {showConfirmPassword ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                }
              />

              <AppButton title="Create account  →" onPress={handleRegister} />

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>

                <Pressable onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.footerLink}>Log in</Text>
                </Pressable>
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
    maxWidth: 310,
  },

  form: {
    width: "100%",
  },

  showPasswordText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: "600",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },

  footerText: {
    ...typography.small,
    color: colors.textMuted,
  },

  footerLink: {
    ...typography.small,
    color: colors.primary,
    fontWeight: "700",
  },
});
