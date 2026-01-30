import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function calculateCarbonImpact(wasteType, quantity) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

        const prompt = `
      Calculate the approximate carbon emissions saved (in kg CO2) by recycling or repurposing the following waste:
      Type: ${wasteType}
      Quantity: ${quantity} kg

      Return ONLY a raw JSON object with the following format, no markdown formatting:
      {
        "savedCO2": Number,
        "impactDescription": "Short sentence describing the provided benefit"
      }
      Assume standard recycling efficiency rates. 
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown code blocks
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Gemini Calculation Error:", error);
        // Fallback calculation if AI fails
        return {
            savedCO2: quantity * 2.5, // Generic multiplier
            impactDescription: "Estimated based on average recycling data."
        };
    }
}
