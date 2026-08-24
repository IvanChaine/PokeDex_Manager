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

interface PokemonListItem {
    name: string
    url: string
}

export const getPokemonById = async (id: number): Promise<PokemonDetail> =>{
    const response = await pokeApi.get(`/pokemon/${id}`)
    return response.data
}

export const getPokemonByName = async (name: string): Promise<PokemonDetail> => {
    const response = await pokeApi.get(`/pokemon/${name.toLowerCase()}`)
    return response.data
}

export const getPokemonList = async (limit = 20, offset = 0): Promise<PokemonListItem[]> => {
    const response = await pokeApi.get(`/pokemon?limit=${limit}&offset=${offset}`)
    return response.data.results
}

export const getAllPokemonNames = async (): Promise<PokemonListItem[]> => {
    const response = await pokeApi.get('/pokemon?limit=1500')
    return response.data.results
}