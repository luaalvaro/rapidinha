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

    const [rapidinhaData, setRapidinhaData] = useState<Rapidinha | null>(null)
    const router = useRouter()

    const formatDatabaseDate = (date: string | null) => {
        if (!date) return

        const strDate = date.split('T')[0]
        const strHour = date.split('T')[1].split(':')
        const [year, month, day] = strDate.split('-')

        const response = `${day}/${month}/${year} ${strHour[0]}:${strHour[1]}`
        return response
    }

    const fetchRapidinha = async () => {
        try {
            const { rapidinha_id } = router.query

            if (!rapidinha_id || typeof rapidinha_id !== "string")
                return console.log('Rapidinha id nao encontrado')

            const { data, error } = await supabase
                .from<Rapidinha>('rapidinhas')
                .select('*')
                .eq('id', rapidinha_id)
                .single()

            setRapidinhaData(data)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        fetchRapidinha()
    }, [router.query])

    return (
        <Flex
            padding="15px 20px"
            direction="column"
        >
            <Text
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
                {!rapidinhaData &&
                    <Stack width="100%">
                        <Skeleton height='20px' />
                        <Skeleton height='20px' />
                        <Skeleton height='20px' />
                    </Stack>
                }

                {rapidinhaData &&
                    <Flex
                        direction="column"
                        color="rgba(255, 255, 255, 0.8)"
                    >
                        <Text>Rapidinha: <b>#00{rapidinhaData.id}</b></Text>
                        <Text>Valor do prêmio: <b>R$ {rapidinhaData.award}</b></Text>
                        <Text>Valor do ticket: <b>R$ {rapidinhaData.ticket_value}</b></Text>
                        <Text>Total de bilhetes: <b>{rapidinhaData.qtd_num}</b></Text>
                        <br />
                        <Text>Status: <b>
                            {
                                rapidinhaData.status === 'completed'
                                    ? "Pagamento efetuado"
                                    : "Aguardando"
                            }
                        </b></Text>

                        {rapidinhaData.result_sorted_numbers
                            && <Text>Número sorteado: <b>{rapidinhaData.result_sorted_numbers}</b></Text>}

                        <Text>Data de criação: <b>{formatDatabaseDate(rapidinhaData.created_at)}</b></Text>

                        {rapidinhaData.sortedAt
                            && <Text>Data de realização: <b>{formatDatabaseDate(rapidinhaData?.sortedAt)}</b></Text>}
                    </Flex>
                }
            </Flex>
        </Flex>
    )
}

export default RapidinhasById