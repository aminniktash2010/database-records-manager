const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const { body, query, validationResult } = require('express-validator');
require('dotenv').config();

const nlpService = require('./services/mcpService');
const llmService = require('./services/llmService');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection with retry logic
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/recordsdb';

async function connectWithRetry() {
  const maxRetries = 5;
  for (let i = 0; i < maxRetries; i++) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${i + 1} failed:`, err);
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  throw new Error('Failed to connect to MongoDB after multiple attempts');
}

// Define Record Schema with validation
const recordSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  value: { type: String, required: true, trim: true }
});

const Record = mongoose.model('Record', recordSchema);

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Validation middleware
const validateRecord = [
  body('id').isInt().withMessage('ID must be an integer'),
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('value').trim().isLength({ min: 1 }).withMessage('Value is required')
];

// Initialize some sample data if none exists
async function initializeData() {
  const count = await Record.countDocuments();
  if (count === 0) {
    await Record.create([
      { id: 1, name: 'Record 1', value: 'Value 1' },
      { id: 2, name: 'Record 2', value: 'Value 2' }
    ]);
    console.log('Sample data initialized');
  }
}
initializeData().catch(console.error);

// Routes
app.get('/search', [
  query('q').optional().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const query = req.query.q?.toLowerCase() || '';
    const results = await Record.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { value: { $regex: query, $options: 'i' } }
      ]
    }).limit(50); // Limit results for better performance

    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error searching records'
    });
  }
});

app.post('/update', validateRecord, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const { id, name, value } = req.body;
    const record = await Record.findOne({ id });
    
    if (!record) {
      return res.status(404).json({ 
        success: false,
        message: 'Record not found' 
      });
    }

    record.name = name;
    record.value = value;
    await record.save();

    res.json({
      success: true,
      message: 'Record updated successfully',
      record
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating record'
    });
  }
});

app.get('/records', async (req, res) => {
  try {
    const records = await Record.find({}).sort({ id: 1 });
    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching records'
    });
  }
});

// Update chat analysis endpoint to use NLP service and LLM service
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }
    
    // Fetch all records for context
    const records = await Record.find({});
    
    // First try NLP service for structured queries
    const nlpResponse = await nlpService.processQuery(message, records);
    
    // If NLP service doesn't produce meaningful results, use LLM
    if (!nlpResponse.data && !nlpResponse.visualization) {
      const llmResponse = await llmService.getChatResponse(message);
      res.json(llmResponse);
      return;
    }

    res.json(nlpResponse);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error processing chat request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint for Azure
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Start server after ensuring database connection
async function startServer() {
  try {
    await connectWithRetry();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();