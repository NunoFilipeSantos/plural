import React, { useContext } from 'react'
import { useHistory } from 'react-router-dom'
import { Box, Image } from 'grommet'
import Me from './users/Me'
import SearchRepositories from './repos/SearchRepositories'
import { CurrentUserContext } from './login/CurrentUser'
import { SIDEBAR_WIDTH } from './Sidebar'

const FORGE_ICON = `${process.env.PUBLIC_URL}/forge.png`

export default function Toolbar() {
  const me = useContext(CurrentUserContext)
  let history = useHistory()
  return (
    <Box direction='row' fill='horizontal'>
      <Box focusIndicator={false} width={SIDEBAR_WIDTH} height='100%' justify='center' align='center'
           onClick={() => history.push('/')} flex={false}>
        <Image src={FORGE_ICON} height='30px' />
      </Box>
      <Box direction='row' width='100%' align='center' justify='center'>
        <SearchRepositories />
      </Box>
      <Me me={me} />
    </Box>
  )
}