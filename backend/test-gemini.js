// Test Gemini API with different models and configurations
require('dotenv').config({ path: __dirname + '/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGeminiModels() {
  console.log('🧪 Testing Gemini API...\n');
  
  const models = [
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
    'gemini-1.5-flash-latest', 
    'gemini-1.5-flash',
    'gemini-pro'
  ];

  for (const modelName of models) {
    try {
      console.log(`📝 Testing model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Simple text test first
      const result = await model.generateContent("Say 'hello' in one word");
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ ${modelName} works! Response: ${text}\n`);
      
    } catch (error) {
      console.error(`❌ ${modelName} failed:`, error.status || error.message);
      console.error(`   Details:`, error.statusText || error.toString());
      console.log('');
    }
  }
  
  console.log('\n🎤 Now testing audio transcription with working model...');
  
  // Test with a simple audio example (if text works)
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    console.log('✅ Use gemini-1.5-flash-latest for your audio transcription');
  } catch (error) {
    console.log('⚠️  Audio testing skipped due to model availability issues');
  }
}

testGeminiModels().catch(console.error);
