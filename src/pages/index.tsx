import { NextPage } from 'next'
import { Flex, } from '@chakra-ui/react'
import Header from '../containers/Header'
import Rapidinhas from '../containers/Rapidinhas'
import AuthProvider from '../components/AuthProvider'
import MineGame from '../containers/MineGame'

const Home: NextPage = () => {
  return (
    <AuthProvider>
      <Header />
      {/* <Rapidinhas /> */}
      <MineGame />
    </AuthProvider>
  )
}

export default Home