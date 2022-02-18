import { Button, Center, Flex, Text } from '@chakra-ui/react'
import CardRapidinha from './CardRapidinha'

const Rapidinhas: React.FC = () => {
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
                Rapidinhas agora
            </Text>

            <CardRapidinha />
        </Flex>
    )
}

export default Rapidinhas