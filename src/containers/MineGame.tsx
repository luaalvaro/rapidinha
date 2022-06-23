import { Flex, Text, Grid, Box } from '@chakra-ui/react'
import MineButton from '../components/MineButton'
import MineContainer from '../components/MineContainer'
import MineController from '../components/MineController'

const buttonNumbers = [
    "1", "2", "3", "4", "5",
    "6", "7", "8", "9", "10",
    "11", "12", "13", "4", "15",
    "16", "17", "18", "19", "20",
    "21", "22", "23", "24", "25",
]

const MineGame = () => {
    return (

        <Box
            padding="20px"
        >
            <MineContainer>
                {buttonNumbers.map(number => (
                    <MineButton />
                ))}
            </MineContainer>

            <MineController />
        </Box>

    )
}

export default MineGame