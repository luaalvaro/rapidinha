import React from 'react'
import { Flex, Text } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useRouter } from 'next/router'

interface RapidinhaBet {
    chosen_number: number,
    created_at: string,
    id: string,
    rapidinha_id: number,
    ticket_value: number,
    user_id: string
}

const MinhasRapidinhas = () => {
    const [rapidinhaBets, setRapidinhaBets] = useState<RapidinhaBet[] | null>(null)
    const [maxResult, setMaxResult] = useState(5)
    const router = useRouter()

    const fetchRapidinhaBets = async () => {
        try {
            const user = supabase.auth.user()

            if (!user)
                return

            const { data: rapidinha_bets, error } = await supabase
                .from<RapidinhaBet>('rapidinha_bets')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) console.error(error)

            setRapidinhaBets(rapidinha_bets)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchRapidinhaBets()
    }, [])
    return (
        <Flex
            padding="15px 20px"
            direction="column"
        >
            <Text
                fontSize="15px"
                color="#fff"
                mb="20px"
                fontWeight={600}
            >
                Rapidinhas recentes
            </Text>

            <Flex
                direction="column"
                gridGap="10px"
            >
                {rapidinhaBets && rapidinhaBets.map((bet, index) => {

                    if ((index + 1) > maxResult)
                        return

                    return (
                        <Flex
                            key={index}
                            background="#fff"
                            borderRadius="8px"
                            padding="10px 15px"

                            onClick={() => router.push(`/rapidinha/${bet.rapidinha_id}`)}

                            cursor="pointer"
                        >
                            <Text
                                fontSize="14px"
                            >
                                Rapidinha #00{bet.rapidinha_id} - Número {bet.chosen_number} - Entrada R$ {bet.ticket_value}
                            </Text>
                        </Flex>
                    )
                })}

                {rapidinhaBets && rapidinhaBets.length > maxResult && (
                    <Text
                        color="#fff"
                        textAlign="center"
                        my="15px"
                        cursor="pointer"

                        onClick={() => setMaxResult(maxResult + 5)}
                    >
                        Mostrar mais
                    </Text>
                )}
            </Flex>
        </Flex>
    )
}

export default MinhasRapidinhas