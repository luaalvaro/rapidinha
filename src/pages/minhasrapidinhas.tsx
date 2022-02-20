import { NextPage } from 'next'
import Header from '../containers/Header'
import Container from '../components/Container'
import MinhasRapidinhas from '../containers/MinhasRapidinhas'

const Home: NextPage = () => {

  return (
    <Container>
      <Header />
      <MinhasRapidinhas />
    </Container>
  )
}

export default Home