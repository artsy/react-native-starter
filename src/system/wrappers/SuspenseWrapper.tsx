import { Flex, Spinner } from "@artsy/palette-mobile"
import { FC, PropsWithChildren, Suspense } from "react"

const Loading: FC = () => (
  <Flex
    flex={1}
    justifyContent="center"
    alignItems="center"
    testID="suspense-loading"
  >
    <Spinner />
  </Flex>
)

/**
 * Wraps screens so that Relay's `useLazyLoadQuery` (and any other suspending
 * data source) shows a loading indicator while fetching.
 */
export const SuspenseWrapper: FC<PropsWithChildren> = ({ children }) => {
  return <Suspense fallback={<Loading />}>{children}</Suspense>
}
