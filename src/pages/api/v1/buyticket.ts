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

    console.log('---------------------------------------')
    const supabaseUrl = process.env.NEXT_PUBLIC_API_URL || ''
    const supabaseKey = process.env.MASTER_SUPABASE_KEY || ''

    if (supabaseUrl === '' || supabaseKey === '')
        return res.status(500).json({ message: 'Por favor, tente novamente' })

    const supabase = createClient(supabaseUrl, supabaseKey)

    let currencyRefreshed: null | number = null

    const checkTokenIsValid = (token: string) => {
        console.log('33 - Checando se o Token JWT é válido')
        const JWT_SINGNATURE = process.env.JWT_SIGNATURE
        if (!JWT_SINGNATURE)
            return res.status(400).json({ message: '30 JWT Broken' })

        try {
            var decoded = jwt.verify(token, JWT_SINGNATURE);

            if (typeof decoded === 'string')
                return res.status(401).json({ message: '36 Unauthorized' })

            console.log('44 - Token JWT válido')
            return decoded
        } catch (error) {
            console.log('47 - Token JWT Inválido')
            return res.status(401).json({ message: '41 Unauthorized' })
        }
    }

    const getUserCurrency = async (id: string) => {
        try {
            console.log('51 - Pegando saldo do usuário')

            const { data, error } = await supabase
                .from('profiles')
                .select('currency')
                .eq('id', id)
                .single()

            if (error) throw error

            const { currency } = data;
            console.log('63 - Saldo do usuário:', currency)
            return currency
        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: '73 - Não foi possível resgatar informações do usuário, tente novamente!' })
        }
    }

    const getAllBets = async (id_rapidinha: string) => {
        try {
            console.log('69 - Buscando todas as apostas')
            const { data, error } = await supabase
                .from('rapidinha_bets')
                .select('*')
                .eq('rapidinha_id', id_rapidinha)

            if (error) throw error

            console.log('78 - Apostas encontradas:', data?.length)
            return data
        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: '91 - Não foi possível resgatar informações das apostas, tente novamente!' })
        }
    }

    const getRapidinha = async (id: number) => {
        try {
            console.log('83 - Buscando rapidinha a ser apostada')

            const { data, error } = await supabase
                .from('rapidinhas')
                .select('*')
                .eq('id', id)
                .single()

            if (error)
                throw error

            return data
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: '105 - Não foi possível resgatar a rapidinha, tente novamente!' })
        }
    }

    const checkNumberAvaliable = (number: number, bets: Bets[]) => {
        console.log('98 - Checando se número é válido')

        if (bets.length === 0)
            return true

        const filtered = bets.filter(bet => bet.chosen_number === number)

        if (filtered.length === 0)
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
        console.log('129 - Iniciando compra do ticket')

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
                .single()

            newBet = data
            console.log('136 - Compra do ticket efetuada com sucesso')
        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: '124 Error na hora de criar uma aposta' })
        }

        try {
            console.log('143 - Atualizando saldo na conta do comprador')
            currencyRefreshed = userCurrency - ticket_value

            const { data, error } = await supabase
                .from('profiles')
                .update({
                    currency: currencyRefreshed
                })
                .eq('id', user_id)
                .single()

            newProfile = data
            console.log('154 - Saldo atualizado')
        } catch (error) {
            console.log(error)
            return res.status(400).json({ message: '141 - Erro na hora de atualizar o saldo da conta do comprador' })
        }

        console.log('165 - Aposta feita com sucesso')
        return {
            newBet,
            newProfile
        }
    }

    function getRandom(max: number) {
        console.log('168 - Gerando número aleatório')
        const randomNumber = Math.floor(Math.random() * max + 1)
        console.log('170 - Número aleatório gerado:', randomNumber)

        return randomNumber
    }

    const getWinner = (bets: Bets[], sortedNumber: number) => {
        console.log('177 - Filtrando vencedor')
        const winner = bets.filter(bet => bet.chosen_number === sortedNumber)[0]
        console.log('185 - Vencedor encontrado', winner)
        return winner
    }

    const setRapidinhaCompleted = async (id_rapidinha: string, sortedNumber: number, winner_id: string, sortedAt: Date) => {
        console.log('183 - Alterando status da rapidinha')

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

            return data
        } catch (error) {
            console.log(error)
            return false
        }
    }

    const getSortedAndCreatePaymentOrder = async (rapidinha: any) => {
        try {
            console.log('209 - Pegando vencedor e informaçoes de pagamento')

            if (!bets)
                return console.log('212 - Sorteio n pode ser realizado, Não existem apostas pra essa rapidinha')

            const sortedNumber = getRandom(15)

            const winner = getWinner(bets || [], sortedNumber)
            const sortedAt = new Date(Date.now())

            const rapidinhaTotalMoney = rapidinha.qtd_num * rapidinha.ticket_value
            const rapidinhaFeeMoney = rapidinhaTotalMoney * (rapidinha.fee / 100)
            const rapidinhaAward = rapidinhaTotalMoney - rapidinhaFeeMoney

            if (!currencyRefreshed)
                throw 'Currency not refreshed'

            // Adicionar saldo na conta do vencedor
            const { data: dataAddCash, error: errorAddCash } = await supabase
                .from('profiles')
                .update({
                    currency: currencyRefreshed + rapidinhaAward
                })
                .eq('id', winner.user_id)

            if (errorAddCash) console.log(errorAddCash)

            console.log('241 - Saldo do vencedor atualizado')

            // Criar ordem de pagamento (extrato de pagamento)
            const { data, error } = await supabase
                .from('rapidinha_payments')
                .insert({
                    rapidinha_id: rapidinha.id,
                    result_sorted_numbers: sortedNumber,
                    winner_id: winner.user_id,
                    total_money: rapidinhaTotalMoney,
                    fee: rapidinhaFeeMoney,
                    award: rapidinhaAward,
                    user_recived: true,
                })
                .single()

            if (error) console.log(error)

            console.log('261 - Ordem de pagamento criada')


            // Criar notificação de pagamento para o vencedor
            const { data: dataNewNotification, error: errorNewNotification } = await supabase
                .from('notifications')
                .insert({
                    title: 'Parabéns! Seu número foi sorteado',
                    body: `Você ganhou R$ ${rapidinhaAward} na rapidinha #00${rapidinha.id},
                    e o valor já foi creditado na sua conta!`,
                    user_id: winner.user_id,
                    read: false,
                })

            console.log('275 - Notificação de pagamento criada')

            const response = await setRapidinhaCompleted(rapidinha.id, sortedNumber, winner.user_id, sortedAt)

            if (response)
                return response

            return false
        } catch (error) {
            console.log(error)
        }
    }

    const createNewRapidinha = async (id: any) => {
        //Criar nova rapidinha automaticamente
        const numberIs = Number(id) % 2 === 0 ? "par" : "impar"
        const tValue = numberIs === "par" ? 2 : 5
        const rAward = numberIs === "par" ? 21 : 52.5

        console.log(`288 - Criando rapidinha ${numberIs}`)

        try {
            const { data, error } = await supabase
                .from('rapidinhas')
                .insert({
                    qtd_num: 15,
                    fee: 30,
                    ticket_value: tValue,
                    award: rAward,
                    status: 'waiting',
                    qtd_winners: 1
                })

            if (error) console.error(error)

            console.log('333 - Nova rapidinha criada com sucesso')
        } catch (error) {
            console.log(error)
        }
    }

    const token = req.headers.authorization?.split('Bearer ')[1]

    if (!token)
        return res.status(401).json({ message: '164 - Não autorizado' })

    const user = checkTokenIsValid(token)
    const { id_rapidinha, chosen_number } = req.body;

    if (!id_rapidinha || !chosen_number || !user || !user.sub)
        return res.status(400).json({ message: '171 - Requisição faltando detalhes, tente novamente!' })

    const user_id = user.sub
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
    const isAvaliable = checkNumberAvaliable(Number(chosen_number), bets || [])

    if (!isAvaliable)
        return res.status(400).json({ message: '195 - Número já selecionado por outro usuário' })

    const qtdTicketsAcctually = bets && bets.length || 0

    if (qtdTicketsAcctually === rapidinha.qtd_num)
        return res.status(400).json({ message: '192 - Esta rapidinha já atingiu o número máximo de apostas' })

    const newPurchase = await handleNewPurchaseTicket(
        id_rapidinha,
        user_id,
        chosen_number,
        ticket_value,
        userCurrency,
    )

    console.log(`333 - ${qtdTicketsAcctually + 1}/${rapidinha.qtd_num} Tickets vendidos`)

    if (qtdTicketsAcctually + 1 === rapidinha.qtd_num) {
        console.log('336 - Rapidinha finalizada, sorteando vencedor')
        const response = await getSortedAndCreatePaymentOrder(rapidinha)
        console.log('337 - Sorteio realizado com sucesso?', response)

        await createNewRapidinha(id_rapidinha)
        console.log('341 - Rapidinha criada com sucesso')

        return res.status(200).json({
            ...newPurchase,
            sortedNumber: response.result_sorted_numbers,
            award: response.award,
            lastBuyerIsWinner: response.winner_id === user_id,
        })
    }

    console.log('---------------------------------------')
    return res.status(200).json(newPurchase)
}

export default handler