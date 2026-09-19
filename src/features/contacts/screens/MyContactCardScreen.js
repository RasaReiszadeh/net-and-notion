import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Alert, ScrollView } from "react-native";

import AppScreen from "../../../shared/components/AppScreen";
import AppHeader from "../../../shared/components/AppHeader";
import AppCard from "../../../shared/components/AppCard";
import AppInput from "../../../shared/components/AppInput";
import AppButton from "../../../shared/components/AppButton";

import { auth } from "../../../firebase/firebaseConfig";
import {
  getMyContactCard,
  saveMyContactCard,
} from "../services/myContactCardService";

import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";

function extractContactMethod(contactMethods, type) {
  const method = contactMethods?.find((item) => item.type === type);
  return method?.value || "";
}

export default function MyContactCardScreen({ navigation }) {
  const [name, setName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [company, setCompany] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [socialUrl, setSocialUrl] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function loadMyContactCard() {
    try {
      setIsLoading(true);

      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to view your contact card.",
        );
        return;
      }

      const card = await getMyContactCard(userId);

      if (!card) {
        return;
      }

      setName(card.name || "");
      setProfessionalTitle(card.professionalTitle || "");
      setCompany(card.company || "");

      setEmail(extractContactMethod(card.contactMethods, "email"));
      setPhone(extractContactMethod(card.contactMethods, "phone"));
      setSocialUrl(extractContactMethod(card.contactMethods, "linkedin"));
    } catch (error) {
      Alert.alert("My Card Error", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveCard() {
    if (!name.trim()) {
      Alert.alert("Missing Information", "Your name is required.");
      return;
    }

    if (!email.trim() && !phone.trim() && !socialUrl.trim()) {
      Alert.alert("Missing Contact Method", "Add at least one contact method.");
      return;
    }

    try {
      setIsSaving(true);

      const userId = auth.currentUser?.uid;

      if (!userId) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to save your contact card.",
        );
        return;
      }

      await saveMyContactCard(userId, {
        name,
        professionalTitle,
        company,
        email,
        phone,
        socialUrl,
      });

      Alert.alert("Success", "Your contact card was saved.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Save Card Error", error.message);
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    loadMyContactCard();
  }, []);

  return (
    <AppScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader
          title="My Contact Card"
          subtitle="Create the information you want to share with others"
        />

        <AppCard>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <AppInput
            label="Name"
            placeholder="Your full name"
            value={name}
            onChangeText={setName}
          />

          <AppInput
            label="Professional Title"
            placeholder="Full Stack Developer, Student, Recruiter..."
            value={professionalTitle}
            onChangeText={setProfessionalTitle}
          />

          <AppInput
            label="Company"
            placeholder="Company, school, or organization"
            value={company}
            onChangeText={setCompany}
          />
        </AppCard>

        <AppCard>
          <Text style={styles.sectionTitle}>Contact Methods</Text>

          <AppInput
            label="Email"
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <AppInput
            label="Phone"
            placeholder="Phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <AppInput
            label="LinkedIn / Social URL"
            placeholder="https://linkedin.com/in/..."
            value={socialUrl}
            onChangeText={setSocialUrl}
            autoCapitalize="none"
          />
        </AppCard>

        <AppButton
          title={isSaving ? "Saving..." : "Save My Card"}
          onPress={handleSaveCard}
          disabled={isSaving || isLoading}
        />

        <View style={styles.bottomGap} />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.md,
  },

  bottomGap: {
    height: spacing.xl,
  },
});
