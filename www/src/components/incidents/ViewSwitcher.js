import React, { useRef, useState } from 'react'
import { Box, Text } from 'grommet'
import { Tooltip } from '../utils/Tooltip'
import { IncidentView } from './types'
import { Chat, Resources } from 'grommet-icons'

function ViewOption({icon, selected, view, setView, text}) {
  const ref = useRef()
  const [hover, setHover] = useState(false)
  return (
    <>
    <Box ref={ref} flex={false} width='40px' align='center' justify='center' round='xsmall' hoverIndicator='light-3'
      onClick={() => setView(view)} pad='xsmall' focusIndicator={false}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {React.createElement(icon, selected === view ? {size: '20px', color: 'brand'} : {size: '20px'})}
    </Box>
    {hover  && (
      <Tooltip pad={{horizontal: 'small', vertical: 'xsmall'}} round='xsmall' justify='center' 
               target={ref} side='right' align={{left: 'right'}}>
        <Text size='small' weight={500}>{text}</Text>
      </Tooltip>
    )}
    </>
  )
}

export function ViewSwitcher({view, setView}) {
  return (
    <Box width='50px' gap='small' align='center' pad={{vertical: 'small'}} border={{side: 'right', color: 'light-5'}}>
      <ViewOption 
        icon={Chat} 
        selected={view} 
        view={IncidentView.MSGS}
        setView={setView}
        text='Messages' />
      <ViewOption 
        icon={Resources} 
        selected={view} 
        view={IncidentView.FILES}
        setView={setView}
        text='Files' />
    </Box>
  )
}