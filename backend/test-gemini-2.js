// Test Gemini 2.0 with audio transcription
require('dotenv').config({ path: __dirname + '/.env' });

async function testGemini20() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('🧪 Testing Gemini 2.0 Flash for audio transcription...\n');
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Test text generation first
    console.log('📝 Step 1: Testing text generation with gemini-2.0-flash...');
    const textResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: "Say hello in one word" }]
          }]
        })
      }
    );
    
    if (!textResponse.ok) {
      console.error(`❌ Failed: ${textResponse.status}`);
      const errorText = await textResponse.text();
      console.error('Response:', errorText);
      return;
    }
    
    const textResult = await textResponse.json();
    console.log('✅ gemini-2.0-flash works!');
    console.log('   Response:', textResult.candidates?.[0]?.content?.parts?.[0]?.text);
    
    // Check if it supports audio
    console.log('\n📋 Step 2: Checking model capabilities...');
    const modelResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash?key=${apiKey}`
    );
    
    if (modelResponse.ok) {
      const modelInfo = await modelResponse.json();
      console.log('✅ Model info retrieved');
      console.log('   Supported methods:', modelInfo.supportedGenerationMethods);
      console.log('   Input token limit:', modelInfo.inputTokenLimit);
      
      // Check for audio support in description
      if (modelInfo.description) {
        console.log('   Description:', modelInfo.description.substring(0, 200));
      }
    }
    
    console.log('\n🎉 Setup complete!');
    console.log('💡 Your server should now use: gemini-2.0-flash');
    console.log('⚠️  Note: If audio still fails, Gemini 2.0 may not support audio/webm format');
    console.log('   Consider converting to audio/wav or audio/mp3 on the frontend');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGemini20();
