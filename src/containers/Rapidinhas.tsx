import { Box, Button, Center, Flex, Skeleton, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import useAuth from '../store/Auth'
import { supabase } from '../utils/supabaseClient'
import CardRapidinha from './CardRapidinha'
import { Rapidinha } from './RapidinhaById'

const Rapidinhas: React.FC = () => {

    const Auth = useAuth(state => state)
    const [rapidinhasData, setRapidinhasData] = useState<Rapidinha[] | null>(null)

    const fetchRapidinhas = async () => {
        try {
            const { data, error } = await supabase
                .from<Rapidinha>('rapidinhas')
                .select('*')
                .eq('status', 'waiting')

            setRapidinhasData(data)
        } catch (error) {
            console.log('Error fetching rapidinhas: ', error)
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
                fontSize="17px"
                color="#fff"
                mb="20px"
                fontWeight={600}
            >
                Próximas rapidinhas
            </Text>

            <Flex
                maxWidth="500px"
                mb="20px"
                height="40px"
                align="center"
                justify={Auth.session ? "space-between" : "space-around"}
                flexWrap="wrap"
            >
                <Center
                    gridGap="5px"
                >
                    <Box w={5} h={5} bg="#FFF" />
                    <Text color="#FFF" fontSize={["14px", "16px", "16px", "16px"]}>Disponível</Text>
                </Center>
                <Center
                    gridGap="10px"
                >
                    <Box w={5} h={5} bg="Orange" />
                    <Text color="#FFF" fontSize={["14px", "16px", "16px", "16px"]}>Indisponível</Text>
                </Center>
                {Auth.session &&
                    <Center
                        gridGap="10px"
                    >
                        <Box w={5} h={5} bg="#25D985" />
                        <Text color="#FFF" fontSize={["14px", "16px", "16px", "16px"]}>Seu número</Text>
                    </Center>
                }
            </Flex>

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