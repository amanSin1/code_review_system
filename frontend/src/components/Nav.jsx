import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logout, getUser, fetchNotifications } from '../api'
import { Box, Flex, Badge, Spacer, Button, Text } from '@chakra-ui/react'

export default function Nav(){
  const nav = useNavigate()
  const [user, setUser] = useState(getUser())
  const [unread, setUnread] = useState(0)

  useEffect(()=>{
    // update unread when user changes
    let mounted = true
    if(user){
      fetchNotifications().then(res=>{
        if(!mounted) return
        const list = Array.isArray(res)? res : (res.notifications || [])
        const count = list.filter(n=> !n.read).length
        setUnread(count)
      }).catch(()=>{})
    }

    // listen for global auth changes (login/logout)
    function onAuth(){ setUser(getUser()) }
    window.addEventListener('auth-changed', onAuth)

    return ()=>{ mounted = false; window.removeEventListener('auth-changed', onAuth) }
  },[user])

  function doLogout(){ logout(); setUser(null); nav('/login') }

  return (
    <Box bg="white" px={4} py={3} boxShadow="sm">
      <Flex align="center">
        <Box fontWeight="bold" color="blue.600"><Link to="/">Code Review</Link></Box>
        <Box ml={6}><Link to="/submissions">Submissions</Link></Box>
        <Spacer />
        {user ? (
          <Flex align="center" gap={3}>
            <Box>
              <Link to="/notifications">
                <Badge colorScheme={unread>0? 'red':'gray'}>{unread}</Badge>
              </Link>
            </Box>
            <Text>Hi, {user.name}</Text>
            <Button size="sm" variant="link" onClick={doLogout}>Logout</Button>
          </Flex>
        ) : (
          <Box>
            <Link to="/login">Login</Link>
          </Box>
        )}
      </Flex>
    </Box>
  )
}
