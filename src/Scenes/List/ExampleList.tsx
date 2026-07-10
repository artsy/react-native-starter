import { Flex, Separator, Text, useSpace } from "@artsy/palette-mobile"
import { FlashList } from "@shopify/flash-list"

interface ListItem {
  id: string
  title: string
}

const DATA: ListItem[] = Array.from({ length: 30 }, (_, i) => ({
  id: String(i),
  title: `Item ${i + 1}`,
}))

/**
 * Example screen showing the preferred list component, @shopify/flash-list
 * (use it instead of FlatList for long/performant lists).
 */
export const ExampleListScreen = () => {
  const space = useSpace()

  return (
    <Flex flex={1}>
      <FlashList
        data={DATA}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: space(2) }}
        ItemSeparatorComponent={() => <Separator my={1} />}
        renderItem={({ item }) => <Text variant="sm">{item.title}</Text>}
      />
    </Flex>
  )
}
