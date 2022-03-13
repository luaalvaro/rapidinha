import { Flex, Button, Text, Menu, MenuButton, MenuList, MenuItem, IconButton, Center } from '@chakra-ui/react'
import { User } from '@supabase/supabase-js'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import { FaBars, FaBell, FaHistory, FaPlus, FaUser } from 'react-icons/fa'
import { IoMdExit } from 'react-icons/io'
import useGlobal from '../store/globalStore'
import useAuth from '../store/Auth'

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
const Header: React.FC<HeaderProps> = ({ variant }) => {

    const Auth = useAuth(state => state)
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[] | null>(null)

    const getInboxNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from<Notification>('notifications')
                .select('*')
                .order("created_at", { ascending: false })

            console.log(data)
            setNotifications(data)
        } catch (error) {
            console.log(error)
        }
    }

    const handleLogout = () => {
        supabase.auth.signOut()
    }

    const convertDataShortView = (date: string) => {
        let newDate: any = date.split('T')[0]
        newDate = newDate.split('-')
        newDate = `${newDate[2]}/${newDate[1]}`

        return newDate
    }

    const numberOfNotificationsNotRead = (notifications: Notification[]) => {
        const result = notifications.reduce((acc, cur) => {
            if (cur.read === false)
                return acc + 1

            return acc
        }, 0)

        console.log(result)

        return result
    }

    useEffect(() => {
        getInboxNotifications()
    }, [])

    return (
        <Flex
            width="100%"
            height="60px"
            borderBottom="1px solid #A5A5A5"
            px="15px"
            justify={variant !== "auth" ? "space-between" : "center"}
            gridGap={variant !== "auth" ? "0" : "50px"}
        >

            <Flex
                cursor="pointer"
                onClick={() => router.push('/')}
            >
                <Image src="/logo.svg" alt="logo" width={85} height={29} priority />
            </Flex>

            {!Auth.userDetails &&
                <Flex
                    align="center"
                    gridGap="20px"
                >
                    <Button
                        variant="link"
                        color="#fff"

                        onClick={() => router.push('/login')}
                    >
                        Entrar
                    </Button>

                    <Button
                        color="#fff"
                        background="#25D985"

                        _hover={{
                            background: '#20C578'
                        }}
                        _active={{
                            background: '#20C578'
                        }}
                    >
                        Cadastre-se
                    </Button>
                </Flex>
            }

            {Auth.userDetails &&
                <Flex
                    align="center"
                    gridGap="25px"
                >
                    <Menu>
                        <Flex
                            position="relative"
                        >
                            <MenuButton
                                color="#fff"
                                as={IconButton}
                                aria-label='Options'
                                icon={<FaBell />}
                                variant='outline'

                                _hover={{
                                    background: 'transparent'
                                }}

                                _active={{
                                    background: 'transparent'
                                }}
                            />
                            {notifications && numberOfNotificationsNotRead(notifications) !== 0 &&
                                <Center
                                    position="absolute"
                                    borderRadius="100%"
                                    background="red"
                                    width="20px"
                                    height="20px"
                                    color="#fff"
                                    fontWeight={700}
                                    fontSize={10}
                                    top={6}
                                    left={7}
                                >
                                    {numberOfNotificationsNotRead(notifications)}
                                </Center>
                            }
                        </Flex>
                        <MenuList
                            px="10px"
                        >
                            {notifications && notifications.map((mail, index) => (
                                <Flex
                                    key={index}
                                    cursor="pointer"
                                    gridGap="50px"
                                    py="10px"
                                    borderBottom="1px solid rgba(0,0,0,0.1)"
                                    justify="space-between"

                                    onClick={() => router.push(`/notificacoes`)}
                                >
                                    <Text
                                        fontWeight={mail.read ? 400 : 700}
                                    >
                                        {mail.title}
                                    </Text>
                                    <Text
                                    >
                                        {convertDataShortView(mail.created_at)}
                                    </Text>
                                </Flex>
                            ))}

                            {!notifications &&
                                <Flex
                                    cursor="pointer"
                                    gridGap="50px"
                                    py="10px"
                                    borderBottom="1px solid rgba(0,0,0,0.1)"
                                    justify="space-between"
                                >
                                    <Text
                                        fontWeight={700}
                                    >
                                        Nada por aqui
                                    </Text>
                                    <Text
                                    >
                                        :D
                                    </Text>
                                </Flex>
                            }
                        </MenuList>
                    </Menu>

                    <Flex
                        borderRadius="5px"
                        color="#fff"
                        height="40px"
                        align="center"
                        px="12px"
                        border="1px solid rgba(255,255,255,0.5)"
                    >
                        <Text width="max-content">R$ {Auth.userDetails.currency}</Text>
                    </Flex>

                    <Menu>
                        <MenuButton
                            color="#fff"
                            as={IconButton}
                            aria-label='Options'
                            icon={<FaBars />}
                            variant='outline'

                            _hover={{
                                background: 'transparent'
                            }}

                            _active={{
                                background: 'transparent'
                            }}
                        />
                        <MenuList>
                            <Text
                                pl="15px"
                                fontWeight={500}
                                my="5px"
                            >
                                Olá, {Auth.userDetails.firstName}
                            </Text>
                            <MenuItem icon={<FaUser />}>
                                Perfil
                            </MenuItem>
                            <MenuItem
                                onClick={() => router.push('/minhasrapidinhas')}
                                icon={<FaHistory />}
                            >
                                Minhas rapidinhas
                            </MenuItem>
                            <MenuItem icon={<FaPlus />}>
                                Depositar
                            </MenuItem>
                            <MenuItem
                                onClick={handleLogout}
                                icon={<IoMdExit />}
                            >
                                Sair
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </Flex>
            }
        </Flex>
    )
}

export default Header