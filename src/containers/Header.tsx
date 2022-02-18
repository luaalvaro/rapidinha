import { Flex, Button, Text, Menu, MenuButton, MenuList, MenuItem, IconButton } from '@chakra-ui/react'
import { User } from '@supabase/supabase-js'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import { FaBars, FaUser } from 'react-icons/fa'
import { IoMdExit } from 'react-icons/io'
import useGlobal from '../store/globalStore'

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

const Header: React.FC<HeaderProps> = ({ variant }) => {

    const router = useRouter()
    const [user, setUser] = useState<Profiles | null>(null)
    const global = useGlobal(state => state)

    const getUserProfile = async () => {

        try {
            const { data, error } = await supabase
                .from<Profiles>('profiles')
                .select('*')
                .single()

            setUser(data)
        } catch (error) {
            console.error(error)
        }
    }

    const handleLogout = () => {
        supabase.auth.signOut()
        setUser(null)
    }

    useEffect(() => {
        getUserProfile()
    }, [global.reloadProfile])

    return (
        <Flex
            width="100%"
            height="60px"
            borderBottom="1px solid #A5A5A5"
            px="15px"
            justify={variant !== "auth" ? "space-between" : "center"}
            gridGap={variant !== "auth" ? "0" : "50px"}
        >

            <Flex>
                <Image src="/logo.svg" alt="logo" width={85} height={29} priority />
            </Flex>

            {!user &&
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

            {user &&
                <Flex
                    align="center"
                    gridGap="25px"
                >
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
                        DEPOSITAR
                    </Button>

                    <Flex
                        borderRadius="5px"
                        color="#fff"
                        height="40px"
                        align="center"
                        px="12px"
                        border="1px solid rgba(255,255,255,0.5)"
                    >
                        <Text>R$ {user.currency}</Text>
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
                            <MenuItem>
                                Olá, {user.firstName}
                            </MenuItem>
                            <MenuItem icon={<FaUser />}>
                                Perfil
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