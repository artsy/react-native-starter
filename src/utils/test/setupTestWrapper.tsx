import { act } from "@testing-library/react-native"
import { Suspense } from "react"
import {
  GraphQLTaggedNode,
  QueryRenderer,
  RelayEnvironmentProvider,
} from "react-relay"
import { OperationType } from "relay-runtime"
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils"
import { MockResolvers } from "relay-test-utils/lib/RelayMockPayloadGenerator"
import { renderWithWrappers } from "utils/test/renderWithWrappers"

interface SetupTestWrapper<T extends OperationType> {
  Component: React.ComponentType<any>
  query?: GraphQLTaggedNode
  variables?: T["variables"]
}

/**
 * Creates a test renderer for components that use Relay for data fetching.
 * Adapted from Artsy's Eigen/Energy `setupTestWrapper`, using a fresh
 * `relay-test-utils` mock environment per render.
 *
 * @example - Full query (useLazyLoadQuery)
 *
 * const { renderWithRelay } = setupTestWrapper<HomeQuery>({
 *   Component: HomeScreen,
 * })
 *
 * it("renders", () => {
 *   renderWithRelay({ Me: () => ({ name: "Andy Warhol" }) })
 *   expect(screen.getByText("Andy Warhol")).toBeTruthy()
 * })
 *
 * @example - Fragment component (useFragment)
 *
 * const { renderWithRelay } = setupTestWrapper<HomeUserTestQuery>({
 *   Component: HomeUser,
 *   query: graphql`
 *     query HomeUserTestQuery @relay_test_operation {
 *       me {
 *         ...HomeUser_me
 *       }
 *     }
 *   `,
 * })
 */
export const setupTestWrapper = <T extends OperationType>({
  Component,
  query,
  variables = {},
}: SetupTestWrapper<T>) => {
  const renderWithRelay = (
    mockResolvers: MockResolvers = {},
    props: Record<string, unknown> = {}
  ) => {
    const env = createMockEnvironment()

    const TestRenderer = () =>
      query ? (
        <QueryRenderer<T>
          environment={env}
          variables={variables}
          query={query}
          render={({ props: relayProps, error }) => {
            if (relayProps) {
              return <Component {...relayProps} {...props} />
            } else if (error) {
              console.error(error)
            }
            return null
          }}
        />
      ) : (
        // Component issues its own query (e.g. via useSystemQueryLoader /
        // useLazyLoadQuery): provide the mock environment and a Suspense
        // boundary so it can suspend until `resolveMostRecentOperation` runs.
        <RelayEnvironmentProvider environment={env}>
          <Suspense fallback={null}>
            <Component {...props} />
          </Suspense>
        </RelayEnvironmentProvider>
      )

    const view = renderWithWrappers(<TestRenderer />)

    act(() => {
      env.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, mockResolvers)
      )
    })

    const mockResolveLastOperation = (resolvers: MockResolvers) => {
      act(() => {
        env.mock.resolveMostRecentOperation((operation) =>
          MockPayloadGenerator.generate(operation, resolvers)
        )
      })
    }

    return { ...view, env, mockResolveLastOperation }
  }

  return { renderWithRelay }
}
