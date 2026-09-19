import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Pressable,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { logoutUser } from "../../auth/services/authService";
import { getMyContactCard } from "../../contacts/services/myContactCardService";
import { getReminders } from "../../reminders/services/remindersService";
import { auth } from "../../../firebase/firebaseConfig";

import AppScreen from "../../../shared/components/AppScreen";
import AppHeader from "../../../shared/components/AppHeader";
import AppButton from "../../../shared/components/AppButton";
import AppCard from "../../../shared/components/AppCard";

import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";

const monthMap = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

function parseReminderDate(dateText) {
  if (!dateText) return null;

  const parts = dateText.replace(",", "").split(" ");
  if (parts.length !== 3) return null;

  const month = monthMap[parts[0].toLowerCase()];
  const day = Number(parts[1]);
  const year = Number(parts[2]);

  if (month === undefined || Number.isNaN(day) || Number.isNaN(year)) {
    return null;
  }

  return new Date(year, month, day);
}

function getClosestReminder(reminders) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pendingReminders = reminders
    .filter((reminder) => !reminder.completed)
    .map((reminder) => ({
      ...reminder,
      parsedDate: parseReminderDate(reminder.dueDate),
    }))
    .filter((reminder) => reminder.parsedDate)
    .filter((reminder) => reminder.parsedDate >= today)
    .sort((a, b) => a.parsedDate - b.parsedDate);

  return pendingReminders[0] || null;
}

export default function HomeScreen({ navigation }) {
  const [closestReminder, setClosestReminder] = useState(null);
  const [myContactCard, setMyContactCard] = useState(null);

  async function loadMyContactCard() {
    try {
      const userId = auth.currentUser?.uid;

      if (!userId) {
        setMyContactCard(null);
        return;
      }

      const card = await getMyContactCard(userId);
      setMyContactCard(card);
    } catch (error) {
      Alert.alert("My Card Error", error.message);
    }
  }

  async function loadClosestReminder() {
    try {
      const userId = auth.currentUser?.uid;

      if (!userId) {
        setClosestReminder(null);
        return;
      }

      const userReminders = await getReminders(userId);
      setClosestReminder(getClosestReminder(userReminders));
    } catch (error) {
      Alert.alert("Reminders Error", error.message);
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Logout Error", error.message);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadClosestReminder();
      loadMyContactCard();
    }, []),
  );

  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <AppHeader
          title="Net&Notion"
          subtitle="Your networking dashboard"
          hideBackButton
        />

        <AppCard>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>My Contact Card</Text>

            {myContactCard ? (
              <Pressable
                style={styles.shareIconButton}
                onPress={() => navigation.navigate("MyQRCode")}
              >
                <Feather name="share-2" size={20} color={colors.primary} />
              </Pressable>
            ) : null}
          </View>

          {myContactCard ? (
            <>
              <Text style={styles.profileName}>{myContactCard.name}</Text>
              <Text style={styles.profileRole}>
                {myContactCard.professionalTitle || "No title"}
                {myContactCard.company ? ` · ${myContactCard.company}` : ""}
              </Text>

              <View style={styles.buttonTopGap}>
                <AppButton
                  title="View My Card"
                  onPress={() => navigation.navigate("MyContactCard")}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.profileName}>Create your digital card</Text>
              <Text style={styles.profileRole}>
                Add your name, role, company, and contact methods to share
                later.
              </Text>

              <View style={styles.buttonTopGap}>
                <AppButton
                  title="Create My Card"
                  onPress={() => navigation.navigate("MyContactCard")}
                />
              </View>
            </>
          )}
        </AppCard>

        <AppCard>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.quickGrid}>
            <Pressable
              style={styles.quickAction}
              onPress={() => navigation.navigate("ContactList")}
            >
              <Feather name="users" size={22} color={colors.primary} />
              <Text style={styles.quickActionText}>Contacts</Text>
            </Pressable>

            <Pressable
              style={styles.quickAction}
              onPress={() => navigation.navigate("ScanContactQR")}
            >
              <Feather name="camera" size={22} color={colors.primary} />
              <Text style={styles.quickActionText}>Scan QR</Text>
            </Pressable>

            <Pressable
              style={styles.quickAction}
              onPress={() => navigation.navigate("Events")}
            >
              <Feather name="calendar" size={22} color={colors.primary} />
              <Text style={styles.quickActionText}>Events</Text>
            </Pressable>

            <Pressable
              style={styles.quickAction}
              onPress={() => navigation.navigate("Reminders")}
            >
              <Feather name="bell" size={22} color={colors.primary} />
              <Text style={styles.quickActionText}>Reminders</Text>
            </Pressable>
          </View>
        </AppCard>

        {closestReminder ? (
          <AppCard
            type="event"
            title={closestReminder.title}
            subtitle={
              closestReminder.contactName
                ? `Contact: ${closestReminder.contactName}`
                : "General reminder"
            }
            meta={`Due: ${closestReminder.dueDate}`}
          >
            <View style={styles.buttonGap}>
              <AppButton
                title="View All Reminders"
                variant="secondary"
                onPress={() => navigation.navigate("Reminders")}
              />
            </View>
          </AppCard>
        ) : null}

        <View style={styles.logout}>
          <AppButton
            title="Logout"
            variant="secondary"
            onPress={handleLogout}
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

  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
  },

  profileName: {
    ...typography.subtitle,
    color: colors.text,
    fontWeight: "700",
  },

  profileRole: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  buttonTopGap: {
    marginTop: spacing.md,
  },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  quickAction: {
    width: "48%",
    backgroundColor: "#F7F3FF",
    borderWidth: 1,
    borderColor: "#E7E2F2",
    borderRadius: 18,
    padding: spacing.md,
    marginBottom: spacing.md,
    minHeight: 92,
    justifyContent: "center",
  },

  quickActionText: {
    ...typography.body,
    color: colors.text,
    fontWeight: "700",
    marginTop: spacing.sm,
  },

  reminderTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: "700",
  },

  reminderDetail: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  reminderDate: {
    ...typography.small,
    color: colors.primary,
    marginTop: spacing.sm,
  },

  logout: {
    marginTop: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },

  shareIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F7F3FF",
    borderWidth: 1,
    borderColor: "#E7E2F2",
    justifyContent: "center",
    alignItems: "center",
  },
});
