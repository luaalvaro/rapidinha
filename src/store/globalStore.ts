import create from 'zustand'

interface UseGlobal {
    reloadProfile: boolean,
    toggleReloadProfile: () => void,
}
const useGlobal = create<UseGlobal>(set => ({
    reloadProfile: false,
    toggleReloadProfile: () => set(state => ({ reloadProfile: !state.reloadProfile }))
}))

export default useGlobal