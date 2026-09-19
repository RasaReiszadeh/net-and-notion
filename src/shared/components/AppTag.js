import { Text, StyleSheet, Pressable } from "react-native";

import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export default function AppTag({
  label,
  selected = false,
  onPress,
  variant = "purple",
}) {
  const TagComponent = onPress ? Pressable : Text;

  return (
    <TagComponent
      onPress={onPress}
      style={[styles.tag, styles[variant], selected && styles.selected]}
    >
      <Text style={[styles.text, selected && styles.selectedText]}>
        {label}
      </Text>
    </TagComponent>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    alignSelf: "flex-start",
  },

  purple: {
    backgroundColor: "#F1ECFF",
    borderColor: "#E4DAFF",
  },

  orange: {
    backgroundColor: "#FFF3DE",
    borderColor: "#FFE0AA",
  },

  green: {
    backgroundColor: "#E6F8EF",
    borderColor: "#C8EEDB",
  },

  pink: {
    backgroundColor: "#FFF0F6",
    borderColor: "#F8C8DD",
  },

  blue: {
    backgroundColor: "#EAF2FF",
    borderColor: "#CFE0FF",
  },

  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  text: {
    ...typography.small,
    color: colors.primary,
    fontWeight: "600",
  },

  selectedText: {
    color: colors.surface,
  },
});
