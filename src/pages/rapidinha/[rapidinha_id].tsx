import { NextPage } from 'next'
import { Flex, } from '@chakra-ui/react'
import Header from '../../containers/Header'
import Container from '../../components/Container'
import RapidinhasById from '../../containers/RapidinhaById'

const Home: NextPage = () => {
  return (
    <Container>
      <Header />
      <RapidinhasById />
    </Container>
  )
}

export default Home