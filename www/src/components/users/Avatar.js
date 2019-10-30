import React from 'react'
import {Box, Text} from 'grommet'

function initials(name) {
  return name
          .split(' ')
          .map((n) => n.charAt(0).toUpperCase())
          .join('')
}

function Avatar({size, user}) {
  return (
    <Box
      round='xsmall'
      align='center'
      justify='center'
      width={size}
      height={size}
      background={user.backgroundColor}>
      {user.avatar ?
        <img alt='my avatar' height={size} width={size} style={{borderRadius: '6px'}} src={user.avatar}/> :
        <Text>{initials(user.name)}</Text>
      }
    </Box>
  )
}

export default Avatar