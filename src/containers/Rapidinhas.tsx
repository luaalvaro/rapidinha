import { Button, Center, Flex, Skeleton, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'
import CardRapidinha from './CardRapidinha'

export interface Rapidinha {
    award: number,
    created_at: string,
    fee: number,
    id: string,
    qtd_num: number,
    qtd_winners: number,
    result_sorted_numbers: string | string[] | null,
    status: "waiting" | "completed",
    ticket_value: number,
}

const Rapidinhas: React.FC = () => {

    const [rapidinhasData, setRapidinhasData] = useState<Rapidinha[] | null>(null)

    const fetchRapidinhas = async () => {
        try {
            const { data, error } = await supabase
                .from<Rapidinha>('rapidinhas')
                .select('*')
                .eq('status', 'waiting')

            setRapidinhasData(data)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchRapidinhas()
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
                Próximas rapidinhas
            </Text>

            <Flex
                gridGap="15px"
                direction={["column-reverse", "column-reverse", "row", "row", "row"]}
            >
                {!rapidinhasData &&
                    <Stack width="100%">
                        <Skeleton height='20px' />
                        <Skeleton height='20px' />
                        <Skeleton height='20px' />
                    </Stack>
                }

                {rapidinhasData && rapidinhasData?.map((rapidinha, index) => (
                    <CardRapidinha
                        key={index}
                        data={rapidinha}
                    />
                ))}
            </Flex>
        </Flex>
    )
}

export default Rapidinhas