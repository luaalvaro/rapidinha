import { Grid } from '@chakra-ui/react'

const MineButton: React.FC = ({ children }) => {
    return (
        <Grid
            templateColumns='repeat(5, 1fr)'
            templateRows='repeat(5, 1fr)'

            width="100%"
            background="#1D1520"

            maxWidth={768}
            maxHeight={768}

            padding="12px"
            gridGap="12px"

            style={{
                aspectRatio: "1/1"
            }}
        >
            {children}
        </Grid>
    )
}

export default MineButton