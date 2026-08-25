import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export const identifyPokemonFromImage = async (
    base64Image: string,
    mimeType: string
): Promise <string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
            {
                inlineData: {
                    mimeType,
                    data: base64Image
                }
            },
            {
                text: 'Esta es una carta o imagen de un Pokémon. Identifica de qué Pokémon se trata. Responde ÚNICAMENTE con el nombre en inglés tal como aparece en la PokéAPI (ej: "pikachu", "charizard", "articuno-galar"), en minúsculas, sin ningún texto adicional, comillas, ni explicación.'
            }
        ]
    })

    const text = response.text
    
    if(!text){
        throw new Error('No se pudo encontrar una respuesta')
    }

    return text.trim().toLowerCase()
}