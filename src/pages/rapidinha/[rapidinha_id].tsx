import { NextPage } from 'next'
import { Flex, } from '@chakra-ui/react'
import Header from '../../containers/Header'
import RapidinhasById from '../../containers/RapidinhaById'
import AuthProvider from '../../components/AuthProvider'

const Home: NextPage = () => {
  return (
    <AuthProvider>
      <Header />
      <RapidinhasById />
    </AuthProvider>
  )
}

export default Home