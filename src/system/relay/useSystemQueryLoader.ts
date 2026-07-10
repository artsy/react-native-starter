import {
  FetchPolicy,
  GraphQLTaggedNode,
  useLazyLoadQuery,
  VariablesOf,
} from "react-relay"
import { CacheConfig, OperationType, RenderPolicy } from "relay-runtime"

export interface SystemQueryLoaderOptions {
  fetchKey?: string | number
  fetchPolicy?: FetchPolicy
  networkCacheConfig?: CacheConfig
  UNSTABLE_renderPolicy?: RenderPolicy
}

/**
 * Thin wrapper around Relay's `useLazyLoadQuery`.
 *
 * Screens should load their query through this hook instead of calling
 * `useLazyLoadQuery` directly. Today it simply delegates to Relay with the
 * same signature, so it's a drop-in replacement. Its purpose is to give us a
 * single seam to evolve query loading later — without touching any call site.
 *
 * For example, a future offline-first mode could read a global fetch policy /
 * fetch key from the store and pass them here (as Eigen and Energy do in their
 * own `useSystemQueryLoader`), guarding queries when the device is offline.
 * Because every screen already goes through this hook, that change lands in one
 * place. Extend `SystemQueryLoaderOptions` / the return value when you need to
 * build more on top (e.g. a `refetch`, `loading`, or pull-to-refresh control).
 */
export function useSystemQueryLoader<TQuery extends OperationType>(
  query: GraphQLTaggedNode,
  variables: VariablesOf<TQuery>,
  options?: SystemQueryLoaderOptions
): TQuery["response"] {
  return useLazyLoadQuery<TQuery>(query, variables, options)
}
