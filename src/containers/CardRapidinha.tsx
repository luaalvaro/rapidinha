import { Flex, Text, Center, Button, Grid, Stack, Skeleton, } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
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

    const numbers = [
        '1', '2', '3', '4', '5',
        '6', '7', '8', '9', '10',
        '11', '12', '13', '14', '15'
    ]

    const preSelectNumber = (num: string) => {
        const isSelected = checkNumberPurchased(num)

        if (isSelected) return

        setChosenNumber(num)
    }

    const checkNumberPurchased = (num: string) => {
        const response = purchasedNumbers
            ?.filter(selectedNum => selectedNum.chosen_number === Number(num))

        if (response?.length === 0)
            return false

        return true
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

    useEffect(() => {
        getPurchasedNumbers()
    }, [])
    return (
        <Flex
            background="#E0E0E0"
            borderRadius="5px"
            padding="10px 15px"
            direction="column"
        >

            {!purchasedNumbers &&
                <Stack>
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
                            ??/{data.qtd_num}
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
                                            ? "#25D985"
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
                        <Button
                            width="100%"
                            bg="#25D985"
                            disabled

                            _hover={{
                                background: '#20C578'
                            }}
                            _active={{
                                background: '#20C578'
                            }}
                        >
                            Selecione um número
                        </Button>
                    </Flex>
                </>
            }
        </Flex >
    )
}

export default CardRapidinha