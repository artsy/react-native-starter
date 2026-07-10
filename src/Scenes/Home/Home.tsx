import { Button, Flex, Text } from "@artsy/palette-mobile"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { graphql, useLazyLoadQuery } from "react-relay"
import { HomeQuery } from "__generated__/HomeQuery.graphql"
import { MainNavigationStack } from "MainNavigationStack"
import { HomeUser } from "Scenes/Home/HomeUser"
import { GlobalStore } from "store/GlobalStore"

type HomeNavigationProps = NativeStackScreenProps<MainNavigationStack, "Home">

export const HomeScreen: React.FC<HomeNavigationProps> = () => {
  const data = useLazyLoadQuery<HomeQuery>(
    graphql`
      query HomeQuery {
        me {
          ...HomeUser_me
        }
      }
    `,
    {}
  )

  if (!data?.me) {
    return <Text>Query Failed</Text>
  }

  return (
    <Flex flex={1} justifyContent="center" alignItems="center">
      <HomeUser me={data.me} />
      <Button
        onPress={() => {
          GlobalStore.actions.auth.signOut()
        }}
      >
        Log out
      </Button>
    </Flex>
  )
}
