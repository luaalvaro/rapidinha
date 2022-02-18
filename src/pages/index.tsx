import { NextPage } from 'next'
import { Flex, } from '@chakra-ui/react'
import Header from '../containers/Header'
import Rapidinhas from '../containers/Rapidinhas'
import Container from '../components/Container'

const Home: NextPage = () => {
  return (
    <Container>
      <Header />
      <Rapidinhas />
    </Container>
  )
}

export default Home