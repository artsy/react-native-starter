import { screen } from "@testing-library/react-native"
import { LoginScreen } from "Scenes/Login/Login"
import { renderWithWrappers } from "utils/test/renderWithWrappers"

describe("LoginScreen", () => {
  it("renders the login form", () => {
    renderWithWrappers(<LoginScreen />)

    expect(screen.getByText("Log In")).toBeTruthy()
    expect(screen.getByText("With Your Artsy Partner Account")).toBeTruthy()
    expect(screen.getByTestId("loginButton")).toBeTruthy()
  })

  it("shows the Artsy Mobile prompt", () => {
    renderWithWrappers(<LoginScreen />)

    expect(screen.getByText(/Looking for Artsy Mobile/)).toBeTruthy()
  })
})
