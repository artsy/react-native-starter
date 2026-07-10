import {
  Button,
  Flex,
  Separator,
  Spacer,
  Text,
  useColor,
} from "@artsy/palette-mobile"
import { ScrollView, TouchableOpacity } from "react-native"

import { GlobalStore } from "store/GlobalStore"
import {
  FeatureFlagName,
  featureFlagNames,
  features,
} from "system/featureFlags/features"
import { useFeatureFlag } from "system/featureFlags/useFeatureFlag"

type OverrideChoice = "default" | "on" | "off"

const CHOICES: { label: string; value: OverrideChoice }[] = [
  { label: "Default", value: "default" },
  { label: "On", value: "on" },
  { label: "Off", value: "off" },
]

/**
 * In-app Dev Menu for feature flags. Lets developers force any registered flag
 * (with `showInDevMenu: true`) On or Off locally. Overrides are only honoured in
 * `__DEV__` builds; see `useFeatureFlag`.
 */
export const DevMenuScreen = () => {
  const visibleFlags = featureFlagNames.filter(
    (name) => features[name].showInDevMenu
  )

  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: 20,
        paddingBottom: 40,
        paddingHorizontal: 20,
      }}
    >
      <Text variant="sm" color="black60">
        Feature flag overrides apply on this device only, in development builds.
      </Text>

      <Spacer y={2} />

      <Button
        variant="outline"
        size="small"
        block
        accessibilityRole="button"
        accessibilityLabel="Reset all feature flag overrides"
        onPress={() =>
          GlobalStore.actions.devMenu.clearAllFeatureFlagOverrides()
        }
      >
        Reset all overrides
      </Button>

      <Spacer y={2} />

      {visibleFlags.length === 0 ? (
        <Text variant="sm" color="black60">
          No feature flags are exposed in the Dev Menu.
        </Text>
      ) : (
        visibleFlags.map((name) => <FeatureFlagRow key={name} name={name} />)
      )}
    </ScrollView>
  )
}

const FeatureFlagRow = ({ name }: { name: FeatureFlagName }) => {
  const descriptor = features[name]
  const resolved = useFeatureFlag(name)
  const override = GlobalStore.useAppState(
    (state) => state.devMenu.featureFlagOverrides[name]
  )

  const current: OverrideChoice =
    override === undefined ? "default" : override ? "on" : "off"

  const onSelect = (choice: OverrideChoice) => {
    if (choice === "default") {
      GlobalStore.actions.devMenu.clearFeatureFlagOverride(name)
    } else {
      GlobalStore.actions.devMenu.setFeatureFlagOverride({
        name,
        value: choice === "on",
      })
    }
  }

  return (
    <Flex mb={2}>
      <Text variant="sm-display">{name}</Text>
      <Spacer y={0.5} />
      <Text variant="xs" color="black60">
        {descriptor.description}
      </Text>
      <Spacer y={0.5} />
      <Text variant="xs" color="black60">
        Resolved: {resolved ? "On" : "Off"}
        {descriptor.readyForRelease ? "" : " (not ready for release)"}
      </Text>

      <Spacer y={1} />

      <Flex flexDirection="row">
        {CHOICES.map((choice) => (
          <SegmentButton
            key={choice.value}
            label={choice.label}
            selected={current === choice.value}
            flagName={name}
            onPress={() => onSelect(choice.value)}
          />
        ))}
      </Flex>

      <Spacer y={2} />
      <Separator />
    </Flex>
  )
}

const SegmentButton = ({
  label,
  selected,
  flagName,
  onPress,
}: {
  label: string
  selected: boolean
  flagName: string
  onPress: () => void
}) => {
  const color = useColor()

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Set ${flagName} to ${label}`}
      style={{ flex: 1 }}
    >
      <Flex
        py={1}
        mr={0.5}
        alignItems="center"
        borderWidth={1}
        borderRadius={4}
        borderColor={selected ? color("blue100") : color("black30")}
        backgroundColor={selected ? color("blue100") : color("white100")}
      >
        <Text variant="xs" color={selected ? "white100" : "black100"}>
          {label}
        </Text>
      </Flex>
    </TouchableOpacity>
  )
}
