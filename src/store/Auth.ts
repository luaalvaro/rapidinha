import { Session } from '@supabase/supabase-js'
import create from 'zustand'
import { Profiles } from '../components/AuthProvider'

interface useAuthProps {
    session: Session | null,
    setSession: (newSession: Session) => void,
    userDetails: Profiles | null,
    setUserDetails: (newUserDetails: any) => void,
}

const useAuth = create<useAuthProps>(set => ({
    session: null,
    setSession: (newSession: Session) => set(state => ({ session: newSession })),
    userDetails: null,
    setUserDetails: (newUserDetails: Profiles) => set(state => ({ userDetails: newUserDetails })),
}))

export default useAuth