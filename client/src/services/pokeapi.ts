import axios from 'axios'

const pokeApi = axios.create({
    baseURL: 'https://pokeapi.co/api/v2'
})

export interface PokemonDetail {
    id: number
    name: string
    sprites: {
        front_default: string
        other: {
            'official-artwork': {
                front_default: string
            }
        }
    }
    types: { type: { name: string} }[]
}

export const getPokemonById = async (id: number): Promise<PokemonDetail> =>{
    const response = await pokeApi.get(`/pokemon/${id}`)
    return response.data
}