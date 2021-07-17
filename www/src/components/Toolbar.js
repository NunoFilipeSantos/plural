import React, { useContext, useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { Box, Image } from 'grommet'
import Me from './users/Me'
import SearchRepositories from './repos/SearchRepositories'
import { CurrentUserContext } from './login/CurrentUser'
import { SIDEBAR_WIDTH } from './Sidebar'
import { Breadcrumbs } from './Breadcrumbs'
import { Notifications } from './users/Notifications'
import { LoopingLogo } from './utils/AnimatedLogo'
import './toolbar.css'

const PLRL_ICON = `${process.env.PUBLIC_URL}/plural-white.png`

function ToolbarIcon() {
  const location = useLocation()
  const [loaded, setLoaded] = useState(false)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    if (!loaded) {
      setLoaded(true)
      return
    }

    setAnimated(true)
    setTimeout(() => setAnimated(false), 2000)
  }, [location])

  if (animated && !animated) return <LoopingLogo scale='0.5' />

  return <Image src={PLRL_ICON} height='30px' />
}

export default function Toolbar() {
  const me = useContext(CurrentUserContext)
  let history = useHistory()

  return (
    <Box direction='row' fill='horizontal' align='center'>
      <Box focusIndicator={false} width={SIDEBAR_WIDTH} height='100%' justify='center' align='center'
           onClick={() => history.push('/')} flex={false} className='plrl-main-icon'>
        <ToolbarIcon />
      </Box>
      <Breadcrumbs />
      <Box direction='row' width='100%' align='center' justify='end' margin={{right: 'small'}}>
        <SearchRepositories />
      </Box>
      <Notifications />
      <Box flex={false} margin={{horizontal: 'small'}} round='xsmall'>
        <Me me={me} />
      </Box>
    </Box>
  )
}