import { Div, Flex } from 'honorable'

export function SidebarTabs({ width = 250, children }) {
  return (
    <Flex
      px={1}
      py={1}
      width={width}
      flexShrink={0}
      direction="column" 
    >
      <Div
        pt={1}
        borderRight="1px solid border"
      /> 
      { children } 
      <Div
        flexGrow={1}
        borderRight="1px solid border"
      />
    </Flex>
  )
}
