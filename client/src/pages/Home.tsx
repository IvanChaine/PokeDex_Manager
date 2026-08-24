import { useEffect, useState } from 'react'
import { getMyCollection, removeFromMyCollection, CollectionEntry } from '../services/collection'
import { getPokemonById, PokemonDetail } from '../services/pokeapi';

interface EnrichedEntry extends CollectionEntry {
  details: PokemonDetail
}

const Home = () => {
  const [entries, setEntries] = useState<EnrichedEntry[]>([])
  const [loading, setLoading] = useState(true)

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
    return <p className="text-center mt-10">Cargando tu coleccion</p>
  }

  return (
    <div className="p-6 max=w=5x1 mx-auto">
      <h1 className="text-2xl font-bold mb-6">Mi Colección</h1>

      {entries.length === 0 ? (
        <p className="text-gray-500">Aun no atrapas a este Pokemon</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {entries.map((entry) => (
            <div key={entry.id} className="border rounded-lg p-4 text-center bg-white shadow-sm">
              <img
                src={entry.details.sprites.other['official-artwork'].front_default}
                alt={entry.details.name}
                className="w-24 h-24 mx-auto"
                />
                <p className="capitalize font-semibold mt-2">
                  {entry.nickname || entry.details.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {entry.details.types.map((t) => t.type.name).join(', ')}
                </p>
                <button
                  onClick={() => handleRemove(entry.id)}
                  className="text-xs text-red-500 mt-2"
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