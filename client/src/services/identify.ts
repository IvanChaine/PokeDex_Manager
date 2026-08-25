import api from './api'

export const identifyPokemonImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)

    const response = await api.post('/identify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data.pokemonName
}