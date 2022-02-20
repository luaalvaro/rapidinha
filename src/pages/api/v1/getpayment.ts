import { NextApiHandler } from "next"
import jwt from 'jsonwebtoken'
import { createClient } from "@supabase/supabase-js"

interface PaymentOrder {
    id: string,
    created_at: string,
    rapidinha_id: number,
    result_sorted_numbers: number,
    winner_id: string,
    total_money: number,
    fee: number,
    award: number,
    user_recived: boolean
}
const handler: NextApiHandler = async (req, res) => {

    console.log('---------------------------------------')
    const supabaseUrl = 'https://rvdmmpwydcbhgnenqyds.supabase.co'
    const supabaseKey = process.env.MASTER_SUPABASE_KEY || ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const token = req.headers.authorization?.split('Bearer ')[1]

    if (!token)
        return res.status(401).json({ message: '164 - Não autorizado' })

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

    const getPaymentOrder = async (rapidinha_id: string) => {
        try {
            const { data, error } = await supabase
                .from<PaymentOrder>('rapidinha_payments')
                .select('*')
                .eq('rapidinha_id', rapidinha_id)
                .single()

            if (error) console.log(error)

            return data
        } catch (error) {
            console.log(error)
        }
    }

    const getUserCurrency = async (user_id: string) => {
        try {
            const { data, error } = await supabase
                .from<{ id: string, currency: string }>('profiles')
                .select('currency')
                .eq('id', user_id)
                .single()
            if (error) console.log(error)

            return data?.currency
        } catch (error) {
            console.log(error)
        }
    }
    const payWinner = async (user_id: string, award: number, userCurrency: number, rapidinha_id: string) => {
        try {
            const { data, error } = await supabase
                .from('rapidinha_payments')
                .update({
                    user_recived: true
                })
                .eq('rapidinha_id', rapidinha_id)
                .single()

            if (error) console.log(error)

            console.log(data)
        } catch (error) {
            console.log(error)
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    currency: userCurrency + award
                })
                .eq('id', user_id)
                .single()

            if (error) console.log(error)

            console.log(data)
            return true
        } catch (error) {
            console.log(error)
        }
    }

    const user = checkTokenIsValid(token)

    if (!user)
        return res.status(401).json({ message: '33 Unauthorized' })

    const { rapidinha_id } = req.body;

    if (!rapidinha_id)
        return res.status(400).json({ message: '38 Requisição incompleta' })

    const paymentOrder = await getPaymentOrder(rapidinha_id)

    if (!paymentOrder)
        return res.status(400).json({ message: '80 Requisição incorreta' })

    if (paymentOrder.user_recived === true)
        return res.status(400).json({ message: '111 Esta rapidinha já pagou o vencedor' })

    const userCurrency = await getUserCurrency(user.sub || "")
    if (!userCurrency)
        return res.status(400).json({ message: '111 Usuário inválido' })

    console.log('Saldo atual do ganhador', userCurrency)

    const recived = await payWinner(user.sub || "", paymentOrder.award, Number(userCurrency), rapidinha_id)
    console.log('Usuário recebeu o pagamento?', recived)

    res.status(200).json({ message: 'Pagamento finalizado', award: paymentOrder.award })
}

export default handler