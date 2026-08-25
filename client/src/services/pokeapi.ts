import axios from 'axios'

const pokeApi = axios.create({
    baseURL: 'https://pokeapi.co/api/v2'
})

export interface PokemonDetail {
    id: number
    name: string
    height: number
    weight: number
    sprites: {
        front_default: string | null
        other: {
            'official-artwork': {
                front_default: string | null
            }
        }
    }
    types: { type: { name: string} }[]
    abilities: { ability: { name: string }; is_hidden: boolean }[]
    stats: { base_stat: number; stat: { name: string } }[]
    species: { name: string, url: string }
}

export interface PokemonSpecies {
    genera: { genus: string; language: { name: string } }[]
    flavor_text_entries: { flavor_text: string; language: { name: string } }[]
    habitat: { name: string } | null
    capture_rate: number
    evolution_chain: { url: string }
}

interface PokemonListItem {
    name: string
    url: string
}

interface EvolutionNode {
    species: { name: string; url: string }
    evolves_to: EvolutionNode[] 
}

interface EvolutionChainResponse {
    chain: EvolutionNode
}

export const getPokemonById = async (id: number): Promise<PokemonDetail> =>{
    const response = await pokeApi.get(`/pokemon/${id}`)
    return response.data
}

export const getPokemonByName = async (name: string): Promise<PokemonDetail> => {
    const response = await pokeApi.get(`/pokemon/${name.toLowerCase()}`)
    return response.data
}

export const getPokemonList = async (limit = 1500, offset = 0): Promise<PokemonListItem[]> => {
    const response = await pokeApi.get(`/pokemon?limit=${limit}&offset=${offset}`)
    return response.data.results
}

export const getAllPokemonNames = async (): Promise<PokemonListItem[]> => {
    const response = await pokeApi.get('/pokemon?limit=1500')
    return response.data.results
}

export const getPokemonSpecies = async (id: number): Promise<PokemonSpecies> => {
    const response = await pokeApi.get(`/pokemon-species/${id}`)
    return response.data
}

export const getEvolutionChain = async (url: string): Promise<string[]> => {
    const chainId = url.split('/').filter(Boolean).pop()
    const response = await pokeApi.get<EvolutionChainResponse>(`/evolution-chain/${chainId}`)

    const names: string[] = []
    const walk = (node: EvolutionNode) => {
        names.push(node.species.name)
        node.evolves_to.forEach(walk)
    }

    walk(response.data.chain)

    return names
}

export const StatLabels: Record<string, string> = {
    hp: 'PS',
    attack: 'Ataque',
    defense: 'Defensa',
    'special-attack': 'At. Esp.',
    'special-defense': 'Def. Esp.',
    speed: 'Velocidad'
}

export const TypeColors: Record<string, string> = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD'
}

const hexToRgb = (hex: string): [number, number, number] => {
    const value = hex.replace('#', '')
    return [
        parseInt(value.slice(0, 2), 16),
        parseInt(value.slice(2, 4), 16),
        parseInt(value.slice(4, 6), 16)
    ]
}

export const getSpanishFlavor = (species: PokemonSpecies): string => {
    const entries = species.flavor_text_entries
    const esEntries = entries.filter((e) => e.language.name === 'es')
    const entry =
        esEntries[esEntries.length - 1] ??
        entries.find((e) => e.language.name === 'en') ??
        entries[0]

    if (!entry) return ''
    return entry.flavor_text.replace(/[\n\f\r]/g, ' ').replace(/\s+/g, ' ').trim()
}

const HabitatEsp: Record<string, string> = {
    cave: 'Cueva',
    forest: 'Bosque',
    grassland: 'Pradera',
    mountain: 'Montaña',
    rare: 'Desconocido',
    'rough-terrain': 'Terreno abrupto',
    sea: 'Mar',
    urban: 'Zona urbana',
    'waters-edge': 'Orilla del agua'
}

export const getHabitatLabel = (habitat: { name: string } | null): string => {
    if (!habitat) return 'Desconocido'
    return HabitatEsp[habitat.name] ?? habitat.name.charAt(0).toUpperCase() + habitat.name.slice(1)
}

export const formatHeight = (decimeters: number): string => `${(decimeters / 10).toFixed(1)} m`
export const formatWeight = (hectograms: number): string => `${(hectograms / 10).toFixed(1)} kg`

export const getTypeBadgeStyle = (type: string): { backgroundColor: string; color: string } => {
    const color = TypeColors[type] ?? '#777777'
    const [r, g, b] = hexToRgb(color)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return { backgroundColor: color, color: luminance > 0.65 ? '#232323' : '#ffffff' }
}