// Direct API test for Gemini
require('dotenv').config({ path: __dirname + '/.env' });

async function testGeminiDirect() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('🔑 API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND');
  console.log('🌐 Testing direct API call...\n');
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    // Test 1: List available models
    console.log('📋 Step 1: Listing available models...');
    const listResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!listResponse.ok) {
      console.error(`❌ List models failed: ${listResponse.status} ${listResponse.statusText}`);
      const errorText = await listResponse.text();
      console.error('Response:', errorText);
      
      if (listResponse.status === 403) {
        console.error('\n💡 403 Forbidden - Your API key may be:');
        console.error('   1. Invalid or expired');
        console.error('   2. Not enabled for Gemini API');
        console.error('   3. Missing required permissions');
        console.error('\n🔧 To fix:');
        console.error('   1. Go to https://aistudio.google.com/app/apikey');
        console.error('   2. Create a new API key');
        console.error('   3. Replace GEMINI_API_KEY in .env file');
      }
      return;
    }
    
    const models = await listResponse.json();
    console.log('✅ Available models:');
    models.models?.forEach(m => {
      if (m.supportedGenerationMethods?.includes('generateContent')) {
        console.log(`   - ${m.name.split('/').pop()}`);
      }
    });
    
    // Test 2: Simple text generation
    console.log('\n📝 Step 2: Testing text generation...');
    const textResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
      console.error(`❌ Text generation failed: ${textResponse.status}`);
      const errorText = await textResponse.text();
      console.error('Response:', errorText);
      return;
    }
    
    const textResult = await textResponse.json();
    console.log('✅ Text generation works!');
    console.log('   Response:', textResult.candidates?.[0]?.content?.parts?.[0]?.text);
    
    console.log('\n🎉 API Key is valid! Audio transcription should work.');
    console.log('💡 Use model name: "gemini-1.5-flash" or "gemini-1.5-pro"');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

testGeminiDirect();
