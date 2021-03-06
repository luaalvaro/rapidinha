import { Flex } from '@chakra-ui/react'
import { useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useRouter } from 'next/router'
import { Session } from '@supabase/supabase-js'
import useAuth from '../store/Auth'
import useGlobal from '../store/globalStore'

export interface Profiles {
    avatarUrl: string | null
    cpf: string
    currency: 0
    firstName: string
    id: string
    telefone: string
    updatedAt: string
}

const AuthProvider: React.FC = ({ children }) => {

    const router = useRouter()
    const Auth = useAuth(state => state)

    const setSessionOrRedirect = async () => {
        console.log('Verificando status da sessão...')
        try {
            const session = supabase.auth.session()

            if (!session)
                return await supabase.auth.signOut()

            if (!Auth.userDetails) {
                const { data, error } = await supabase
                    .from<Profiles>('profiles')
                    .select('*')
                    .single()

                if (!data)
                    return router.push('/login')

                Auth.setSession(session)
                Auth.setUserDetails(data)
            }


        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        setSessionOrRedirect()

        setTimeout(setSessionOrRedirect, 3000)
    }, [])

    return (
        <Flex
            background="#2E2132"
            minHeight="100vh"
            direction="column"
        >
            {children}
        </Flex>
    )
}

export default AuthProvider