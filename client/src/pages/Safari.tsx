import { useState, useEffect, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getPokemonByName, getAllPokemonNames, PokemonDetail, getTypeBadgeStyle } from '../services/pokeapi'
import { addToMyCollection } from '../services/collection'
import { identifyPokemonImage } from '../services/identify'

const Safari = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [allNames, setAllNames] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [results, setResults] = useState<PokemonDetail[]>([])
  const [nicknames, setNicknames] = useState<Record<number, string>>({})
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set())
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [identifying, setIdentifying] = useState(false)

  useEffect(() => {
    const loadNames = async () => {
      const list = await getAllPokemonNames()
      setAllNames(list.map((p) => p.name))
    }
    loadNames()
  }, [])

  useEffect(() => {
  return () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  }
}, [previewUrl])

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setError('')
  }

  const handleIdentify = async () => {
    if (!selectedFile) return

    setIdentifying(true)
    setError('')

    try {
      const pokemonName = await identifyPokemonImage(selectedFile)
      await runSearch(pokemonName)
      setSelectedFile(null)
      setPreviewUrl(null)
    } catch (err) {
      console.error('Error al identificar el pokemon:', err)
      setError('No se pudo identificar al pokemon en la imagen, intente tomando otra foto')
    } finally {
      setIdentifying(false)
    }
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
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="pixel-title mb-6 text-base text-white drop-shadow">Safari - Buscar Pokemon</h1>

      <form onSubmit={handleSearch} className="relative flex flex-col gap-3 mb-6 sm:flex-row">
        <div className="flex-1 relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Introduce el nombre del pokemon"
          className="input-game w-full"
          autoComplete="off"
        />

        {suggestions.length > 0 && (
          <ul className="dex-panel absolute z-30 mt-1 max-h-56 w-full overflow-y-auto py-1">
            {suggestions.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(name)}
                  className="w-full text-left px-3 py-2 capitalize hover:bg-dex-screen"
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
          className="btn-game bg-dex-yellow px-5 py-2 font-semibold disabled:opacity-50"
          >
            {loading ? 'Buscando Pokemon' : 'Buscar'}
          </button>
      </form>

      

      {error && (
        <div className="dex-panel mb-4 p-4">
          <p className="font-semibold text-dex-red-dark">{error}</p>
        </div>
      )}
        
        <div className="dex-panel p-5 mb-6">
        <h2 className="pixel-title mb-4 text-xs text-dex-red">ESCÁNER</h2>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          {/* Vista previa en pantalla LCD */}
          <div className="lcd-screen flex h-36 w-36 shrink-0 items-center justify-center p-2">
            {previewUrl ? (
              <img src={previewUrl} alt="Vista previa" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-xs text-gray-400">Sin imagen</span>
            )}
          </div>

          <div className="flex w-full flex-col gap-3">
            <p className="text-sm text-gray-500">
              Agrega a tu coleccion usando una foto (carta TCG, imagen, etc)
            </p>

            <input
              id="foto-pokemon"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="foto-pokemon"
                className="btn-game cursor-pointer px-4 py-2 text-sm font-semibold"
              >
                Elegir imagen
              </label>

              {selectedFile && (
                <>
                  <span className="max-w-40 truncate text-xs text-gray-400">{selectedFile.name}</span>

                  <button
                    onClick={handleIdentify}
                    disabled={identifying}
                    className="btn-game bg-dex-blue px-4 py-2 text-sm font-semibold text-white"
                  >
                    {identifying ? 'Escaneando...' : 'Identificar'}
                  </button>
                </>
              )}
            </div>

            {identifying && (
              <p className="pixel-title animate-pulse text-xs text-dex-blue">ANALIZANDO IMAGEN...</p>
            )}
          </div>
        </div>
      </div>

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
                className={`dex-panel p-4 text-center ${
                  results.length === 1 ? 'max-w-sm mx-auto p-6' : ''
                }`}
                >
            <img
              src={pokemon.sprites.other['official-artwork'].front_default ?? ''}
              alt={pokemon.name}
              className={results.length === 1 ? 'w-40 h-40 mx-auto' : 'w-24 h-24 mx-auto'}
            />
            <h2 className="font-bold capitalize mt-2">{pokemon.name}</h2>

            <div className='mt-1 flex flex-wrap justify-center gap-1'>
              {pokemon.types.map((t) => (
                <span
                  key={t.type.name}
                  className="rounded-full border-2 border-dex-ink px-2 py-0.5 text-[10px] font-bold capitalize"
                  style={getTypeBadgeStyle(t.type.name)}
                >
                  {t.type.name}
                </span>
              ))}
            </div>

            {addedIds.has(pokemon.id) ? (
                  <p className="mt-3 text-sm font-semibold text-dex-green">Atrapado</p>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Apodo (opcional)"
                      value={nicknames[pokemon.id] || ''}
                      onChange ={(e) => handleNicknameChange(pokemon.id, e.target.value)}
                      className="input-game mb-2 mt-3 w-full text-sm"
                    />
                    <button
                      onClick={() => handleAdd(pokemon)}
                      className="btn-game w-full bg-dex-green px-3 py-1.5 text-sm font-semibold"
                    >
                      Atrapar
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