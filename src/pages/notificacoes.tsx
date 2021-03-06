import { Flex, Button, Text, Menu, Spinner, MenuButton, MenuList, MenuItem, IconButton, Center } from '@chakra-ui/react'
import { User } from '@supabase/supabase-js'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import { FaBars, FaBell, FaHistory, FaPlus, FaUser } from 'react-icons/fa'
import { IoMdExit } from 'react-icons/io'
import useGlobal from '../store/globalStore'
import { NextPage } from 'next/types'
import Container from '../components/Container'
import Header from '../containers/Header'
import AuthProvider from '../components/AuthProvider'

interface HeaderProps {
  variant?: string,
}

interface Profiles {
  avatarUrl: string | null
  cpf: string
  currency: 0
  firstName: string
  id: string
  telefone: string
  updatedAt: string
}

interface Notification {
  body: string,
  created_at: string,
  id: string,
  read: boolean,
  title: string,
  user_id: string,
}
const Notificacoes: NextPage = () => {

  const router = useRouter()
  const [user, setUser] = useState<Profiles | null>(null)
  const [notifications, setNotifications] = useState<Notification[] | null>(null)
  const global = useGlobal(state => state)
  const [mailSelected, setMailSelected] = useState("")
  const [loading, setLoading] = useState(false)

  const getUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from<Profiles>('profiles')
        .select('*')
        .single()

      setUser(data)
    } catch (error) {
      console.log(error)
    }
  }

  const getInboxNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from<Notification>('notifications')
        .select('*')
        .order("created_at", { ascending: false })

      setNotifications(data)
    } catch (error) {
      console.log(error)
    }
  }

  const convertDataShortView = (date: string) => {
    let newDate: any = date.split('T')[0]
    newDate = newDate.split('-')
    newDate = `${newDate[2]}/${newDate[1]}`

    return newDate
  }

  const handleOpenEmail = async (email: Notification) => {
    if (!email.read) {
      //Email n??o lido
      //Alterar status no backend

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from<Notification>('notifications')
          .update({ read: true })
          .eq('id', email.id)
          .single()

        if (error)
          throw error

        if (!data)
          return

        if (!notifications)
          return

        const newData = notifications.map((email) => {
          if (email.id === data.id) {
            console.log('DEU MATCH')
            return data
          }

          return email
        })

        setNotifications(newData)

      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    setMailSelected(email.id)
  }

  useEffect(() => {
    const userSupabase = supabase.auth.user()

    if (userSupabase) {
      getUserProfile()
    }
  }, [global.reloadProfile])

  useEffect(() => {
    getInboxNotifications()
  }, [])

  return (
    <AuthProvider>
      <Header />

      <Flex
        direction="column"
        gridGap="10px"
        px="15px"
      >
        <Text
          fontWeight={700}
          fontSize={18}
          color="#fff"
          my="20px"
        >
          Caixa de entrada
        </Text>
        {notifications && notifications.map((mail, index) => (
          <Flex
            key={index}
            background="#fff"
            align="center"
            px="15px"
            borderRadius="8px"
            justify="space-between"
            direction="column"
            onClick={() => handleOpenEmail(mail)}
            transition="all 1s ease-in-out"
          >
            <Flex
              my="5"
              width="100%"
              justify="space-between"
              cursor="pointer"
            >
              <Text
                fontWeight={mail.read ? 400 : 700}
              >
                {mail.title}
              </Text>
              <Text>{convertDataShortView(mail.created_at)}</Text>
            </Flex>

            <Flex
              display={mailSelected === mail.id ? "flex" : "none"}
              mb="5"
              borderTop="1px solid rgba(0,0,0,0.1)"
              borderBottom="1px solid rgba(0,0,0,0.1)"
              pt="3"
              pb="3"
              transition="all 1s ease-in-out"
            >
              <Text>{mail.body}</Text>
            </Flex>
          </Flex>
        ))}
      </Flex>

      <Center
        display={loading ? "flex" : "none"}
        position="absolute"
        background="rgba(0,0,0,0.5)"
        top="0"
        left="0"
        right="0"
        bottom="0"
      >
        <Spinner size='xl' color="#fff" />
      </Center>
    </AuthProvider>
  )
}

export default Notificacoes