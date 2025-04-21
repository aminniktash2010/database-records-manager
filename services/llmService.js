const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://ollama:11434';
const MODEL = 'mistral';

class LLMService {
    constructor() {
        this.capabilities = [
            "Searching and querying database records",
            "Analyzing record distributions",
            "Finding records by sector or category",
            "Showing data visualizations",
            "Helping with database operations"
        ];
    }

    async isRelevantQuery(query) {
        const databaseKeywords = [
            'record', 'database', 'data', 'search', 'find', 'show', 'list',
            'analyze', 'sector', 'category', 'chart', 'distribution',
            'technology', 'healthcare', 'finance', 'education', 'retail'
        ];

        const words = query.toLowerCase().split(' ');
        return databaseKeywords.some(keyword => words.includes(keyword.toLowerCase()));
    }

    async getChatResponse(query) {
        if (!await this.isRelevantQuery(query)) {
            return {
                success: true,
                message: "I'm a specialized assistant that can help you with:\n\n" +
                        this.capabilities.map(cap => `• ${cap}`).join('\n') +
                        "\n\nPlease ask me questions related to these topics.",
                data: null,
                visualization: null
            };
        }

        try {
            const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
                model: MODEL,
                prompt: `You are a database records management assistant. The user asks: ${query}
                Context: You can help with searching records, analyzing data distributions, and visualizing data.
                Keep responses focused on database operations and data analysis.
                Current capabilities: ${this.capabilities.join(', ')}
                Response format: Keep it brief and professional.`,
                stream: false
            });

            return {
                success: true,
                message: response.data.response,
                data: null,
                visualization: null
            };
        } catch (error) {
            console.error('LLM Error:', error.message);
            return {
                success: false,
                message: "Sorry, I'm having trouble processing your request right now. Please try again.",
                data: null,
                visualization: null
            };
        }
    }
}

module.exports = new LLMService();