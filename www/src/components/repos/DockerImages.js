import React from 'react'
import { Box, Text } from 'grommet'
import { DockerTag } from 'forge-core'
import { useQuery } from 'react-apollo'
 
import { useHistory } from 'react-router'

import moment from 'moment'

import { DOCKER_IMG_Q } from './queries'
import { GradeNub } from './Docker'

export function HeaderItem({ text, width }) {
  return (
    <Box width={width}><Text
      size="small"
      weight={500}
    >{text}
    </Text>
    </Box>
  )
}

export function DockerImage({ image }) {
  const history = useHistory()

  return (
    <Box
      direction="row"
      align="center"
      hoverIndicator="light-2"
      border={{ side: 'bottom', color: 'light-3' }}
      onClick={() => history.push(`/dkr/img/${image.id}`)}
      pad="xsmall"
      gap="xsmall"
    >
      <Box
        width="15%"
        direction="row"
        align="center"
        gap="xsmall"
      >
        <DockerTag size="12px" /> 
        <Text size="small">{image.tag}</Text>
      </Box>
      <Box width="15%">{moment(image.insertedAt).fromNow()}</Box>
      <Box width="60%"><Text
        size="small"
        truncate
      >{image.digest}
      </Text>
      </Box>
      {image.scannedAt && (
        <Box width="10%">
          <GradeNub
            text={image.grade}
            severity={image.grade}
          />
        </Box>
      )}
    </Box>
  )
}

export function DockerImages({ dockerRepository }) {
  const { data, loading } = useQuery(DOCKER_IMG_Q, {
    variables: { dockerRepositoryId: dockerRepository.id },
  })

  if (!data || loading) return null
  const { edges } = data.dockerImages

  return (
    <Box fill>
      <Box
        flex={false}
        direction="row"
        align="center"
        border={{ side: 'bottom', color: 'light-5' }} 
        gap="xsmall"
        pad="xsmall"
      >
        <HeaderItem
          text="tag"
          width="15%"
        />
        <HeaderItem
          text="created"
          width="15%"
        />
        <HeaderItem
          text="sha"
          width="60%"
        />
        <HeaderItem
          text="grade"
          width="10%"
        />
      </Box>
      {edges.map(({ node }) => (
        <DockerImage
          key={node.id}
          image={node}
        />
      ))}
    </Box>
  )
}
