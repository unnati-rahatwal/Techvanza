import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Listing from '@/models/Listing';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
// NOTE: Make sure NEXT_PUBLIC_GEMINI_API_KEY or GEMINI_API_KEY is in .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function POST(request) {
    try {
        await dbConnect();
        const { query } = await request.json();

        if (!query) {
            return NextResponse.json({ error: 'Query required' }, { status: 400 });
        }

        // 1. Use Gemini to extract intent and filters
        const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

        const prompt = `
            You are a smart search assistant for a waste recycling marketplace.
            Extract search filters from this user query: "${query}"
            
            Return ONLY a JSON object with these keys (if applicable, else null):
            - wasteType: String (e.g., 'Plastic', 'Glass', 'Paper', 'Metal', 'E-Waste', 'Textile', 'Organic')
            - location: String (City or Area)
            - maxPrice: Number
            - quantity: Number (if they ask for minimum quantity)
            - keywords: String (Any other specific descriptive keywords)

            Example: "I need cheap plastic in Mumbai under 50rs"
            Output: { "wasteType": "Plastic", "location": "Mumbai", "maxPrice": 50, "keywords": "cheap" }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        let filters = {};
        try {
            // Cleanup markdown code blocks if present
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            filters = JSON.parse(jsonStr);
        } catch (e) {
            console.error('Failed to parse Gemini response:', text);
            // Fallback: simple keyword extraction
            filters = { keywords: query };
        }

        console.log('AI Parsed Filters:', filters);

        let listings = [];

        // 2. Attempt Atlas Search (Vector/Fuzzy) first
        // Note: This requires a Search Index 'default' on the 'listings' collection
        try {
            const searchStage = {
                $search: {
                    index: 'default',
                    compound: {
                        should: [
                            {
                                text: {
                                    query: query,
                                    path: ['title', 'description', 'wasteType', 'location'],
                                    fuzzy: { maxEdits: 1 }
                                }
                            }
                        ]
                    }
                }
            };

            // Enhance with filters if present
            if (filters.wasteType) {
                searchStage.$search.compound.must = searchStage.$search.compound.must || [];
                searchStage.$search.compound.must.push({
                    text: { query: filters.wasteType, path: 'wasteType' }
                });
            }

            listings = await Listing.aggregate([
                searchStage,
                { $limit: 10 }
            ]);

            // If Atlas Search returns results, populate them
            if (listings.length > 0) {
                listings = await Listing.populate(listings, { path: 'supplier', select: 'name' });
            }

        } catch (searchError) {
            console.warn('Atlas Search failed (likely missing index), falling back to Regex:', searchError.message);

            // 3. Fallback: Standard MongoDB Regex Search
            const regexQuery = {};

            if (filters.wasteType) regexQuery.wasteType = { $regex: filters.wasteType, $options: 'i' };
            if (filters.location) regexQuery.location = { $regex: filters.location, $options: 'i' };
            if (filters.maxPrice) regexQuery.pricePerKg = { $lte: filters.maxPrice };

            // If no specific filters, search title/desc with keywords
            if (!filters.wasteType && !filters.location && filters.keywords) {
                regexQuery.$or = [
                    { title: { $regex: filters.keywords, $options: 'i' } },
                    { description: { $regex: filters.keywords, $options: 'i' } }
                ];
            }

            // If purely empty extraction, fallback to raw query in title
            if (Object.keys(regexQuery).length === 0) {
                regexQuery.title = { $regex: query, $options: 'i' };
            }

            listings = await Listing.find(regexQuery).limit(10).populate('supplier', 'name');
        }

        return NextResponse.json({
            results: listings,
            filters: filters
        }, { status: 200 });

    } catch (error) {
        console.error('Agent/Search Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
