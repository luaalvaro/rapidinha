import { Flex, Text, Center, Button, Grid, Stack, Skeleton, useToast, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogCloseButton, AlertDialogBody, AlertDialogFooter, useDisclosure, Spinner, } from '@chakra-ui/react'
import { useEffect, useState, useRef } from 'react'
import useAuth from '../store/Auth'
import useGlobal from '../store/globalStore'
import { supabase } from '../utils/supabaseClient'
import { Rapidinha } from './RapidinhaById'

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

interface PaymentOrder {
    award: number,
    created_at: string,
    fee: number,
    id: string,
    rapidinha_id: number,
    result_sorted_numbers: number,
    total_money: number,
    user_recived: boolean
    winner_id: string,
}

const CardRapidinha: React.FC<CardRapidinhaProps> = ({ data }) => {

    const [purchasedNumbers, setPurchasedNumbers] = useState<PurchasedNumbersProps[] | null>(null)
    const [chosenNumber, setChosenNumber] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [modalAlertShowing, setModalAlertShowing] = useState(false)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const { isOpen: sortModalIsOpen, onOpen: sortModalOpen, onClose: sortModalClose } = useDisclosure()
    const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null)
    const [sortedNumberResult, setSortedNumberResult] = useState<number | null>(null)
    const [lastBuyerIsWinner, setLastBuyerIsWinner] = useState<boolean | null>(null)

    const toast = useToast()
    const global = useGlobal(state => state)
    const Auth = useAuth(state => state)

    const numbers = [
        '1', '2', '3', '4', '5',
        '6', '7', '8', '9', '10',
        '11', '12', '13', '14', '15'
    ]

    const preSelectNumber = (num: string) => {

        if (!Auth.session) return

        const isSelected = checkNumberPurchased(num)
        if (isSelected) return

        if (chosenNumber === num) {
            setChosenNumber(null)
        } else {
            setChosenNumber(num)
        }
    }

    const awardRecivedUpdateOrder = () => {
        if (paymentOrder) {
            setPaymentOrder({ ...paymentOrder, user_recived: true })
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
        const userId = Auth.session ? Auth?.session?.user?.id : ""

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

            if (response.status === 200) {
                toast({
                    title: 'Participação confirmada',
                    status: 'success',
                    duration: 5000
                })

                Auth.setUserDetails(data.newProfile)

                if (purchasedNumbers) {
                    setPurchasedNumbers([...purchasedNumbers, data.newBet])
                }

                if (data && data.sortedNumber) {
                    //Número sorteado
                    setSortedNumberResult(data.sortedNumber)
                    setLastBuyerIsWinner(data.lastBuyerIsWinner)
                    sortModalOpen()
                    return
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

    const defineBackground = (num: string) => {
        return data.result_sorted_numbers === Number(num) ? "gold" :
            checkNumberPurchased(num)
                ? checkNumberPurchasedIsMine(num)
                    ? "#25D985" : "#FFA500"
                : chosenNumber === num
                    ? "#44AFEC"
                    : "#FFF"
    }

    const checkIfUserIsWinner = () => {
        const userId = Auth.session ? Auth?.session?.user?.id : 0

        if (userId === 0)
            return false

        return data.winner_id === userId
    }

    const handleGetMyAward = async (id_rapidinha: string) => {

        const session = supabase.auth.session()

        if (!session)
            return toast({
                title: 'Faça login para participar',
                status: 'error',
                duration: 5000
            })

        try {
            setLoading(true)
            const response = await fetch('/api/v1/getpayment', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-type': 'Application/json'
                },
                body: JSON.stringify({
                    rapidinha_id: id_rapidinha,
                })
            })

            const data = await response.json()

            if (response.status === 200) {
                //Deu certo, usuário recebeu o valor
                global.toggleReloadProfile()
                awardRecivedUpdateOrder()
                toast({
                    title: `Foi creditado ${data.award} na sua conta!`,
                    status: 'success',
                    duration: 9000
                })
            }

            if (response.status !== 200) {
                //Deu certo, usuário recebeu o valor
                global.toggleReloadProfile()

                toast({
                    title: `Algo deu errado`,
                    status: 'error',
                    duration: 9000
                })
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getPurchasedNumbers()
    }, [])

    const getPaymentOrder = async (rapidinha_id: string) => {
        try {
            const { data, error } = await supabase
                .from<PaymentOrder>('rapidinha_payments')
                .select(`*`)
                .eq('rapidinha_id', rapidinha_id)
                .single()

            if (error) console.error(error)

            setPaymentOrder(data)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (!paymentOrder && data.status === 'completed' && Auth.session)
            getPaymentOrder(data.id)
    }, [purchasedNumbers])

    return (
        <Flex
            background="#E0E0E0"
            borderRadius="5px"
            padding="10px 15px"
            direction="column"
        >

            {!purchasedNumbers &&
                <Stack
                    width={["100%", "100%", "190px", "190px", "190px"]}
                >
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
                            fontSize="15px"
                            fontWeight={600}
                        >
                            Rapidinha #00{data.id}
                        </Text>
                        <Text
                            fontSize="15px"
                        >
                            {purchasedNumbers.length}/{data.qtd_num}
                        </Text>
                    </Flex>

                    <Flex
                        justify="space-between"
                    >
                        <Text fontSize="15px">Valor R$ {data.ticket_value}</Text>
                        <Text fontSize="15px">Prêmio R$ {data.award}</Text>
                    </Flex>

                    <Flex
                        my="10px"
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

                                    bg={defineBackground(num)}

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
                                        background: checkNumberPurchased(num) ? '' : Auth.session ? '#44AFEC' : '',
                                        color: checkNumberPurchased(num) ? '' : Auth.session ? '#fff' : '',
                                    }}
                                >
                                    {num}
                                </Center>
                            ))}
                        </Grid>
                    </Flex>

                    <Flex>
                        {Auth.session && data.status === 'waiting' &&
                            <Button
                                width="100%"
                                bg={!chosenNumber ? '' : "#25D985"}
                                variant={!chosenNumber ? 'link' : 'solid'}
                                isLoading={loading}

                                onClick={!chosenNumber ? () => { } : onOpen}

                                _hover={{
                                    background: !chosenNumber ? '' : '#20C578'
                                }}

                                _active={{
                                    background: !chosenNumber ? '' : '#20C578'
                                }}
                            >
                                {!chosenNumber
                                    ? 'Escolha um número e participe'
                                    : !Auth.session
                                        ? 'Faça login para participar'
                                        : `Participar - R$ ${data.ticket_value}`}
                            </Button>
                        }

                        {paymentOrder &&
                            <>
                                {paymentOrder.user_recived
                                    ? checkIfUserIsWinner()
                                        ? "Você já recebeu este prêmio"
                                        : "O ganhador já recebeu este prêmio"
                                    : checkIfUserIsWinner()
                                        ? <Button
                                            bg="#25D985"
                                            mx="auto"

                                            isLoading={loading}
                                            onClick={() => handleGetMyAward(data.id)}

                                            _hover={{
                                                background: '#20C578'
                                            }}

                                            _active={{
                                                background: '#20C578'
                                            }}
                                        >
                                            Clique aqui para resgatar seu prêmio
                                        </Button>
                                        : "O ganhador ainda não resgatou este prêmio"
                                }
                            </>
                        }
                    </Flex>
                </>
            }
            <AlertConfirm
                isOpen={isOpen}
                onOpen={onOpen}
                onClose={onClose}
                callback={() => handlePurchaseTicket(Number(data.id))}
                rpdId={data.id}
                rpdValue={data.ticket_value}
                chosenNumber={chosenNumber}
            />

            <SortModal
                sortModalIsOpen={sortModalIsOpen}
                sortModalOpen={sortModalOpen}
                sortModalClose={sortModalClose}
                rapidinhaId={data.id}
                sortedNumber={sortedNumberResult}
                award={data.award}
                lastBuyerIsWinner={lastBuyerIsWinner}
            />
        </Flex>
    )
}

export default CardRapidinha

interface AlertConfirmProps {
    isOpen: boolean,
    onOpen: () => void,
    onClose: () => void,
    callback: () => void,
    rpdId: string,
    rpdValue: number,
    chosenNumber: string | null,
}

const AlertConfirm: React.FC<AlertConfirmProps> = ({
    isOpen,
    onOpen,
    onClose,
    callback,
    rpdId,
    rpdValue,
    chosenNumber
}) => {

    return (
        <AlertDialog
            motionPreset='slideInBottom'
            leastDestructiveRef={undefined}
            onClose={onClose}
            isOpen={isOpen}
        >
            <AlertDialogOverlay />

            <AlertDialogContent
                mx="15px"
            >
                <AlertDialogHeader>Confirmar rapidinha</AlertDialogHeader>
                <AlertDialogCloseButton onClick={onClose} />
                <AlertDialogBody>
                    Voce deseja participar da rapidinha #00{rpdId}? O número <b>{chosenNumber}</b> custa <b>R$ {rpdValue}</b>.
                </AlertDialogBody>
                <AlertDialogFooter>
                    <Button colorScheme='red' onClick={onClose}>
                        Não
                    </Button>
                    <Button ml={3} onClick={() => {
                        callback()
                        onClose()
                    }}>
                        Confirmar
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

interface ISortModal {
    sortModalIsOpen: boolean,
    sortModalOpen: () => void,
    sortModalClose: () => void,
    rapidinhaId: string,
    sortedNumber: number | null,
    award: number,
    lastBuyerIsWinner: boolean | null,
}

const SortModal: React.FC<ISortModal> = ({
    sortModalIsOpen,
    sortModalOpen,
    sortModalClose,
    rapidinhaId,
    sortedNumber,
    award,
    lastBuyerIsWinner,
}) => {
    const [sorting, setSorting] = useState(true)

    useEffect(() => {
        if (sortModalIsOpen) {
            setTimeout(() => {
                setSorting(false)
            }, 5000)
        }
    }, [sortModalIsOpen])
    return (
        <AlertDialog
            isOpen={sortModalIsOpen}
            onClose={sortModalClose}
            leastDestructiveRef={undefined}
        >
            <AlertDialogOverlay>
                <AlertDialogContent
                    mx="15px"
                >
                    <AlertDialogHeader
                        fontSize='lg'
                        fontWeight='bold'
                        textAlign="center"
                    >
                        Sorteio da rapidinha #00{rapidinhaId}
                    </AlertDialogHeader>

                    <AlertDialogBody>

                        {sorting &&
                            <Center
                                flexDirection="column"
                                gridGap="20px"
                            >
                                <Spinner size="xl" />
                                <Text fontWeight={600}>Sorteando número...</Text>
                            </Center>
                        }

                        {!sorting &&
                            <Center
                                flexDirection="column"
                            >
                                <Text fontWeight={600}>Número sorteado: {sortedNumber}</Text>
                                <Text fontWeight={600}>Prêmio: R$ {award}</Text>

                                <br />

                                {lastBuyerIsWinner &&
                                    <>
                                        <Text
                                            color="green"
                                            fontWeight={600}
                                        >
                                            VOCÊ FOI O SORTEADO!
                                        </Text>
                                        <Text
                                            fontWeight={600}
                                            fontSize={13}
                                        >
                                            E o prêmio já foi pago!
                                        </Text>
                                    </>
                                }
                            </Center>
                        }

                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button onClick={sortModalClose}>
                            Fechar
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    )
}