import { Flex, Input, FormControl, FormLabel, InputGroup, InputRightElement, Button, Select } from '@chakra-ui/react'

const MineController = () => {
    return (
        <Flex
            mt="20px"
            background="#1D1520"
            color="#fff"
            justify="space-between"
            padding="10px"
            direction="column"
        >
            <Flex
                width="100%"
                justify="space-between"
                direction={["column", "column", "row", "row"]}
                gridGap={["25px", "25px", "0", "0"]}

            >
                <InputGroup maxWidth="200px">
                    <Input
                        background="#2B1F30"
                        maxWidth="200px"
                        placeholder='Quantia'
                    />
                    <InputRightElement>R$</InputRightElement>
                </InputGroup>

                <Flex
                    gridGap={["25px", "25px", "0", "0"]}
                >
                    <Button
                        background="#20C57830"

                        _hover={{
                            background: "#20C57850"
                        }}
                    >
                        1/2
                    </Button>
                    <Button
                        background="#20C57830"

                        _hover={{
                            background: "#20C57850"
                        }}
                    >
                        2x
                    </Button>
                </Flex>


                <Button
                    background="#20C578"
                >
                    Começar o jogo
                </Button>
            </Flex>

            <Flex
                mt="20px"
            >
                <FormControl>
                    <FormLabel>Número de minas</FormLabel>
                    <Select>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5</option>
                        <option>6</option>
                    </Select>
                </FormControl>
            </Flex>
        </Flex>
    )
}

export default MineController