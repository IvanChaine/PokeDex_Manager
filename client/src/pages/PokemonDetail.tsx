import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PokemonDetail, PokemonSpecies, getPokemonById, getPokemonByName, getPokemonSpecies, getEvolutionChain, StatLabels, getTypeBadgeStyle, getSpanishFlavor, getHabitatLabel, formatHeight, formatWeight } from '../services/pokeapi';

interface DetailData {
    pokemon: PokemonDetail
    species: PokemonSpecies
    evolutions: PokemonDetail[]
}

const PokemonDetailPage = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [data, setData] = useState<DetailData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false
        
        const load = async () => {
            setLoading(true)
            setError('')
            setData(null)

            try {
                const numericId = Number(id)
                if (!Number.isInteger(numericId) || numericId <= 0) {
                    throw new Error ('El ID no es valido')
            }

            const pokemon = await getPokemonById(numericId)
            const speciesId = Number(pokemon.species.url.split('/').filter(Boolean).pop())
            const species = await getPokemonSpecies(speciesId)

            const evolutionNames = await getEvolutionChain(species.evolution_chain.url)
            const evolutions = await Promise.all(evolutionNames.map((name) => getPokemonByName(name)))
            
            if (!cancelled) setData({ pokemon, species, evolutions })
        } catch (err) {
            console.error('Error al cargar la informacion:', err)
            if(!cancelled) setError('No se pudo cargar la informacion de este pokemon')
        } finally {
            if (!cancelled) setLoading(false)
        }
    }

    load()
    return () => {
        cancelled = true
    }
}, [id])

if (loading) {
    return (
        <div className="p-10 text-center">
            <p className="pixel-title animate-pulse text-sm text-white">Cargando...</p>
        </div>
    )
}

if (error || !data){
    return(
        <div className="mx-auto max-w-md p-6 text-center">
            <div className="dex-panel p-6">
                <p className="mb-4 font-semibold text-dex-red-dark">{error}</p>
                <button onClick={() => navigate(-1)} className="btn-game px-4 py-2 font-semibold">
                    Regresar
                </button>
            </div>
        </div>
    )
}

const { pokemon, species, evolutions } = data
const artwork = pokemon.sprites.other['official-artwork'].front_default ?? pokemon.sprites.front_default
const flavor = getSpanishFlavor(species)


return (
    <div className="mx-auto max-w-4xl space-y-5 p-6">
        <button onClick={() => navigate(-1)} className="btn-game px-4 py-2 text-sm font-semibold">
            Regresar
        </button>

        <div className="dex-panel p-5">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                <div className="lcd-screen shrink-0 p-4">
                    {artwork && (
                        <img 
                            src={artwork}
                            alt={pokemon.name}
                            className="h-52 w-52 object-contain" />
                    )}
                </div>

                <div className="text-center md:text-left">
                    <p className="pixel-title text-xs text-gray-400">
                        #{String(pokemon.id).padStart(3, '0')}
                    </p>
                    <h1 className="pixel-title mt-2 text-xl capitalize text-dex-red">{pokemon.name}</h1>

                    <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                        {pokemon.types.map((t) => (
                            <span
                                key={t.type.name}
                                className="rounded-full border-2 border-dex-ink px-3 py-1 text-xs font-bold capitalize"
                                style={getTypeBadgeStyle(t.type.name)}
                            >
                                {t.type.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                    { label: 'Altura', value: formatHeight(pokemon.height) },
                    { label: 'Peso', value: formatWeight(pokemon.weight) },
                    { label: 'Hábitat', value: getHabitatLabel(species.habitat) },
                    { label: 'Captura', value: `${species.capture_rate}/255` }
                ].map((item) => (
                    <div key={item.label} className="dex-panel p-3 text-center">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{item.label}</p>
                        <p className="mt-1 font-semibold capitalize">{item.value}</p>
                    </div>
                ))}
            </div>

             {flavor && (
                <div className="dex-panel p-5">
                    <h2 className="pixel-title mb-3 text-xs text-dex-red">PokeDex</h2>
                    <div className="lcd-screen p-4">
                        <p className="leading-relaxed text-dex-ink/80">{flavor}</p>
                    </div>
                </div>
            )}

            <div className="dex-panel space-y-3 p-5">
                <h2 className="pixel-title text-xs text-dex-red">ESTADÍSTICAS</h2>
                {pokemon.stats.map((s) => (
                    <div key={s.stat.name} className="flex items-center gap-3">
                        <span className="w-24 shrink-0 text-right text-sm font-semibold">
                            {StatLabels[s.stat.name] ?? s.stat.name}
                        </span>
                        <span className="w-10 text-sm font-bold">{s.base_stat}</span>
                        <div className="stat-track h-3 flex-1">
                            <div
                                className="stat-fill"
                                style={{ width: `${Math.min(100, Math.round((s.base_stat / 255) * 100))}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="dex-panel p-5">
                <h2 className="pixel-title mb-3 text-xs text-dex-red">HABILIDADES</h2>
                <div className="flex flex-wrap gap-2">
                    {pokemon.abilities.map((a) => (
                        <span
                            key={a.ability.name}
                            className={`rounded-full border-2 border-dex-ink px-3 py-1 text-xs font-semibold capitalize ${
                                a.is_hidden ? 'border-dashed bg-gray-100' : 'bg-white'
                            }`}
                        >
                            {a.ability.name.replace(/-/g, ' ')}
                            {a.is_hidden && ' (Oculta)'}
                        </span>
                    ))}
                </div>
            </div>

            <div className="dex-panel p-5">
                <h2 className="pixel-title mb-4 text-xs text-dex-red">EVOLUCIÓN</h2>
                {evolutions.length <= 1 ? (
                    <p className="text-sm text-gray-500">Este Pokémon no evoluciona.</p>
                ) : (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {evolutions.map((evo, index) => (
                            <div key={evo.id} className="flex items-center gap-2">
                                {index > 0 && <span className="text-xl font-bold text-gray-400">→</span>}
                                <Link
                                    to={`/pokemon/${evo.id}`}
                                    className="lcd-screen block p-2 transition-transform hover:-translate-y-1"
                                >
                                    <img
                                        src={
                                            evo.sprites.other['official-artwork'].front_default ??
                                            evo.sprites.front_default ?? ''
                                        }
                                        alt={evo.name}
                                        className="h-20 w-20 object-contain"
                                    />
                                    <p className="mt-1 text-center text-xs font-semibold capitalize">
                                        {evo.name}
                                    </p>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default PokemonDetailPage