import { screen } from "@testing-library/react-native"
import { graphql } from "react-relay"
import { HomeUserTestQuery } from "__generated__/HomeUserTestQuery.graphql"
import { HomeUser } from "Scenes/Home/HomeUser"
import { setupTestWrapper } from "utils/test/setupTestWrapper"

const { renderWithRelay } = setupTestWrapper<HomeUserTestQuery>({
  Component: HomeUser,
  query: graphql`
    query HomeUserTestQuery @relay_test_operation {
      me {
        ...HomeUser_me
      }
    }
  `,
})

describe("HomeUser", () => {
  it("renders the user's name and email", () => {
    renderWithRelay({
      Me: () => ({ name: "Andy Warhol", email: "andy@example.com" }),
    })

    expect(screen.getByText("Andy Warhol")).toBeTruthy()
    expect(screen.getByText("andy@example.com")).toBeTruthy()
  })
})
