import { Text } from "@artsy/palette-mobile"
import { screen } from "@testing-library/react-native"
import { graphql } from "react-relay"
import { useSystemQueryLoaderTestQuery } from "__generated__/useSystemQueryLoaderTestQuery.graphql"
import { useSystemQueryLoader } from "system/relay/useSystemQueryLoader"
import { setupTestWrapper } from "utils/test/setupTestWrapper"

const TestComponent = () => {
  const data = useSystemQueryLoader<useSystemQueryLoaderTestQuery>(
    graphql`
      query useSystemQueryLoaderTestQuery @relay_test_operation {
        me {
          name
        }
      }
    `,
    {}
  )

  return <Text>{data.me?.name}</Text>
}

const { renderWithRelay } = setupTestWrapper({ Component: TestComponent })

describe("useSystemQueryLoader", () => {
  it("loads query data through the wrapper", () => {
    renderWithRelay({ Me: () => ({ name: "Andy Warhol" }) })

    expect(screen.getByText("Andy Warhol")).toBeTruthy()
  })
})
