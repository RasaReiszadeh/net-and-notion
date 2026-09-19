import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { radius } from "../../theme/radius";
import { typography } from "../../theme/typography";

function getInitials(name) {
  if (!name) return "?";

  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AppCard({
  children,
  style,
  type,
  title,
  subtitle,
  meta,
}) {
  const isContact = type === "contact";
  const isEvent = type === "event";
  const hasVisualHeader = isContact || isEvent;

  return (
    <View style={[styles.card, style]}>
      {hasVisualHeader && (
        <View style={styles.visualHeader}>
          <View
            style={[
              styles.iconBox,
              isContact && styles.contactIconBox,
              isEvent && styles.eventIconBox,
            ]}
          >
            {isContact ? (
              <Text style={styles.contactIconText}>{getInitials(title)}</Text>
            ) : (
              <Feather name="calendar" size={26} color="#FFFFFF" />
            )}
          </View>

          <View style={styles.headerTextBox}>
            {title ? (
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
            ) : null}

            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}

            {meta ? (
              <Text style={styles.meta} numberOfLines={1}>
                {meta}
              </Text>
            ) : null}
          </View>
        </View>
      )}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: spacing.md,
    marginBottom: spacing.md,

    borderWidth: 1,
    borderColor: "#E7E2F2",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  visualHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },

  contactIconBox: {
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#D06490",
    backgroundColor: "#FFF8FB",
  },

  eventIconBox: {
    borderRadius: 18,
    backgroundColor: "#5B43C4",
  },

  contactIconText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#D06490",
  },

  headerTextBox: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    ...typography.body,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },

  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: 2,
  },

  meta: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: 4,
  },

  visualHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
});
