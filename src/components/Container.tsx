import { Flex } from '@chakra-ui/react'

const Container: React.FC = ({ children }) => {
    return (
        <Flex
            background="#2E2132"
            minHeight="100vh"
            direction="column"
        >
            {children}
        </Flex>
    )
}

export default Container