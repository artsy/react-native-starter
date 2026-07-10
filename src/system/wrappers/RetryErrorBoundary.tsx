import { Button, Flex, Spacer, Text } from "@artsy/palette-mobile"
import { FC, PropsWithChildren } from "react"
import { ErrorBoundary, FallbackProps } from "react-error-boundary"

const Fallback: FC<FallbackProps> = ({ resetErrorBoundary }) => (
  <Flex flex={1} justifyContent="center" alignItems="center" px={2}>
    <Text variant="lg-display">Something went wrong</Text>
    <Spacer y={1} />
    <Text variant="sm" color="black60" textAlign="center">
      An unexpected error occurred. Please try again.
    </Text>
    <Spacer y={2} />
    <Button onPress={resetErrorBoundary}>Try again</Button>
  </Flex>
)

/**
 * Top-level error boundary. Catches render errors below it and shows a retry
 * screen instead of a crash. Place inside the theme provider so the fallback
 * is themed.
 */
export const GlobalRetryErrorBoundary: FC<PropsWithChildren> = ({
  children,
}) => {
  return <ErrorBoundary FallbackComponent={Fallback}>{children}</ErrorBoundary>
}
