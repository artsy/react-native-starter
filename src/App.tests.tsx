import { render, screen } from "@testing-library/react-native"
import { App } from "App"

describe("App", () => {
  it("renders the login screen when logged out", async () => {
    render(<App />)

    // The store rehydrates asynchronously, so wait for the first screen.
    expect(await screen.findByTestId("loginButton")).toBeTruthy()
  })
})
