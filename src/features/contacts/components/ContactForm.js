import { View, Text, StyleSheet, Pressable } from "react-native";

import AppInput from "../../../shared/components/AppInput";
import AppTextArea from "../../../shared/components/AppTextArea";
import AppButton from "../../../shared/components/AppButton";
import AppCard from "../../../shared/components/AppCard";

import {
  relationshipLabels,
  contactCategories,
} from "../constants/contactOptions";

import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";

export default function ContactForm({
  name,
  setName,
  professionalTitle,
  setProfessionalTitle,
  company,
  setCompany,
  email,
  setEmail,
  phone,
  setPhone,
  socialUrl,
  setSocialUrl,
  notes,
  setNotes,
  selectedEvents,
  onRemoveEvent,
  onCreateEvent,
  onScanQR,
  relationshipLabel,
  setRelationshipLabel,
  categories,
  setCategories,
  onGenerateCategories,
  isGeneratingCategories,
  nameError,
  emailError,
  phoneError,
  socialUrlError,
  notesError,
  events,
  showEventDropdown,
  setShowEventDropdown,
  onSelectEventFromDropdown,
}) {
  function toggleCategory(category) {
    if (categories.includes(category)) {
      setCategories(categories.filter((item) => item !== category));
    } else {
      setCategories([...categories, category]);
    }
  }

  return (
    <>
      <AppCard>
        <Text style={styles.sectionTitle}>Basic Information</Text>

        <AppInput
          label="Name"
          placeholder="Contact name"
          value={name}
          onChangeText={setName}
          error={nameError}
        />

        <AppInput
          label="Professional Title"
          placeholder="Recruiter, founder, student..."
          value={professionalTitle}
          onChangeText={setProfessionalTitle}
        />

        <AppInput
          label="Company"
          placeholder="Company or organization"
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
          error={emailError}
        />

        <AppInput
          label="Phone"
          placeholder="Phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          error={phoneError}
        />

        <AppInput
          label="LinkedIn / Social URL"
          placeholder="https://linkedin.com/in/..."
          value={socialUrl}
          onChangeText={setSocialUrl}
          autoCapitalize="none"
          error={socialUrlError}
        />

        <AppButton
          title="Scan QR for URL"
          variant="secondary"
          onPress={onScanQR}
        />
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>Networking Context</Text>

        {selectedEvents && selectedEvents.length > 0 ? (
          selectedEvents.map((event) => (
            <AppCard
              key={event.id}
              type="event"
              title={event.name}
              subtitle={event.location || "No location"}
              meta={event.date || "No date"}
              style={styles.innerEventCard}
            >
              <Pressable
                style={styles.removeButton}
                onPress={() => onRemoveEvent(event.id)}
              >
                <Text style={styles.removeText}>Remove Event</Text>
              </Pressable>
            </AppCard>
          ))
        ) : (
          <View style={styles.eventBox}>
            <Text style={styles.eventName}>No event selected</Text>
            <Text style={styles.eventDetail}>
              Select or create an event to organize this contact.
            </Text>
          </View>
        )}

        <View style={styles.buttonGap}>
          <AppButton
            title={showEventDropdown ? "Hide Events" : "Select Existing Event"}
            variant="secondary"
            onPress={() => setShowEventDropdown(!showEventDropdown)}
          />

          {showEventDropdown ? (
            <View style={styles.dropdownBox}>
              {events && events.length > 0 ? (
                events.map((event) => (
                  <Pressable
                    key={event.id}
                    style={styles.eventOption}
                    onPress={() => onSelectEventFromDropdown(event)}
                  >
                    <Text style={styles.eventOptionName}>{event.name}</Text>
                    <Text style={styles.eventOptionDetail}>
                      {event.location || "No location"} ·{" "}
                      {event.date || "No date"}
                    </Text>
                  </Pressable>
                ))
              ) : (
                <Text style={styles.eventDetail}>
                  {selectedEvents && selectedEvents.length > 0
                    ? "No other events available."
                    : "No events available. Create a new event first."}
                </Text>
              )}
            </View>
          ) : null}
        </View>

        <View style={styles.buttonGap}>
          <AppButton
            title="Create New Event"
            variant="secondary"
            onPress={onCreateEvent}
          />
        </View>

        <AppTextArea
          label="Notes"
          placeholder="What did you talk about?"
          value={notes}
          onChangeText={setNotes}
          error={notesError}
        />
      </AppCard>

      <AppCard>
        <Text style={styles.sectionTitle}>Relationship & Categories</Text>

        <Text style={styles.label}>Relationship Label</Text>

        <View style={styles.chipContainer}>
          {relationshipLabels.map((label) => (
            <Pressable
              key={label}
              style={[
                styles.chip,
                relationshipLabel === label && styles.chipSelected,
              ]}
              onPress={() => setRelationshipLabel(label)}
            >
              <Text
                style={[
                  styles.chipText,
                  relationshipLabel === label && styles.chipTextSelected,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Categories</Text>

        <View style={styles.chipContainer}>
          {contactCategories.map((category) => {
            const isSelected = categories.includes(category);

            return (
              <Pressable
                key={category}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => toggleCategory(category)}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.buttonGap}>
          <AppButton
            title={
              isGeneratingCategories
                ? "Generating..."
                : "Generate Categories with AI"
            }
            variant="secondary"
            onPress={onGenerateCategories}
            disabled={isGeneratingCategories}
          />
        </View>
      </AppCard>
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.md,
  },

  eventBox: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  eventTextBox: {
    flex: 1,
    marginRight: spacing.sm,
  },

  eventName: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
  },

  eventDetail: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  removeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },

  removeText: {
    ...typography.small,
    color: colors.danger,
    fontWeight: "600",
  },

  buttonGap: {
    marginBottom: spacing.sm,
  },

  label: {
    ...typography.small,
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.md,
  },

  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },

  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  chipText: {
    ...typography.small,
    color: colors.text,
  },

  chipTextSelected: {
    color: colors.surface,
    fontWeight: "600",
  },

  dropdownBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },

  eventOption: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  eventOptionName: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
  },

  eventOptionDetail: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  innerEventCard: {
    marginBottom: spacing.sm,
  },
});
