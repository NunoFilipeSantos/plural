import React, { useEffect } from 'react'
import { useQuery } from 'react-apollo'
import { useLocation } from 'react-router'
import { Redirect } from 'react-router-dom'
import { Box } from 'grommet'

import { useIntercom } from 'react-use-intercom'

import { ME_Q } from '../users/queries'
import { wipeToken } from '../../helpers/authentication'
import { useNotificationSubscription } from '../incidents/Notifications'
import { LoopingLogo } from '../utils/AnimatedLogo'

// const POLL_INTERVAL=30000
export const CurrentUserContext = React.createContext({})
export const PluralConfigurationContext = React.createContext({})

export default function CurrentUser({ children }) {
  const { loading, error, data } = useQuery(ME_Q)
  useNotificationSubscription()

  if (loading) return (<Box height="100vh"><LoopingLogo /></Box>)

  if (error || !data || !data.me || !data.me.id) {
    wipeToken()

    return (<Redirect to="/login" />)
  }
  const { me } = data

  return (
    <CurrentUserContext.Provider value={me}>
      {children}
    </CurrentUserContext.Provider>
  )
}

export function PluralProvider({ children }) {
  const location = useLocation()
  const { loading, error, data } = useQuery(ME_Q, { pollInterval: 60000 })
  const { boot, update } = useIntercom()
  useNotificationSubscription()

  useEffect(() => {
    if (!data || !data.me) return
    boot({ name: data.me.name, email: data.me.email, user_id: data.me.id })
  }, [data])

  useEffect(() => {
    if (data && data.me) update()
  }, [location, data])

  if (loading) return (<Box height="100vh"><LoopingLogo dark /></Box>)

  if (error || !data || !data.me || !data.me.id) {
    wipeToken()

    return (<Redirect to="/login" />)
  }

  const { me, configuration } = data

  return (
    <PluralConfigurationContext.Provider value={configuration}>
      <CurrentUserContext.Provider value={me}>
        {children}
      </CurrentUserContext.Provider>
    </PluralConfigurationContext.Provider>
  )
}
