import { createClient } from "@supabase/supabase-js"
import jwt from 'jsonwebtoken'
import { NextApiHandler } from "next"

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

    const createDefaultRapidinha = async () => {
        try {
            const { data, error } = await supabase
                .from('rapidinhas')
                .insert({

                })

            if (error) console.log(error)

            console.log(data)
        } catch (error) {
            console.error(error)
        }
    }

    const user = checkTokenIsValid(token)

    console.log(user)
    await createDefaultRapidinha()

    return res.status(200).json({ message: '56 Created' })
}

export default handler