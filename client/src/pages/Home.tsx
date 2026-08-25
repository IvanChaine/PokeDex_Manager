import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyCollection, removeFromMyCollection, CollectionEntry } from '../services/collection'
import { getPokemonById, PokemonDetail, getTypeBadgeStyle } from '../services/pokeapi';

interface EnrichedEntry extends CollectionEntry {
  details: PokemonDetail
}

const Home = () => {
  const [entries, setEntries] = useState<EnrichedEntry[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    const loadCollection = async () => {
    setLoading(true)
    const collection = await getMyCollection()

    const enriched = await Promise.all(
      collection.map(async (entry) => {
        const details = await getPokemonById(entry.pokemonId)
        return { ...entry, details}
      })
    )

    if (!cancelled) {
      setEntries(enriched)
      setLoading(false)
    }
  }
  
  loadCollection()

  return () => {
    cancelled = true
  }
  }, [])

  const handleRemove = async (id: string) => {
    await removeFromMyCollection(id)
    setEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  if (loading) {
    return <p className="pixel-title mt-10 text-center text-sm animate-pulse text-white">Cargando tu coleccion</p>
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="pixel-title mb-6 text-base text-white drop-shadow">Mi Colección</h1>

      {entries.length === 0 ? (
        <div className="dex-panel p-6 text-center">
          <p className="text-gray-500">Aun no atrapas a ningun pokemon</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {entries.map((entry) => (
            <div 
              key={entry.id} 
              onClick={() =>navigate(`/pokemon/${entry.pokemonId}`)}
              className="dex-panel relative cursor-pointer p-4 text-center transition-transform hover:-translate-y-1"
            >
              <span className="absolute left-2 top-2 rounded-full border-2 border-dex-ink bg-dex-yellow px-2 py-0.5 text-[10px] font-bold">
                #{String(entry.pokemonId).padStart(3, '0')}
              </span>

              <img
                src={entry.details.sprites.other['official-artwork'].front_default ?? ''}
                alt={entry.details.name}
                className="w-24 h-24 mx-auto"
              />
              
              <p className="capitalize font-semibold mt-2">
                {entry.nickname || entry.details.name}
              </p>

              <div className="mt-1 flex flex-wrap justify-center gap-1">
                {entry.details.types.map((t) => (
                  <span
                    key={t.type.name}
                    className="rounded-full border-2 border-dex-ink px-2 py-0.5 text-[10px] font-bold capitalize"
                    style={getTypeBadgeStyle(t.type.name)}
                  >
                    {t.type.name}
                  </span>
                ))}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(entry.id)
                }}
                className="mt-2 text-xs font-semibold text-dex-red-dark hover:underline"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home