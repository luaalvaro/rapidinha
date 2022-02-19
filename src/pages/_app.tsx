import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import Head from 'next/head'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Head>
        <title>Rapidinha.bet - Faz uma rapidinha</title>
      </Head>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default MyApp
