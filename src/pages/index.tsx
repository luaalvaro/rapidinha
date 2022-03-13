import { NextPage } from 'next'
import { Flex, } from '@chakra-ui/react'
import Header from '../containers/Header'
import Rapidinhas from '../containers/Rapidinhas'
import AuthProvider from '../components/AuthProvider'

const Home: NextPage = () => {
  return (
    <AuthProvider>
      <Header />
      <Rapidinhas />
    </AuthProvider>
  )
}

export default Home