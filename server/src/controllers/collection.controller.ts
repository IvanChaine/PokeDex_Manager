import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import { prisma } from '../db/prisma'

export const getCollection = async (req: AuthRequest, res: Response) => {
    try {
        const entries = await prisma.pokemonEntry.findMany({
            where: { userId: req.userId }
        })

        return res.status(200).json(entries)
    } catch (error) {
        console.error('Error en getCollection:', error)
        return res.status(500).json({ error: 'Error interno del servidor' })
    }
}

export const addToCollection = async (req: AuthRequest, res: Response) => {
    try {
        const { pokemonId, nickname } = req.body

        if (!pokemonId) {
            return res.status(400).json({ error: 'Se necesita el ID del Pokemon' })
        }

        const newEntry = await prisma.pokemonEntry.create({
            data: {
                pokemonId,
                nickname: nickname || null,
                userId: req.userId as string
            }
        })

        return res.status(201).json(newEntry)
    } catch (error) {
        console.error('Error al anadir a la coleccion:', error)
        return res.status(500).json({ error: 'Error interno del servidor' })
    }
}

export const removeFromCollection = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params as { id: string }

        const entry = await prisma.pokemonEntry.findUnique({ where: { id } })

        if (!entry) {
            return res.status(404).json({ error: 'Pokemon no encontrado' })
        }

        if (entry.userId !== req.userId) {
            return res.status(403).json({ error: 'No tiene permisos para eliminar esta entrada' })
        }

        await prisma.pokemonEntry.delete({ where: { id } })

        return res.status(200).json({ message: 'Pokemon eliminado correctamente' })
    } catch (error) {
        console.error('Error al remover de la coleccion:', error)
        return res.status(500).json({ error: 'Error interno del servidor' })
    }
}