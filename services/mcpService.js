const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

// Enhance classifier with more training data including help intent
classifier.addDocument('help', 'help');
classifier.addDocument('what can you do', 'help');
classifier.addDocument('show commands', 'help');
classifier.addDocument('show examples', 'help');
classifier.addDocument('available commands', 'help');
classifier.addDocument('how to use', 'help');

// List intent examples
classifier.addDocument('what records do you have', 'list');
classifier.addDocument('show all records', 'list');
classifier.addDocument('display records', 'list');
classifier.addDocument('get all records', 'list');
classifier.addDocument('list everything', 'list');

// Search intent examples
classifier.addDocument('find record', 'search');
classifier.addDocument('search for', 'search');
classifier.addDocument('look up', 'search');
classifier.addDocument('find records in', 'search');
classifier.addDocument('show records in', 'search');
classifier.addDocument('get records from', 'search');
classifier.addDocument('search in sector', 'search');

// Analysis intent examples
classifier.addDocument('show statistics', 'analyze');
classifier.addDocument('analyze records', 'analyze');
classifier.addDocument('show distribution', 'analyze');
classifier.addDocument('compare sectors', 'analyze');

classifier.train();

const EXAMPLE_COMMANDS = {
    list: [
        "show all records",
        "what records do you have",
        "list everything"
    ],
    search: [
        "find records in Technology",
        "search for Healthcare records",
        "show records in Finance"
    ],
    analyze: [
        "show distribution of records by sector",
        "analyze records",
        "compare sectors"
    ]
};

function determineVisualization(intent, results) {
    if (results.length === 0) return null;
    
    switch (intent) {
        case 'analyze':
            return 'chart';
        case 'search':
            return results.length > 10 ? 'table' : 'list';
        case 'list':
            return 'table';
        default:
            return 'table';
    }
}

function analyzeSectorDistribution(records) {
    const sectors = {};
    records.forEach(record => {
        const sector = record.name.split(' - ')[1];
        sectors[sector] = (sectors[sector] || 0) + 1;
    });
    return sectors;
}

async function processQuery(message, records) {
    const tokens = tokenizer.tokenize(message.toLowerCase());
    const intent = classifier.classify(message);
    
    switch (intent) {
        case 'help':
            return {
                success: true,
                message: 'Here are some example commands you can try:\n\n' +
                        '📋 Listing Records:\n' +
                        EXAMPLE_COMMANDS.list.map(cmd => `• "${cmd}"`).join('\n') + '\n\n' +
                        '🔍 Searching Records:\n' +
                        EXAMPLE_COMMANDS.search.map(cmd => `• "${cmd}"`).join('\n') + '\n\n' +
                        '📊 Analyzing Records:\n' +
                        EXAMPLE_COMMANDS.analyze.map(cmd => `• "${cmd}"`).join('\n'),
                data: EXAMPLE_COMMANDS,
                visualization: 'commands'
            };
            
        case 'list':
            return {
                success: true,
                message: 'Here are all the records:',
                data: records,
                visualization: determineVisualization(intent, records)
            };
            
        case 'search': {
            const searchTerms = message.toLowerCase().split(' ')
                .filter(term => term.length > 3 && 
                    !['show', 'find', 'get', 'the', 'and', 'records', 'in'].includes(term));
            
            const searchResults = records.filter(record => {
                const recordText = `${record.name.toLowerCase()} ${record.value.toLowerCase()}`;
                return searchTerms.some(term => recordText.includes(term));
            });
            
            return {
                success: true,
                message: `Found ${searchResults.length} matching records:`,
                data: searchResults,
                visualization: determineVisualization(intent, searchResults)
            };
        }
        
        case 'analyze': {
            const distribution = analyzeSectorDistribution(records);
            return {
                success: true,
                message: 'Here is the distribution of records by sector:',
                data: distribution,
                visualization: 'chart',
                chartType: 'pie'
            };
        }
            
        default:
            return {
                success: true,
                message: "I'm not sure how to help with that. Try asking 'help' to see available commands.",
                data: null
            };
    }
}

module.exports = {
    processQuery,
    EXAMPLE_COMMANDS
};