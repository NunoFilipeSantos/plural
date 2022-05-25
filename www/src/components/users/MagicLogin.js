import { createElement, useCallback, useEffect, useState } from 'react'
import { Anchor, Box, Collapsible, Form, Keyboard, Text } from 'grommet'
import { Divider } from 'pluralsh-design-system'
import { useApolloClient, useLazyQuery, useMutation, useQuery } from '@apollo/client'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import queryString from 'query-string'
import { Button, Flex, H1, H2, Box as HBox, Input, P } from 'honorable'

import { fetchToken, setToken } from '../../helpers/authentication'
import { Alert, AlertStatus, GqlError } from '../utils/Alert'
import { PasswordStatus, disableState } from '../Login'
import { PLURAL_ICON, PLURAL_MARK_WHITE } from '../constants'
import { ACCEPT_LOGIN } from '../oidc/queries'

import { host } from '../../helpers/hostname'

import { getDeviceToken, saveChallenge, saveDeviceToken, wipeChallenge, wipeDeviceToken } from './utils'

import { LoginMethod } from './types'
import { LOGIN_METHOD, LOGIN_MUTATION, OAUTH_URLS, PASSWORDLESS_LOGIN, POLL_LOGIN_TOKEN, SIGNUP_MUTATION } from './queries'
import { METHOD_ICONS } from './OauthEnabler'
import { finishedDeviceLogin } from './DeviceLoginNotif'

export function LabelledInput({ label, value, onChange, placeholder, width, type, modifier }) {
  return (
    <Box
      gap="2px"
      width={width || '300px'}
    >
      <Box
        direction="row"
        align="center"
      >
        <Box fill="horizontal">
          <Text
            size="small"
            color="dark-4"
          >{label}
          </Text>
        </Box>
        <Box flex={false}>
          {modifier}
        </Box>
      </Box>
      <Input
        name={label}
        type={type}
        value={value || ''}
        onChange={onChange && (({ target: { value } }) => onChange(value))}
        placeholder={placeholder}
      />
    </Box>
  )
}

function ValueNum({ children }) {
  return (
    <Flex
      width="48px"
      height="48px"
      borderRadius="24px"
      flexShrink={0}
      justifyContent="center"
      alignItems="center"
      background="background-light"
      mr="24px"
    >
      <H1>{children}</H1>
    </Flex>
  )
}

function ValueContent({ children, title }) {
  return (
    <HBox>
      <H2 mb={0.5}>
        {title}
      </H2>
      <P>
        {children}
      </P>
    </HBox>
  )
}

function LoginValueProps() {
  return (
    <HBox
      maxWidth="400px"
    >
      <Flex justifyContent="center">
        <img
          src={PLURAL_ICON}
          width={256}
        />
      </Flex>
      <Flex
        fill="horizontal"
        direction="row"
      >
        <ValueNum>1</ValueNum>
        <ValueContent title={<>Built for the cloud.</>}>
          Plural is optimized for you to bring your own cloud and run on top of
          Kubernetes with the ideal cluster distribution.
        </ValueContent>
      </Flex>
      <Flex
        fill="horizontal"
        direction="row"
      >
        <ValueNum>2</ValueNum>
        <ValueContent title={<>Developer friendly.</>}>
          Use our simple GitOps driven workflow for deploying and managing
          applications, and a centralized configuration in a single repo.
        </ValueContent>
      </Flex>
      <Flex
        fill="horizontal"
        direction="row"
      >
        <ValueNum>3</ValueNum>
        <ValueContent title={<>Batteries included.</>}>
          Baked-in observability, logging, auditing, and user auth.
        </ValueContent>
      </Flex>
    </HBox>
  )

}

export function LoginPortal({ children, ...props }) {
  return (
    <Box
      height="100vh"
      fill="horizontal"
      direction="row"
    >
      <Flex
        justify="center"
        align="center"
        width="50%"
        height="100%"
        backgroundColor="background-middle"
      >
        <LoginValueProps />
      </Flex>
      <Box
        style={{ overflow: 'auto' }}
        align="center"
        justify="center"
        width="50%"
        // backgroundColor="background"
      >
        <Box
          flex={false}
          {...props}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export function PasswordlessLogin() {
  const { token } = useParams()
  const [mutation, { error, loading, data }] = useMutation(PASSWORDLESS_LOGIN, {
    variables: { token },
  })

  useEffect(() => {
    mutation()
  }, [mutation])

  return (
    <LoginPortal>
      <Box gap="medium">
        <Box
          gap="xsmall"
          align="center"
        >
          <img
            src={PLURAL_MARK_WHITE}
            width="45px"
          />
          <Text size="large">
            Passwordless Login
          </Text>
        </Box>
        {loading && (
          <Text
            size="small"
            color="dark-3"
          >
            Validating your login token...
          </Text>
        )}
        {error && (
          <GqlError
            error={error}
            header="Error validating login"
          />
        )}
        {data && (
          <Alert
            status={AlertStatus.SUCCESS}
            header="You're now logged in!"
            description="Navigate back to wherever you initiated the login to begin using plural."
          />
        )}
      </Box>
    </LoginPortal>
  )
}

export function handleOauthChallenge(client, challenge) {
  client.mutate({
    mutation: ACCEPT_LOGIN,
    variables: { challenge },
  }).then(({ data: { acceptLogin: { redirectTo } } }) => {
    window.location = redirectTo
  })
}

function LoginPoller({ challenge, token, deviceToken }) {
  const navigate = useNavigate()
  const client = useApolloClient()
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      client.mutate({
        mutation: POLL_LOGIN_TOKEN,
        variables: { token, deviceToken },
      }).then(({ data: { loginToken: { jwt } } }) => {
        setToken(jwt)
        setSuccess(true)

        if (deviceToken) finishedDeviceLogin()

        if (challenge) {
          handleOauthChallenge(client, challenge)
        }
        else {
          navigate('/')
        }
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [token, challenge, deviceToken, navigate, client])

  if (success) {
    return (
      <Alert
        status={AlertStatus.SUCCESS}
        header="Login Verified!"
        description="we'll redirect you to the app shortly"
      />
    )
  }

  return (
    <Alert
      status={AlertStatus.SUCCESS}
      header="Check your email!"
      description="Check your email to verify your identity and log in"
    />
  )
}

export function Login() {
  const navigate = useNavigate()
  const client = useApolloClient()
  const location = useLocation()
  const { login_challenge: challenge, deviceToken } = queryString.parse(location.search)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [getLoginMethod, { data, loading: qLoading, error: qError }] = useLazyQuery(LOGIN_METHOD, {
    variables: { email, host: host() },
  })

  const loginMethod = data && data.loginMethod && data.loginMethod.loginMethod
  const open = loginMethod === LoginMethod.PASSWORD
  const passwordless = loginMethod === LoginMethod.PASSWORDLESS

  const [mutation, { loading: mLoading, error }] = useMutation(LOGIN_MUTATION, {
    variables: { email, password, deviceToken },
    onCompleted: ({ login: { jwt } }) => {
      setToken(jwt)
      if (deviceToken) finishedDeviceLogin()
      if (challenge) {
        handleOauthChallenge(client, challenge)
      }
      else {
        navigate('/')
      }
    },
  })

  useEffect(() => {
    wipeChallenge()
    wipeDeviceToken()

    if (data && data.loginMethod && data.loginMethod.authorizeUrl) {
      if (challenge) saveChallenge(challenge)
      if (deviceToken) saveDeviceToken(deviceToken)
      window.location = data.loginMethod.authorizeUrl
    }
  }, [data, challenge, deviceToken])

  useEffect(() => {
    const jwt = fetchToken()
    if (jwt && challenge) {
      handleOauthChallenge(client, challenge)
    }
    else if (!deviceToken && jwt) {
      navigate('/')
    }
  }, [challenge, deviceToken, navigate, client])

  const submit = useCallback(() => open ? mutation() : getLoginMethod(), [mutation, getLoginMethod, open])

  const loading = qLoading || mLoading

  if (qError) {
    if (deviceToken) saveDeviceToken(deviceToken)

    return <Navigate to="/signup" />
  }

  return (
    <LoginPortal>
      <Box gap="medium">
        <Box
          gap="xsmall"
          align="center"
        >
          <img
            src={PLURAL_MARK_WHITE}
            width="45px"
          />
          <Text size="large">
            Welcome
          </Text>
          <Text
            size="small"
            color="dark-3"
          >
            {open ? 'good to see you again' : 'Tell us your email to get started'}
          </Text>
        </Box>
        {passwordless && (
          <Box>
            <LoginPoller
              token={data.loginMethod.token}
              challenge={challenge}
              deviceToken={deviceToken}
            />
          </Box>
        )}
        {!passwordless && (
          <Keyboard onEnter={submit}>
            <Form onSubmit={submit}>
              <Box gap="xsmall">
                {error && (
                  <GqlError
                    error={error}
                    header="Login Failed"
                  />
                )}
                <LabelledInput
                  label="Email"
                  value={email}
                  onChange={open ? null : setEmail}
                  placeholder="you@example.com"
                />
                <Collapsible
                  open={open}
                  direction="vertical"
                >
                  <LabelledInput
                    label="Password"
                    type="password"
                    modifier={(
                      <Anchor
                        onClick={() => navigate('/password-reset')}
                        color="dark-6"
                      >forgot your password?
                      </Anchor>
                    )}
                    value={password}
                    onChange={setPassword}
                    placeholder="a strong password"
                  />
                </Collapsible>
                <Button
                  width="100%"
                  mt={0.5}
                  loading={loading}
                  onClick={submit}
                >
                  Continue
                </Button>
              </Box>
            </Form>
          </Keyboard>
        )}
      </Box>
    </LoginPortal>
  )
}

const WIDTH = '350px'

const providerToName = {
  github: 'GitHub',
  google: 'Google',
}

function OAuthOption({ url: { authorizeUrl, provider } }) {
  const icon = METHOD_ICONS[provider]

  return (
    <Box
      border
      round="xsmall"
      align="center"
      justify="center"
      direction="row"
      gap="small"
      fill="horizontal"
      pad={{ vertical: '7px' }}
      hoverIndicator="background-light"
      onClick={() => {
        window.location = authorizeUrl
      }}
    >
      {createElement(icon, { size: 'medium', color: provider.toLowerCase() === 'github' ? 'white' : 'plain' })}
      <Text size="small">Sign up with {providerToName[provider.toLowerCase()]}</Text>
    </Box>
  )
}

export function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [account, setAccount] = useState('')
  const [confirm, setConfirm] = useState('')
  const deviceToken = getDeviceToken()
  const [mutation, { loading, error }] = useMutation(SIGNUP_MUTATION, {
    variables: { attributes: { email, password, name }, account: { name: account }, deviceToken },
    onCompleted: ({ signup: { jwt } }) => {
      if (deviceToken) finishedDeviceLogin()
      setToken(jwt)
      window.location = '/'
    },
  })
  const { data } = useQuery(OAUTH_URLS, { variables: { host: host() } })

  useEffect(() => {
    if (fetchToken()) {
      navigate('/')
    }
  }, [navigate])

  const { disabled, reason } = disableState(password, confirm)

  return (
    <LoginPortal>
      <Box
        flex={false}
        gap="small"
      >
        <Box
          gap="xsmall"
          align="center"
        >
          <img
            src={PLURAL_MARK_WHITE}
            width="45px"
          />
          <Text size="medium">Sign up to get started with plural</Text>
        </Box>
        <Box
          gap="xsmall"
          justify="center"
        >
          {data && data.oauthUrls.map(url => (
            <OAuthOption
              key={url.provider}
              url={url}
            />
          ))}
        </Box>
        <Divider
          text="Or"
          margin="0px"
          fontWeight={400}
        />
        <Keyboard onEnter={mutation}>
          <Form onSubmit={mutation}>
            <Box
              gap="xsmall"
              width={WIDTH}
            >
              {error && (
                <GqlError
                  error={error}
                  header="Login Failed"
                />
              )}
              <LabelledInput
                label="Account"
                value={account}
                width={WIDTH}
                onChange={setAccount}
                placeholder="The name of your account (must be unique)"
              />
              <LabelledInput
                label="Name"
                value={name}
                width={WIDTH}
                onChange={setName}
                placeholder="Your name"
              />
              <LabelledInput
                label="Email"
                value={email}
                width={WIDTH}
                onChange={setEmail}
                placeholder="you@example.com"
              />
              <LabelledInput
                label="Password"
                value={password}
                width={WIDTH}
                type="password"
                onChange={setPassword}
                placeholder="a strong password"
              />
              <LabelledInput
                label="Confirm Password"
                value={confirm}
                width={WIDTH}
                type="password"
                onChange={setConfirm}
                placeholder="confirm your password"
              />
              <Box
                direction="row"
                align="center"
                justify="end"
                gap="small"
                margin={{ top: 'small' }}
              >
                <PasswordStatus
                  disabled={disabled}
                  reason={reason}
                />
                <Button
                  secondary
                  disabled={disabled}
                  loading={loading}
                  onClick={mutation}
                >
                  Sign Up
                </Button>
              </Box>
            </Box>
          </Form>
        </Keyboard>
        <Box
          fill="horizontal"
          align="center"
          justify="center"
          direction="row"
          gap="xsmall"
        >
          <Text
            size="small"
            color="dark-6"
          >Already have an account?
          </Text>
          <Anchor onClick={() => navigate('/login')}>Login</Anchor>
        </Box>
      </Box>
    </LoginPortal>
  )
}
