import { NextApiHandler } from "next"
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'
import { now } from "lodash"

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
            console.log('36 Verificando token')
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
            console.log('51 Pegando saldo do usuário')

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
            console.log('69 Buscando todas as apostas')
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
            console.log('83 Buscando rapidinha a ser apostada')

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
        console.log('98 Checando se número é válido')

        if (bets.length === 0)
            return true

        const filtered = bets.filter(bet => bet.chosen_number === number)
        if (filtered.length === 0)
            return true

        return false
    }

    const checkIfUserHasTicket = (bets: Bets[], user_id: string) => {
        console.log('Checando se o usuário já comprou nesta rapidinha')

        const filteredId = bets.filter(bet => bet.user_id === user_id)
        if (filteredId.length > 1)
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
        console.log('Iniciando compra do ticket')

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

    function getRandom(max: number) {
        console.log('172 Gerando número aleatório')
        return Math.floor(Math.random() * max + 1)
    }

    const getWinner = (bets: Bets[], sortedNumber: number) => {
        console.log('177 Filtrando vencedor')
        const winner = bets.filter(bet => bet.chosen_number === sortedNumber)
        return winner
    }

    const setRapidinhaCompleted = async (id_rapidinha: string, sortedNumber: number, winner_id: string, sortedAt: Date) => {
        console.log('183 Alterando status da rapidinha')

        try {
            const { data, error } = await supabase
                .from('rapidinhas')
                .update({
                    status: 'completed',
                    result_sorted_numbers: sortedNumber,
                    winner_id: winner_id,
                    sortedAt: sortedAt
                })
                .eq('id', id_rapidinha)
                .single()

            if (error) console.log(error)

            console.log(data)
        } catch (error) {
            console.log(error)
        }
    }

    const getSortedAndCreatePaymentOrder = async (rapidinha: any) => {
        try {
            console.log('207 criando ordem de pagamento')
            const sortedNumber = getRandom(15)
            const winner = getWinner(bets || [], sortedNumber)
            const winner_id = winner[0].user_id
            const sortedAt = new Date(Date.now())

            console.log('Número sorteado', sortedNumber)
            console.log('Winner id', winner_id)
            console.log('Hora do sorteio', sortedAt)

            const rapidinhaTotalMoney = rapidinha.qtd_num * rapidinha.ticket_value
            const rapidinhaFeeMoney = rapidinhaTotalMoney * (rapidinha.fee / 100)
            const rapidinhaAward = rapidinhaTotalMoney - rapidinhaFeeMoney
            console.log('Resultado financeiro', rapidinhaTotalMoney, rapidinhaFeeMoney, rapidinhaAward)

            const { data, error } = await supabase
                .from('rapidinha_payments')
                .insert({
                    rapidinha_id: rapidinha.id,
                    result_sorted_numbers: sortedNumber,
                    winner_id: winner_id,
                    total_money: rapidinhaTotalMoney,
                    fee: rapidinhaFeeMoney,
                    award: rapidinhaAward
                })
                .single()

            if (error) console.log(error)

            setRapidinhaCompleted(rapidinha.id, sortedNumber, winner_id, sortedAt)
        } catch (error) {
            console.log(error)
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

    if (rapidinha.status === 'completed')
        return res.status(400).json({ message: '180 - Rapidinha finalizada' })

    if (chosen_number < 1 || chosen_number > rapidinha.qtd_num)
        return res.status(400).json({ message: '179 - Número inválido' })

    if (userCurrency < rapidinha.ticket_value)
        return res.status(400).json({ message: '182 - Saldo insuficiente' })

    const bets = await getAllBets(rapidinha.id)
    const isAvaliable = checkNumberAvaliable(chosen_number, bets || [])

    const qtdTicketsAcctually = bets && bets.length || 987987
    if (qtdTicketsAcctually === rapidinha.qtd_num)
        return res.status(400).json({ message: '192 - Esta rapidinha já atingiu o número máximo de apostas' })

    if (!isAvaliable)
        return res.status(400).json({ message: '195 - Número já selecionado por outro usuário' })

    const hasTicket = checkIfUserHasTicket(bets || [], user_id)
    if (hasTicket)
        return res.status(400).json({ message: '193 - Permitido apenas 02 ticket por usuário' })

    const newPurchase = await handleNewPurchaseTicket(
        id_rapidinha,
        user_id,
        chosen_number,
        ticket_value,
        userCurrency,
    )

    if (qtdTicketsAcctually + 1 === rapidinha.qtd_num) {
        getSortedAndCreatePaymentOrder(rapidinha)
    }

    res.status(200).json(newPurchase)
}

export default handler