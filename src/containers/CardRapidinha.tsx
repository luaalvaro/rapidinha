import { Flex, Text, Center, Button, Grid, Stack, Skeleton, toast, useToast, } from '@chakra-ui/react'
import { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Z_BEST_SPEED } from 'zlib'
import useGlobal from '../store/globalStore'
import { supabase } from '../utils/supabaseClient'
import { Rapidinha } from './Rapidinhas'

interface CardRapidinhaProps {
    data: Rapidinha
}

interface PurchasedNumbersProps {
    chosen_number: number
    created_at: string
    id: string
    rapidinha_id: number
    ticket_value: number
    user_id: string
}

const CardRapidinha: React.FC<CardRapidinhaProps> = ({ data }) => {

    const [purchasedNumbers, setPurchasedNumbers] = useState<PurchasedNumbersProps[] | null>(null)
    const [chosenNumber, setChosenNumber] = useState<string | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)

    const toast = useToast()
    const global = useGlobal(state => state)

    const numbers = [
        '1', '2', '3', '4', '5',
        '6', '7', '8', '9', '10',
        '11', '12', '13', '14', '15'
    ]

    const preSelectNumber = (num: string) => {
        const isSelected = checkNumberPurchased(num)

        if (isSelected) return

        if (chosenNumber === num) {
            setChosenNumber(null)
        } else {
            setChosenNumber(num)
        }
    }

    const checkNumberPurchased = (num: string) => {
        const response = purchasedNumbers
            ?.filter(selectedNum => selectedNum.chosen_number === Number(num))

        if (response?.length === 0)
            return false

        return true
    }

    const checkNumberPurchasedIsMine = (num: string) => {
        const response = purchasedNumbers
            ?.filter(selectedNum => selectedNum.chosen_number === Number(num))

        const userBet = response && response[0].user_id || ""
        const userId = user && user.id || ""

        if (userId === userBet)
            return true

        return false
    }

    const getPurchasedNumbers = async () => {
        try {
            const { data: bets, error } = await supabase
                .from<PurchasedNumbersProps>('rapidinha_bets')
                .select('*')
                .eq('rapidinha_id', data.id)

            setPurchasedNumbers(bets)
        } catch (error) {
            console.error(error)
        }
    }

    const checkIsLogged = () => {
        const response = supabase.auth.user()
        setUser(response)
    }

    const handlePurchaseTicket = async (id_rap: number) => {

        /**
         * Essa função precisa identificar o usuário (id)
         * e a INTENÇÃO DE COMPRA (Número disponível da rapidinha)
         * e uma serverless function vai ser chamada
         * para lidar com o processo de compra da rapidinha
         */

        const session = supabase.auth.session()

        if (!session)
            return toast({
                title: 'Faça login para participar',
                status: 'error',
                duration: 5000
            })

        if (!chosenNumber)
            return toast({
                title: 'Escolha um número para participar',
                status: 'error',
                duration: 5000
            })


        try {
            setLoading(true)
            const response = await fetch('/api/v1/buyticket', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-type': 'Application/json'
                },
                body: JSON.stringify({
                    id_rapidinha: id_rap,
                    chosen_number: chosenNumber
                })
            })

            const data = await response.json()

            console.log(response.status)

            if (response.status === 200) {
                toast({
                    title: 'Participação confirmada',
                    status: 'success',
                    duration: 5000
                })

                global.toggleReloadProfile()

                if (purchasedNumbers) {
                    setPurchasedNumbers([...purchasedNumbers, ...data.newBet])
                }
            }

            if (response.status !== 200) {
                console.log(data.message)
                toast({
                    title: data.message,
                    status: 'error',
                    duration: 5000
                })
            }

        } catch (error) {
            console.error(error)
        } finally {
            setChosenNumber(null)
            setLoading(false)
        }
    }

    useEffect(() => {
        getPurchasedNumbers()
    }, [])

    useEffect(() => {
        checkIsLogged()
    }, [chosenNumber])

    return (
        <Flex
            background="#E0E0E0"
            borderRadius="5px"
            padding="10px 15px"
            direction="column"
        >

            {!purchasedNumbers &&
                <Stack width="100%">
                    <Skeleton height='20px' />
                    <Skeleton height='20px' />
                    <Skeleton height='20px' />
                </Stack>
            }

            {purchasedNumbers &&
                <>
                    <Flex
                        justify="space-between"
                    >
                        <Text
                            fontSize="14px"
                            fontWeight={600}
                        >
                            Rapidinha #00{data.id}
                        </Text>
                        <Text
                            fontSize="14px"
                        >
                            {purchasedNumbers.length}/{data.qtd_num}
                        </Text>
                    </Flex>

                    <Flex
                        justify="space-between"
                    >
                        <Text fontSize="14px">Valor R$ {data.ticket_value}</Text>
                        <Text fontSize="14px">Prêmio R$ {data.award}</Text>
                    </Flex>

                    <Flex
                        minHeight="140px"
                        flex="1"
                        align="center"
                        justify="center"
                        direction="column"
                        gridGap="10px"
                    >
                        <Grid
                            gridTemplateColumns="repeat(5, 1fr)"
                            gridGap="10px"
                        >
                            {numbers.map((num, index) => (
                                <Center
                                    key={index}
                                    width="30px"
                                    height="30px"

                                    bg={
                                        checkNumberPurchased(num)
                                            ? checkNumberPurchasedIsMine(num)
                                                ? "#25D985" : "#25D98550"
                                            : chosenNumber === num
                                                ? "#44AFEC"
                                                : "#C4C4C4"
                                    }

                                    color={
                                        checkNumberPurchased(num)
                                            ? "#000"
                                            : chosenNumber === num
                                                ? "#FFF"
                                                : "#000"
                                    }

                                    borderRadius="100%"
                                    fontWeight={500}
                                    boxShadow="inset 3px 5px 10px rgba(0,0,0,0.5)"

                                    cursor="pointer"

                                    onClick={() => preSelectNumber(num)}

                                    _hover={{
                                        background: checkNumberPurchased(num) ? '' : '#44AFEC',
                                        color: checkNumberPurchased(num) ? '' : "#fff"
                                    }}
                                >
                                    {num}
                                </Center>
                            ))}
                        </Grid>
                    </Flex>

                    <Flex>
                        {user &&
                            <Button
                                width="100%"
                                bg={!chosenNumber ? '' : "#25D985"}
                                variant={!chosenNumber ? 'link' : 'solid'}
                                isLoading={loading}

                                onClick={!chosenNumber ? () => { } : () => handlePurchaseTicket(Number(data.id))}

                                _hover={{
                                    background: !chosenNumber ? '' : '#20C578'
                                }}

                                _active={{
                                    background: !chosenNumber ? '' : '#20C578'
                                }}

                                transition="all .5s ease-in-out"
                            >
                                {!chosenNumber ? 'Faça uma rapidinha, escolha um número' : !user ? 'Faça login para participar' : 'Participar'}
                            </Button>
                        }
                    </Flex>
                </>
            }
        </Flex >
    )
}

export default CardRapidinha