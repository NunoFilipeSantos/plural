import React, { useState, useRef } from 'react'
import styled from 'styled-components'
import { Box, Text, Drop, Markdown, Table, TableBody, TableRow, TableCell } from 'grommet'
import { Apple, Windows, Ubuntu, Terminal, Previous, Cube } from 'grommet-icons'
import { normalizeColor } from 'grommet/utils'
import { download } from '../../utils/file'
import { MARKDOWN_STYLING } from './Chart'
import fs from 'filesize'
import { DetailContainer } from './Installation'

const ICON_SIZE = '20px'
const SMALL_ICON_SIZE = '13px'
const SHA_LENGTH  = 20

const trim = (sha) => `${sha.substring(0, SHA_LENGTH)}...`

function ArtifactPlatform({platform}) {
  switch (platform) {
    case "MAC":
      return <Apple size={SMALL_ICON_SIZE} />
    case "WINDOWS":
      return <Windows size={SMALL_ICON_SIZE} />
    case "LINUX":
      return <Ubuntu size={SMALL_ICON_SIZE} />
    default:
      return null
  }
}

const ICON_COLOR = 'focus'

function ArtifactIcon({type}) {
  switch (type) {
    case "CLI":
      return <Terminal color={ICON_COLOR} size={ICON_SIZE} />
    default:
      return <Cube color={ICON_COLOR} size={ICON_SIZE} />
  }
}

function Readme({readme}) {
  return (
    <Box pad={{horizontal: 'small', bottom: 'small'}} style={{maxWidth: '40vw', overflow: 'auto'}}>
      <Markdown components={MARKDOWN_STYLING}>
        {readme}
      </Markdown>
    </Box>
  )
}

const hovered = styled.div`
  cursor: pointer;
  &:hover {
    background-color: ${props => normalizeColor('light-3', props.theme)};
  }
`;

const optionHover = styled.div`
  cursor: pointer;
  &:hover {
    background-color: #000000;
  }
  &:hover span {
    text-color: ${props => normalizeColor('light-3', props.theme)};
  }
`;

function ArtifactOption({onClick, text, border, round}) {
  return (
    <Box
      as={optionHover}
      onClick={onClick}
      round={round}
      pad={{horizontal: 'small', vertical: 'xsmall'}}
      border={border}>
      <Text size='small'>{text}</Text>
    </Box>
  )
}

function WithBack({children, setAlternate}) {
  return (
    <Box animation='fadeIn'>
      <Box pad='small'>
        {children}
      </Box>
      <Box
        as={hovered}
        flex={false}
        onClick={() => setAlternate(null)}
        direction='row'
        align='center'
        border='top'
        pad='small'
        gap='small'>
        <Previous size='12px' />
        <Text size='small'>back</Text>
      </Box>
    </Box>
  )
}


function ArtifactDetails({sha, filesize}) {
  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell border='right'><b>sha</b></TableCell>
          <TableCell>{trim(sha)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell border='right'><b>filesize</b></TableCell>
          <TableCell>{fs(filesize)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

function ArtifactDetail({dropRef, setOpen, blob, readme, sha, filesize}) {
  const [alternate, setAlternate] = useState(null)

  return (
    <Drop
      target={dropRef.current}
      align={{bottom: 'top'}}
      onEsc={() => setOpen(false)}
      onClickOutside={() => setOpen(false)}>
      {alternate ? <WithBack setAlternate={setAlternate}>{alternate}</WithBack> : (
        <Box background='#222222' direction='row' round='xsmall'>
          <ArtifactOption
            text='download'
            border='right'
            round={{corner: 'left', size: 'xsmall'}}
            onClick={() => download(blob)} />
          <ArtifactOption
            text='readme'
            border='right'
            onClick={() => setAlternate(<Readme readme={readme} />)} />
          <ArtifactOption
            text='details'
            border='right'
            round={{corner: 'right', size: 'xsmall'}}
            onClick={() => setAlternate(<ArtifactDetails sha={sha} filesize={filesize} />)} />
        </Box>
      )}
    </Drop>
  )
}

export function Artifact({name, type, platform, filesize, ...artifact}) {
  const [open, setOpen] = useState(false)
  const dropRef = useRef()

  return (
    <>
    <Box focusIndicator={false} onClick={() => setOpen(!open)} hoverIndicator='light-3'
      direction='row' gap='small' align='center' pad='small'>
      <ArtifactIcon type={type} />
      <Box ref={dropRef} gap='xsmall'>
        <Box direction='row' gap='xsmall' align='center'>
          <Text size='small' weight={500}>{name}</Text>
          <ArtifactPlatform platform={platform} />
          <Text size='small' color='dark-3'>-- {fs(filesize)}</Text>
        </Box>
      </Box>
    </Box>
    {open && <ArtifactDetail dropRef={dropRef} setOpen={setOpen} filesize={filesize} {...artifact} />}
    </>
  )
}

export function DetailHeader({text, modifier}) {
  return (
    <Box
      direction='row'
      border={{color: 'light-6', side: 'bottom'}}
      pad='small'
      background='light-1'
      justify='end'>
      <Box fill='horizontal'>
        <Text weight={500} size='small'>{text}</Text>
      </Box>
      {modifier}
    </Box>
  )
}

export default function Artifacts({artifacts}) {
  if (!artifacts || artifacts.length === 0) return null

  return (
    <DetailContainer>
      <DetailHeader text='Artifacts' />
      <Box gap='0px' border={{side: 'between', color: 'light-5'}}>
        {artifacts.map((artifact) => <Artifact key={artifact.id} {...artifact} />)}
      </Box>
    </DetailContainer>
  )
}