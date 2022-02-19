import { NextApiHandler } from "next"
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'

interface RapidinhaProps {
    id: number,
    created_at: string,
    qtd_num: number,
    result_sorted_numbers: null,
    qtd_winners: number,
    fee: number,
    ticket_value: number,
    award: number,
    status: 'waiting' | 'completed'
}

interface Bets {
    chosen_number: number,
    id: string,
    user_id: string,
}
const handler: NextApiHandler = async (req, res) => {

    const supabaseUrl = 'https://rvdmmpwydcbhgnenqyds.supabase.co'
    const supabaseKey = process.env.MASTER_SUPABASE_KEY || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const checkTokenIsValid = (token: string) => {
        const JWT_SINGNATURE = process.env.JWT_SIGNATURE

        if (!JWT_SINGNATURE)
            return res.status(400).json({ message: '30 JWT Broken' })

        try {
            var decoded = jwt.verify(token, JWT_SINGNATURE);

            if (typeof decoded === 'string')
                return res.status(401).json({ message: '36 Unauthorized' })

            return decoded
        } catch (error) {
            console.log('Invalid signature')
            return res.status(401).json({ message: '41 Unauthorized' })
        }
    }

    const getUserCurrency = async (id: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('currency')
                .eq('id', id)
                .single()

            const { currency } = data;

            return currency
        } catch (error) {
            console.log(error)
        }
    }

    const getAllBets = async (id_rapidinha: string) => {
        try {
            const { data, error } = await supabase
                .from('rapidinha_bets')
                .select('*')
                .eq('rapidinha_id', id_rapidinha)

            return data
        } catch (error) {
            console.log(error)
        }
    }

    const getRapidinha = async (id: number) => {
        try {
            const { data, error } = await supabase
                .from('rapidinhas')
                .select('*')
                .eq('id', id)
                .single()

            return data
        } catch (error) {
            console.log(error)
        }
    }

    const checkNumberAvaliable = (number: number, bets: Bets[]) => {

        if (bets.length === 0)
            return true

        const filtered = bets.filter(bet => bet.chosen_number === number)
        if (filtered.length === 0)
            return true

        return false
    }

    const checkIfUserHasTicket = (bets: Bets[], user_id: string) => {

        const filteredId = bets.filter(bet => bet.user_id === user_id)
        if (filteredId.length !== 0)
            return true

        return false
    }

    const handleNewPurchaseTicket = async (
        rapidinha_id: number,
        user_id: string,
        chosen_number: number,
        ticket_value: number,
        userCurrency: number
    ) => {

        let newBet = null;
        let newProfile = null;
        try {
            const { data, error } = await supabase
                .from('rapidinha_bets')
                .insert({
                    rapidinha_id,
                    user_id,
                    chosen_number,
                    ticket_value
                })

            newBet = data
        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: '124 Error at new rapidinha' })
        }

        try {
            const newCurrency = userCurrency - ticket_value
            console.log(newCurrency)

            const { data, error } = await supabase
                .from('profiles')
                .update({
                    currency: newCurrency
                })
                .eq('id', user_id)

            newProfile = data
        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: '141 Error at new rapidinha' })
        }

        console.log('Aposta feita com sucesso')
        return {
            newBet,
            newProfile
        }
    }

    const token = req.headers.authorization?.split('Bearer ')[1]

    if (!token)
        return res.status(401).json({ message: '164 - Não autorizado' })

    const user = checkTokenIsValid(token)

    const { id_rapidinha, chosen_number } = req.body;

    if (!id_rapidinha || !chosen_number)
        return res.status(400).json({ message: '171 - Requisição bloqueada' })

    const user_id = user?.sub || ""
    const userCurrency = await getUserCurrency(user_id)
    const rapidinha = await getRapidinha(id_rapidinha)
    const ticket_value = rapidinha.ticket_value || 0

    if (chosen_number < 1 || chosen_number > rapidinha.qtd_num)
        return res.status(400).json({ message: '179 - Número inválido' })

    if (userCurrency < rapidinha.ticket_value)
        return res.status(400).json({ message: '182 - Saldo insuficiente' })

    const bets = await getAllBets(rapidinha.id)
    const isAvaliable = checkNumberAvaliable(chosen_number, bets || [])

    if (!isAvaliable)
        return res.status(400).json({ message: '188 - Número já selecionado por outro usuário' })

    const hasTicket = checkIfUserHasTicket(bets || [], user_id)

    if (hasTicket)
        return res.status(400).json({ message: '193 - Permitido apenas 01 ticket por usuário' })

    // Usuário tem dinheiro pra apostar
    // Número está válido
    // Token é válido

    // Próximos passos

    // Criar uma TRANSAÇÃO DE COMPRA (rapidinha_bets)
    // e remover o valor referente da conta do usuário

    const newPurchase = await handleNewPurchaseTicket(
        id_rapidinha,
        user_id,
        chosen_number,
        ticket_value,
        userCurrency,
    )

    res.status(200).json(newPurchase)
}

export default handler