import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { identifyPokemonFromImage } from '../services/gemini.service'

export const identifyPokemon = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se recibio ninguna imagen' })
        }

        const base64Image = req.file.buffer.toString('base64')
        const mimeType = req.file.mimetype

        const pokemonName = await identifyPokemonFromImage(base64Image, mimeType)

        return res.status(200).json({ pokemonName })
    } catch (error) {
        console.error('Error al identificar pokemon:', error)
        return res.status(500).json({ error: 'No se pudo identificar al pokemon de la imagen' })
    }
}