const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/recordsdb';

// Define Record Schema
const Record = mongoose.model('Record', {
  id: Number,
  name: String,
  value: String
});

const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail'];
const types = ['Client', 'Project', 'Product', 'Service', 'Report'];
const statuses = ['Active', 'Pending', 'Completed', 'Archived'];

async function generateDemoRecords() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing records
    await Record.deleteMany({});
    console.log('Cleared existing records');

    // Generate 100 demo records
    const demoRecords = Array.from({ length: 100 }, (_, i) => {
      const industry = industries[i % industries.length];
      const type = types[i % types.length];
      const status = statuses[i % statuses.length];
      const recordNumber = Math.floor(i / 5) + 1;
      
      return {
        id: i + 1,
        name: `${type} ${recordNumber} - ${industry}`,
        value: `${status} ${type.toLowerCase()} in ${industry} sector, Record #${i + 1}`
      };
    });

    await Record.insertMany(demoRecords);
    console.log('Successfully inserted 100 demo records');
    
    // Log a few sample records
    const sampleRecords = await Record.find().limit(3);
    console.log('Sample records:', sampleRecords);

  } catch (error) {
    console.error('Error generating demo data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

generateDemoRecords();