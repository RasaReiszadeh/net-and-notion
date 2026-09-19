import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";

export default function AppHeader({
  title,
  subtitle,
  rightContent,
  hideBackButton = false,
}) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {!hideBackButton && (
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={22} color={colors.text} />
        </Pressable>
      )}

      <View style={styles.headerRow}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>

          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        {rightContent ? (
          <View style={styles.rightContent}>{rightContent}</View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: colors.surface,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#ECE7F6",

    marginBottom: spacing.md,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  textContainer: {
    flex: 1,
  },

  rightContent: {
    marginLeft: spacing.md,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.5,
  },

  subtitle: {
    ...typography.body,
    color: "#8A8698",
    marginTop: spacing.xs,
    lineHeight: 22,
  },
});
