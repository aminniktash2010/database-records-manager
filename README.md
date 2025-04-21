# Database Records Manager

> This project was created with assistance from Visual Studio Code AI (powered by Claude 3.5 Sonnet), demonstrating the capabilities of AI-assisted development in creating a full-stack application.

A modern web application for managing and querying database records with an AI-powered chat interface. This application provides a user-friendly interface for searching, updating, and analyzing records across different industries and categories.

## 📑 Table of Contents
- [Architecture](#-architecture)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Dependencies](#-dependencies)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Data Schema](#-data-schema)
- [Features in Detail](#-features-in-detail)
- [Security Features](#-security-features)
- [Docker Configuration](#-docker-configuration)
- [Performance Considerations](#-performance-considerations)
- [Model Context Protocol Implementation](#-model-context-protocol-mcp-implementation)
- [Data Visualization](#-data-visualization)
- [Contributing](#-contributing)
- [License](#-license)

## 🏗️ Architecture

```
┌─────────────────┐     ┌───────────────────────┐
│   Frontend      │     │      Backend          │
│  (HTML/CSS/JS)  │◄────┤    (Node.js/Express)  │
│   Chart.js      │     │                       │
└────────┬────────┘     └──────────┬────────────┘
         │                         │
         │                         ▼
         │              ┌───────────────────────┐
         │              │    NLP Pipeline       │
         │              │ ┌─────────────────┐   │
         │              │ │  Tokenization   │   │
         │              │ │  Classification │   │
         │              │ │  Intent Match   │   │
         │              │ └─────────────────┘   │
         │              └──────────┬────────────┘
         │                         │
         │                         ▼
         │              ┌───────────────────────┐
         │              │    MCP Layer          │
         │              │ ┌─────────────────┐   │
         │              │ │Context Manager  │   │
         │              │ │Response Gen    │   │
         │              │ │Query Processor │   │
         │              │ └─────────────────┘   │
         │              └──────────┬────────────┘
         │                         │
         │                         ▼
         │              ┌───────────────────────┐
         └──────────────┤      MongoDB         │
                       │     Database          │
                       └───────────────────────┘
```

## 🚀 Features

- **Record Management**
  - View all records with pagination
  - Search records by name and value
  - Update existing records
  - RESTful API endpoints

- **Smart Chat Interface**
  - Natural language queries about records
  - Category-based filtering (Industry, Type, Status)
  - Interactive responses with record summaries
  - Data visualization capabilities

- **Data Categories**
  - Industries: Technology, Healthcare, Finance, Education, Retail
  - Types: Client, Project, Product, Service, Report
  - Statuses: Active, Pending, Completed, Archived

## 🛠️ Technology Stack

- **Frontend:**
  - HTML5
  - CSS3 with modern flexbox layout
  - JavaScript (ES6+)
  - Chart.js for data visualization
  
- **Backend:**
  - Node.js
  - Express.js framework
  - MongoDB with Mongoose ORM
  - Express Validator for input validation
  
- **Development & Deployment:**
  - Docker & Docker Compose
  - Environment configuration with dotenv
  - CORS enabled for API access
  - Health check endpoints

## 📦 Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express-validator": "^7.0.1",
    "chart.js": "^4.4.9"
  }
}
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agent-test-app
   ```

2. **Environment Setup**
   Create a `.env` file with:
   ```
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://mongodb:27017/recordsdb
   ```

3. **Start with Docker**
   ```bash
   docker-compose up --build
   ```
   This will start both the Node.js application and MongoDB database.

4. **Initialize Sample Data**
   ```bash
   docker-compose exec app npm run init-db
   ```

The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
├── public/                 # Static frontend files
│   ├── index.html         # Main HTML file
│   ├── app.js            # Frontend JavaScript
│   └── styles.css        # CSS styles
├── scripts/
│   └── initDb.js         # Database initialization script
├── index.js              # Main application file
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
└── package.json          # Project dependencies
```

## 💡 API Endpoints

- `GET /records` - Retrieve all records
- `GET /search?q={query}` - Search records
- `POST /update` - Update a record
- `POST /api/chat` - Chat interface for natural language queries
- `GET /health` - Health check endpoint

## 🔒 Data Schema

```javascript
Record {
  id: Number,       // Unique identifier
  name: String,     // Record name
  value: String     // Record value
}
```

## 🎯 Features in Detail

### Chat Interface
The application includes an AI-powered chat interface that can:
- Process natural language queries about records
- Filter data by industry, type, and status
- Provide statistical summaries
- Return relevant record matches
- Support data visualization

### Data Management
- Robust error handling
- Input validation
- MongoDB connection retry logic
- Pagination and search optimization

## 🛡️ Security Features

- Input validation using express-validator
- Error handling middleware
- Environment-based error responses
- CORS protection
- Docker container isolation

## 🔄 Docker Configuration

The application uses Docker Compose to manage:
- Node.js application container
- MongoDB container with persistent volume
- Health checks for database availability
- Container networking and port mapping

## 📈 Performance Considerations

- Database query optimization with indexes
- Results pagination
- Efficient frontend rendering
- Containerized deployment
- Database connection pooling

## 🧠 Model Context Protocol (MCP) Implementation

The application implements the Model Context Protocol (MCP) for handling natural language interactions with the database. MCP provides a standardized way to process queries and maintain context across conversations.

### MCP Components

- **Intent Classification**: Uses a Bayesian classifier to categorize user queries into three main intents:
  - `list` - Displaying records (e.g., "show all records", "what records do you have")
  - `search` - Finding specific records (e.g., "find Healthcare records", "search for Technology projects")
  - `analyze` - Statistical analysis (e.g., "show distribution by sector", "compare sectors")

- **Context Management**: Maintains conversation context to improve query understanding
  - Remembers previous queries and their results
  - Tracks current data filtering state
  - Manages visualization preferences

- **Response Generation**: Smart response formatting based on:
  - Query intent
  - Result size
  - Data characteristics
  - Visualization requirements

### Natural Language Processing (NLP)

The application uses a custom NLP pipeline built with the `natural` npm package:

- **Tokenization**: Breaks down user queries into meaningful tokens
- **Classification**: Bayesian classifier for intent recognition
- **Pattern Matching**: Advanced text matching for sector and category identification
- **Response Generation**: Context-aware response formatting

### Visualization Intelligence

The system automatically determines the most appropriate visualization based on:
- Query intent (`analyze` → charts, `list` → tables)
- Result set size (large sets → tables, small sets → lists)
- Data characteristics (distributions → pie charts)

### Example Interactions

```
User: "what records do you have"
→ Returns: Full record list with table visualization

User: "find records in Healthcare"
→ Returns: Filtered Healthcare records with table visualization

User: "show distribution of records by sector"
→ Returns: Sector distribution with pie chart visualization
```

### Performance Optimizations

- **Caching**: Frequently used classification patterns
- **Intelligent Filtering**: Optimized search term extraction
- **Response Optimization**: Dynamic result limiting based on context
- **Visualization Hints**: Frontend rendering guidance for optimal display

### Natural Language Processing Implementation

The application uses a lightweight, local NLP implementation based on the `natural` npm package instead of an external LLM service. This approach offers several advantages:

- **Privacy**: All processing happens locally, no data leaves your system
- **Speed**: No network latency from API calls
- **Cost-effective**: No usage fees or API costs
- **Offline capability**: Works without internet connectivity

#### NLP Components Used

- **Tokenizer**: `natural.WordTokenizer()`
  - Breaks queries into individual words
  - Handles punctuation and special characters
  - Language-aware token separation

- **Classifier**: `natural.BayesClassifier()`
  - Trained on domain-specific examples
  - Identifies query intents (list, search, analyze)
  - Uses Bayesian probability for classification

#### Training Data

The classifier is trained on common query patterns:
```javascript
// List intent examples
- "what records do you have"
- "show all records"
- "display records"
- "get all records"
- "list everything"

// Search intent examples
- "find records in Healthcare"
- "search for Technology projects"
- "look up finance records"
- "show records in education"

// Analysis intent examples
- "show statistics"
- "analyze records"
- "show distribution"
- "compare sectors"
```

This focused, domain-specific training allows for accurate intent classification without the complexity and overhead of a full LLM.

## 📊 Data Visualization

The application uses Chart.js for dynamic data visualization:

- **Pie Charts**: Sector distributions
- **Bar Charts**: Comparative analysis
- **Tables**: Large dataset display
- **Lists**: Compact result presentation

### Visualization Selection Logic

```javascript
function determineVisualization(intent, results) {
    if (results.length === 0) return null;
    
    switch (intent) {
        case 'analyze': return 'chart';
        case 'search': return results.length > 10 ? 'table' : 'list';
        case 'list': return 'table';
        default: return 'table';
    }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## Running the Project in GitHub Codespaces

This project can be run using GitHub Codespaces. The `.devcontainer` directory has been added to configure the development environment.

### Steps to Open the Project in GitHub Codespaces

1. **Open the Repository in GitHub**
   Navigate to the repository on GitHub.

2. **Create a New Codespace**
   Click on the `Code` button and select `Open with Codespaces`. If you don't have any existing Codespaces, create a new one.

3. **Wait for the Environment to Set Up**
   GitHub Codespaces will automatically set up the development environment based on the configuration in the `.devcontainer` directory.

4. **Start the Application**
   Once the environment is ready, start the application using the terminal in Codespaces:
   ```bash
   docker-compose up --build
   ```

5. **Access the Application**
   The application will be available at the forwarded port provided by Codespaces.
