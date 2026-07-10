import { Button, Flex, Text } from "@artsy/palette-mobile"
import { graphql, useLazyLoadQuery } from "react-relay"
import { HomeQuery } from "__generated__/HomeQuery.graphql"
import { HomeUser } from "Scenes/Home/HomeUser"
import { GlobalStore } from "store/GlobalStore"

export const HomeScreen = () => {
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
