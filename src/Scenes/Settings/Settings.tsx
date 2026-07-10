import { Button, Flex, Spacer, Text } from "@artsy/palette-mobile"
import { useNavigation } from "@react-navigation/native"

/**
 * Example second tab. Replace with real settings UI.
 */
export const SettingsScreen = () => {
  const navigation = useNavigation()

  return (
    <Flex flex={1} justifyContent="center" alignItems="center" px={2}>
      <Text variant="lg-display">Settings</Text>
      <Spacer y={1} />
      <Text variant="sm" color="black60" textAlign="center">
        This is an example second tab. Add your settings UI here.
      </Text>

      {__DEV__ && (
        <>
          <Spacer y={2} />
          <Button
            variant="outline"
            size="small"
            accessibilityRole="button"
            accessibilityLabel="Open the developer menu"
            onPress={() => navigation.navigate("DevMenu")}
          >
            Dev Menu
          </Button>
        </>
      )}
    </Flex>
  )
}
