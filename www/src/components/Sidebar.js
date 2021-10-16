import React, { useContext, useRef, useState } from 'react'
import { Box, Drop, Text } from 'grommet'
import { Explore, User, Group, Incidents, Update, Webhooks, Audits } from 'forge-core'
import { Menu, Previous } from 'grommet-icons'
import { normalizeColor } from 'grommet/utils'
import { useHistory, useLocation } from 'react-router-dom'
import { Next, Down } from 'grommet-icons'
import { CurrentUserContext } from './login/CurrentUser'
import Avatar from './users/Avatar'
import { Submenu, SubmenuContext } from './navigation/Submenu'
import styled from 'styled-components'

export const SIDEBAR_ICON_HEIGHT = '40px'
const ICON_HEIGHT = '17px'
export const SIDEBAR_WIDTH = '200px'
export const SMALL_WIDTH = '60px'

const hoverable = styled.div`
  &:hover span {
    color: ${props => normalizeColor('white', props.theme)};
  }

  &:hover svg {
    stroke: ${props => normalizeColor('white', props.theme)} !important;
    fill: ${props => normalizeColor('white', props.theme)} !important;
  }
`

export function SidebarIcon({icon, text, name: sidebarName, selected, path}) {
  const {name} = useContext(SubmenuContext)
  const inSubmenu = name === sidebarName
  let history = useHistory()
  const textColor = selected && !inSubmenu ? 'white' : 'light-5'

  return (
    <Box as={hoverable} flex={false} fill='horizontal' background={(selected && !inSubmenu) ? 'sidebarHover' : null}>
      <Box focusIndicator={false} fill='horizontal' align='center' direction='row' 
        height={SIDEBAR_ICON_HEIGHT} hoverIndicator='sidebarHover' 
        onClick={!inSubmenu && selected ? null : () => history.push(path)} 
        pad={{horizontal: 'small'}}>
        <Box direction='row' align='center' gap='15px' fill='horizontal'>
          {icon}
          <Text size='small' color={textColor}>{text}</Text>
        </Box>
        {sidebarName && !selected && <Next size='12px' />}
        {sidebarName && selected  && <Down size='12px' />}
      </Box>
      {selected && <Submenu />}
    </Box>
  )
}

function CompressedIcon({icon, text, selected, path}) {
  const ref = useRef()
  const [hover, setHover] = useState(false)
  let history = useHistory()

  return (
    <>
      <Box ref={ref} focusIndicator={false} align='center' justify='center' direction='row' 
        height={SIDEBAR_ICON_HEIGHT} width={SIDEBAR_ICON_HEIGHT} hoverIndicator='sidebarHover' 
        background={selected ? 'sidebarHover' : null} margin={{bottom: 'xsmall'}}
        onClick={selected ? null : () => history.push(path)} 
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}>
        {icon}
      </Box>
      {hover && (
        <Drop plain target={ref.current} align={{left: "right"}}>
          <Box round='3px' background='sidebar' pad='small'>
            <Text size='small' weight={500}>{text}</Text>
          </Box>
        </Drop>
      )}
    </>
  )  
}

const OPTIONS = [
  {text: 'Explore', name: 'explore', icon: <Explore size={ICON_HEIGHT} />, path: '/explore'},
  {text: 'User', icon: <User size={ICON_HEIGHT} />, path: '/me/edit'},
  {text: 'Account', icon: <Group size={ICON_HEIGHT} />, path: '/accounts/edit'},
  {text: 'Upgrades', icon: <Update size={ICON_HEIGHT} />, path: '/upgrades'},
  {text: 'Incidents', name: 'incidents', icon: <Incidents size={ICON_HEIGHT} />, path: '/incidents', prefix: '/incident'},
  {text: 'Integrations', icon: <Webhooks size={ICON_HEIGHT} />, path: '/webhooks'},
  {text: 'Audits', name: 'audits', icon: <Audits size={ICON_HEIGHT} />, path: '/audits'},
]

const animation = {
  transition: 'width 0.75s cubic-bezier(0.000, 0.795, 0.000, 1.000)'
}

function Collapse({setExpanded}) {
  return (
    <Box direction='row' fill='horizontal' align='center' gap='xsmall' round='xsmall'
          pad='xsmall' hoverIndicator='sidebarHover' onClick={() => setExpanded(false)}>
      <Previous size='15px' />
      <Text size='small'>Collapse</Text>
    </Box>
  )
}

function Expand({setExpanded}) {
  return (
    <Box pad='xsmall' align='center' justify='center' hoverIndicator='sidebarHover'
         onClick={() => setExpanded(true)} round='xsmall'>
      <Menu size='15px' />
    </Box>
  )
}

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false)
  const me = useContext(CurrentUserContext)
  let hist = useHistory()
  const loc = useLocation()
  const active = OPTIONS.findIndex(({path, prefix}) => loc.pathname.startsWith(prefix || path))
  const isExpanded = expanded || (active >= 0 && !!OPTIONS[active].name)

  return (
    <Box style={animation} width={isExpanded ? SIDEBAR_WIDTH : SMALL_WIDTH} flex={false} 
         background='sidebar' fill='vertical' border={{side: 'right'}}>
      <Box fill='horizontal' height='100%' align='center'>
        {OPTIONS.map((opt, ind) => (
          isExpanded ? 
            <SidebarIcon key={opt.path} selected={ind === active} {...opt} /> :
            <CompressedIcon key={opt.path} selected={ind === active} {...opt} />
        ))}
      </Box>
      <Box flex={false} margin={{bottom: '15px'}} align='center' gap='xsmall' pad={{horizontal: 'xsmall'}} >
        <Box fill='horizontal' direction='row' gap='xsmall' align='center' 
             hoverIndicator='sidebarHover' pad='xsmall' round='xsmall'
             justify={!isExpanded ? 'center' : null}
             onClick={() => hist.push('/me/edit/user')}>
          <Avatar user={me} size={isExpanded ? '45px' : '30px'} />
          {isExpanded && (
            <Box>
              <Text size='small' truncate>{me.name}</Text>
              <Text size='small'>{me.email}</Text>
            </Box>
          )}
        </Box>
        {isExpanded && <Collapse setExpanded={setExpanded} />}
        {!isExpanded && <Expand setExpanded={setExpanded} />}
      </Box>
    </Box>
  )
}