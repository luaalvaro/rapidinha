import { Button, Center, Flex, Skeleton, Stack, Text } from '@chakra-ui/react'
import { useRouter } from 'next/router'
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
    result_sorted_numbers: number | null,
    status: "waiting" | "completed",
    ticket_value: number,
    winner_id: string | null,
    sortedAt: string | null,
}

const RapidinhasById: React.FC = () => {

    const [rapidinhasData, setRapidinhasData] = useState<Rapidinha[] | null>(null)
    const router = useRouter()

    const fetchRapidinhas = async () => {
        try {
            const { rapidinha_id } = router.query

            if (!rapidinha_id || typeof rapidinha_id !== "string")
                return console.log('Rapidinha id nao encontrado')

            const { data, error } = await supabase
                .from<Rapidinha>('rapidinhas')
                .select('*')
                .eq('id', rapidinha_id)

            setRapidinhasData(data)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchRapidinhas()
    }, [router.query])

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
                Informações da rapidinha
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

export default RapidinhasById