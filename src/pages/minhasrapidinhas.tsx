import { NextPage } from 'next'
import Header from '../containers/Header'
import MinhasRapidinhas from '../containers/MinhasRapidinhas'
import AuthProvider from '../components/AuthProvider'

const Home: NextPage = () => {

  return (
    <AuthProvider>
      <Header />
      <MinhasRapidinhas />
    </AuthProvider>
  )
}

export default Home