import { useState, useEffect, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getPokemonByName, getAllPokemonNames, PokemonDetail } from '../services/pokeapi'
import { addToMyCollection } from '../services/collection'

const Safari = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [allNames, setAllNames] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [results, setResults] = useState<PokemonDetail[]>([])
  const [nicknames, setNicknames] = useState<Record<number, string>>({})
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set())
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadNames = async () => {
      const list = await getAllPokemonNames()
      setAllNames(list.map((p) => p.name))
    }
    loadNames()
  }, [])

  const handleInputChange = (value: string) => {
    setSearchTerm(value)

    if (value.trim().length < 2){
      setSuggestions([])
      return
    }

    const filtered = allNames
      .filter((name) => name.startsWith(value.toLowerCase()))
      .slice(0, 8)

      setSuggestions(filtered)
  }

  const runSearch = async (term: string) => {
    const normalized = term.trim().toLowerCase()
    if (!normalized) return

    setLoading(true)
    setError('')
    setResults([])
    setSuggestions([])

    try{
      const isExactMatch = allNames.includes(normalized)

      if (isExactMatch) {
        const pokemon = await getPokemonByName(normalized)
          setResults([pokemon])
      } else {
        const matches = allNames
        .filter((name) => name.startsWith(normalized))
        .slice(0, 12)

        if (matches.length === 0){
          setError('No se encontro ningun pokemon con esos caracteres')
          return
        }

        const details = await Promise.all(matches.map((name) => getPokemonByName(name)))
        setResults(details)
      }   
    } catch (err) {
      console.error('Error al buscar al pokemon:', err)
      setError('Ocurrio un error al buscar, intenta de nuevo o prueba usando su ID')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    runSearch(searchTerm)
  }

  const handleSuggestionClick = (name: string) => {
    setSearchTerm(name)
    runSearch(name)
  }

  const handleNicknameChange = (pokemonId: number, value: string) => {
    setNicknames((prev) => ({ ...prev, [pokemonId]: value}))
  }

  const handleAdd = async (pokemon: PokemonDetail) => {
    try {
      const nickname = nicknames[pokemon.id]?.trim() || undefined
      await addToMyCollection(pokemon.id, nickname)
      setAddedIds((prev) => new Set(prev).add(pokemon.id))
    } catch (err) {
      console.error('Error al agregar a la coleccion', err)
      setError('No se pudo agregar a la coleccion')
    }
  }

  return (
    <div className="p-6 max-w-2x1 mx-auto">
      <h1 className="text-2x1 font-bold mb-6">Safari - Buscar Pokemon</h1>

      <form onSubmit={handleSearch} className="relative flex gap-2 mb-6">
        <div className="flex-1 relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Introduce el nombre o numero de la pokedex del pokemon"
          className="w-full border rounded px-3 py-2"
          autoComplete="off"
        />

        {suggestions.length > 0 && (
          <ul className="absolute z-20 w-full bg-white border rounded mt-1 shadow-lg max-h-56 overflow-y-auto">
            {suggestions.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(name)}
                  className="w-full text-left px-3 py-2 capitalize hover:bg-gray-100"
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Buscando Pokemon' : 'Buscar'}
          </button>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <AnimatePresence mode="wait">
        {results.length > 0 && (
          <motion.div
            key={results.map((r) => r.id).join('-')}
            initial={{ opacity: 0, y: 20}}
            animate={{ opacity: 1, y: 0}}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={
              results.length === 1
                ? ''
                : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'
            }
          >
            {results.map((pokemon) =>(
              <div
                key={pokemon.id}
                className={`bg-white rounded-lg shadow-md p-4 text-center ${
                  results.length === 1 ? 'max-w-sm mx-auto p-6' : ''
                }`}
                >
            <img
              src={pokemon.sprites.other['official-artwork'].front_default}
              alt={pokemon.name}
              className={results.length === 1 ? 'w-40 h-40 mx-auto' : 'w-24 h-24 mx-auto'}
            />
            <h2 className="font-bold capitalize mt-2">{pokemon.name}</h2>
            <p className="text-xs text-gray-500 capitalize mb-3">
              {pokemon.types.map((t) => t.type.name).join(', ')}
            </p>

            {addedIds.has(pokemon.id) ? (
              <p className="text-green-600 text-sm font-medium">Pokemon agregado a la coleccion</p>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Apodo (opcional)"
                  value={nicknames[pokemon.id] || ''}
                  onChange ={(e) => handleNicknameChange(pokemon.id, e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm mb-2"
                />
              <button
                onClick={() => handleAdd(pokemon)}
                className="w-full bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
              >
                Agregar a mi coleccion
              </button>
              </>
            )}
            </div>
            ))}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Safari