import api from './api'

export interface CollectionEntry {
    id: string
    pokemonId: number
    nickname: string | null
    addedAt: string
    userId: string
}

export const getMyCollection = async (): Promise<CollectionEntry[]> => {
    const response = await api.get('/collection')
    return response.data
}

export const addToMyCollection = async (pokemonId: number, nickname?: string) => {
    const response = await api.post('/collection', { pokemonId, nickname })
    return response.data
}

export const removeFromMyCollection = async (id: string) => {
    await api.delete(`/collection/${id}`)
}