import { Flex, Text, Center, Button, } from '@chakra-ui/react'

const CardRapidinha = () => (
    <Flex
        background="#E0E0E0"
        borderRadius="5px"
        padding="10px 15px"
        direction="column"
    >
        <Flex
            justify="space-between"
        >
            <Text
                fontSize="14px"
                fontWeight={600}
            >
                Rapidinha #0016
            </Text>
            <Text
                fontSize="14px"
            >
                6/15
            </Text>
        </Flex>

        <Flex
            justify="space-between"
        >
            <Text fontSize="14px">Valor R$ 2</Text>
            <Text fontSize="14px">Prêmio R$ 2</Text>
        </Flex>

        <Flex
            minHeight="140px"
            flex="1"
            align="center"
            justify="center"
            direction="column"
            gridGap="10px"
        >
            <Flex gridGap="10px">
                <Center
                    width="30px"
                    height="30px"
                    bg="#C4C4C4"
                    borderRadius="100%"
                    fontWeight={500}
                    boxShadow="inset 3px 5px 10px rgba(0,0,0,0.5)"
                >
                    1
                </Center>
                <Center
                    width="30px"
                    height="30px"
                    bg="#C4C4C4"
                    borderRadius="100%"
                    fontWeight={500}
                    boxShadow="inset 3px 5px 10px rgba(0,0,0,0.5)"
                >
                    2
                </Center>
                <Center
                    width="30px"
                    height="30px"
                    bg="#C4C4C4"
                    borderRadius="100%"
                    fontWeight={500}
                    boxShadow="inset 3px 5px 10px rgba(0,0,0,0.5)"
                >
                    3
                </Center>
                <Center
                    width="30px"
                    height="30px"
                    bg="#C4C4C4"
                    borderRadius="100%"
                    fontWeight={500}
                    boxShadow="inset 3px 5px 10px rgba(0,0,0,0.5)"
                >
                    4
                </Center>
                <Center
                    width="30px"
                    height="30px"
                    bg="#C4C4C4"
                    borderRadius="100%"
                    fontWeight={500}
                    boxShadow="inset 3px 5px 10px rgba(0,0,0,0.5)"
                >
                    5
                </Center>
            </Flex>
            <Flex gridGap="10px">
                <Center
                    width="30px"
                    height="30px"
                    bg="#C4C4C4"
                    borderRadius="100%"
                    fontWeight={500}
                    boxShadow="inset 3px 5px 10px rgba(0,0,0,0.5)"
                >
                    6
                </Center>
                <Center
                    width="30px"
                    height="30px"
                    bg="#C4C4C4"
                    borderRadius="100%"
                    fontWeight={500}
                    boxShadow="inset 3px 5px 10px rgba(0,0,0,0.5)"
                >
                    7
                </Center>
                <Center
                    width="30px"
                    height="30px"
                    bg="#C4C4C4"
                    borderRadius="100%"
                    fontWeight={500}
                    boxShadow="inset 3px 5px 10px rgba(0,0,0,0.5)"
                >
                    8
                </Center>
                <Center
                    width="30px"
                    height="30px"
                    bg="#C4C4C4"
                    borderRadius="100%"
                    fontWeight={500}
                    boxShadow="inset 3px 5px 10px rgba(0,0,0,0.5)"
                >
                    9
                </Center>
                <Center
                    width="30px"
                    height="30px"
                    bg="#C4C4C4"
                    borderRadius="100%"
                    fontWeight={500}
                    boxShadow="inset 3px 5px 10px rgba(0,0,0,0.5)"
                >
                    10
                </Center>
            </Flex>
            <Flex gridGap="10px">
                <Center
                    width="30px"
                    height="30px"
                    bg="#C4C4C4"
                    borderRadius="100%"
                    fontWeight={500}
                    boxShadow="inset 3px 5px 10px rgba(0,0,0,0.5)"
                >
                    11
                </Center>
                <Center
                    width="30px"
                    height="30px"
                    bg="#C4C4C4"
                    borderRadius="100%"
                    fontWeight={500}
                    boxShadow="inset 3px 5px 10px rgba(0,0,0,0.5)"
                >
                    12
                </Center>
                <Center
                    width="30px"
                    height="30px"
                    bg="#C4C4C4"
                    borderRadius="100%"
                    fontWeight={500}
                    boxShadow="inset 3px 5px 10px rgba(0,0,0,0.5)"
                >
                    13
                </Center>
                <Center
                    width="30px"
                    height="30px"
                    bg="#C4C4C4"
                    borderRadius="100%"
                    fontWeight={500}
                    boxShadow="inset 3px 5px 10px rgba(0,0,0,0.5)"
                >
                    14
                </Center>
                <Center
                    width="30px"
                    height="30px"
                    bg="#C4C4C4"
                    borderRadius="100%"
                    fontWeight={500}
                    boxShadow="inset 3px 5px 10px rgba(0,0,0,0.5)"
                >
                    15
                </Center>
            </Flex>
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
    </Flex>
)

export default CardRapidinha