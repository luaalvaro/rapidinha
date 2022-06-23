import { Flex } from '@chakra-ui/react'

const MineButton: React.FC = ({ children }) => {
    return (
        <Flex
            width="100%"
            background="#2B1F30"

            maxWidth={768}
            maxHeight={768}

            padding={4}

            borderRadius="4px"

            _hover={{
                background: "#3E2C44"
            }}

            cursor="pointer"
        >

        </Flex>
    )
}

export default MineButton