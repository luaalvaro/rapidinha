import { NextPage } from 'next'
import { Button, Flex, FormControl, FormLabel, Input, Text, useToast } from '@chakra-ui/react'
import Header from '../containers/Header'
import Rapidinhas from '../containers/Rapidinhas'
import Container from '../components/Container'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { supabase } from '../utils/supabaseClient'

const Login: NextPage = () => {

    const toast = useToast()
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        try {
            setLoading(true)
            if (!email || !password)
                throw "Email ou senha não pode ser vazio"

            const { user, error } = await supabase
                .auth
                .signIn({
                    email: email,
                    password: password,
                })

            if (error?.message === "Invalid login credentials")
                return toast({
                    title: 'Email ou senha incorreto',
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                })

            return router.push('/')
        } catch (error) {
            console.error(error)
            toast({
                title: 'Algo deu errado',
                status: 'error',
                duration: 9000,
                isClosable: true,
            })
        } finally {
            setLoading(false)
        }

        // const { user, error } = await supabase
        //     .auth
        //     .signUp({
        //         email: 'luan.alc@hotmail.com',
        //         password: 'l@lC7651420',
        //     })

        // console.log(user)
    }

    return (
        <Container>
            <Flex
                width="100%"
                height="60px"
                borderBottom="1px solid #A5A5A5"
                px="15px"
                justify="center"
                gridGap="50px"
            >
                <Button
                    variant="link"
                    color="#fff"
                    fontWeight={400}
                    onClick={() => router.push('/login')}
                >
                    Entrar
                </Button>
                <Button
                    variant="link"
                    color="#fff"
                    fontWeight={400}
                    opacity={.7}
                    onClick={() => router.push('/login')}
                >
                    Cadastre-se
                </Button>
            </Flex>

            <Flex
                mt="30px"
                align="center"
                justify="center"
            >
                <Image src="/logo.svg" alt="logo" width={200} height={100} />
            </Flex>

            <Text
                mt="30px"
                textAlign="center"
                color="#fff"
                fontWeight={600}
            >
                Faça o login em sua conta
            </Text>

            <FormControl
                mt="50px"
                px="25px"
                id="email"
            >
                <FormLabel
                    color="#fff"
                >
                    Email
                </FormLabel>
                <Input
                    color="#fff"
                    background="#553D5C"
                    border="0"
                    placeholder="Email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                />
            </FormControl>

            <FormControl
                mt="15px"
                px="25px"
                id="pass"
            >
                <FormLabel
                    color="#fff"
                >
                    Senha
                </FormLabel>
                <Input
                    type="password"
                    color="#fff"
                    background="#553D5C"
                    border="0"
                    placeholder="******"
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                />
            </FormControl>

            <Flex
                mt="5px"
                px="25px"
                fontSize="14px"
                opacity={.8}
            >
                <Text
                    color="#fff"
                >
                    Precisa de ajuda?
                </Text>
            </Flex>

            <Flex
                width="100%"
                px="25px"
                mt="30px"
            >
                <Button
                    isLoading={loading}
                    width="100%"
                    color="#fff"
                    background="#25D985"

                    onClick={handleSubmit}

                    _hover={{
                        background: '#20C578'
                    }}
                >
                    Cadastre-se
                </Button>
            </Flex>
        </Container>
    )
}

export default Login