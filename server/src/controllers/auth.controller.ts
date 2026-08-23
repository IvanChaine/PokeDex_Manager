import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../db/prisma'

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Es necesario introducir tanto el correo como la contrasena'})
        }

        const existingUser = await prisma.user.findUnique({ where: { email } })
        
        if (existingUser) {
            return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await prisma.user.create({
            data: { email, password: hashedPassword }
        })

        return res.status(201).json({
            id: newUser.id,
            email: newUser.email
        })
    } catch (error) {
        console.error('Error en register:', error)
        return res.status(500).json({ error: 'Error intero del servidor'})
    }
}

export const login = async (req: Request, res: Response) => {
    try{
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ error: 'Es necesario introducir tanto el correo como la contrasena'})
        }

        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
            return res.status(401).json({ error: 'Los datos introducidos son incorrectos' })
        }

        const passwordMatches = await bcrypt.compare(password, user.password)

        if (!passwordMatches) {
            return res.status(401).json({ error: 'Los datos introducidos son incorrectos '})
        }

        const token = jwt.sign(
            { userId: user.id},
            process.env.JWT_SECRET as string,
            { expiresIn: '7d'}
        )

        return res.status(200).json({ token })
    } catch (error) {
        console.error('Error durante el inicio de sesion:', error)
        return res.status(500).json({ error: 'Error interno del servidor' })
    }
}