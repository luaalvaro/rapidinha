import { Flex } from '@chakra-ui/react'
import { useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import { useRouter } from 'next/router'
import { Session } from '@supabase/supabase-js'
import useAuth from '../store/Auth'

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

    const setSessionOrRedirect = async (session: Session | null) => {
        if (!session)
            return

        if (!Auth.userDetails) {
            const { data, error } = await supabase
                .from<Profiles>('profiles')
                .select('*')
                .single()

            if (!data)
                return router.push('/login')

            Auth.setUserDetails(data)
        }

        Auth.setSession(session)
    }

    useEffect(() => {
        setSessionOrRedirect(supabase.auth.session())

        supabase.auth.onAuthStateChange((_event, session) => {
            setSessionOrRedirect(session)
        })
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