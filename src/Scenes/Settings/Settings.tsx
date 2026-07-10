import { Flex, Spacer, Text } from "@artsy/palette-mobile"

/**
 * Example second tab. Replace with real settings UI.
 */
export const SettingsScreen = () => {
  return (
    <Flex flex={1} justifyContent="center" alignItems="center" px={2}>
      <Text variant="lg-display">Settings</Text>
      <Spacer y={1} />
      <Text variant="sm" color="black60" textAlign="center">
        This is an example second tab. Add your settings UI here.
      </Text>
    </Flex>
  )
}
