// Load environment variables first
require('dotenv').config({ path: __dirname + '/.env' });

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const speech = require('@google-cloud/speech');

// Initialize Google Speech-to-Text client
const speechClient = new speech.SpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-credentials.json'
});

// Initialize Supabase client (shared instance)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Successfully loaded environment variables and connected to Supabase.');
console.log(`🔑 Using ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE' : 'ANON'} key for backend operations`);
console.log('🎤 Google Speech-to-Text client initialized');

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// --- Endpoint 1: Job List (Keep as-is) ---
app.get('/api/opportunities', async (req, res) => {
  try {
    // Fetch active opportunities from Supabase database
    const { data: opportunities, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching opportunities:', error);
      throw error;
    }

    console.log(`✅ Fetched ${opportunities.length} opportunities from database`);
    res.json(opportunities);

  } catch (error) {
    console.error('❌ Error in /api/opportunities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch opportunities'
    });
  }
});

// --- NEW Endpoint 2: Per-Question Answer Submission ---
app.post('/api/audition/submit-answer', upload.single('audio_file'), async (req, res) => {
  try {
    console.log('📥 Received per-question submission');
    
    // A. Get Data from request body
    const { opportunityId, userId, questionId, questionText } = req.body;
    
    console.log(`  └─ User: ${userId}`);
    console.log(`  └─ Opportunity: ${opportunityId}`);
    console.log(`  └─ Question: ${questionId}`);
    console.log(`  └─ Question Text: ${questionText}`);

    // Validate required fields
    if (!opportunityId || !userId || !questionId || !questionText) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: opportunityId, userId, questionId, or questionText'
      });
    }

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    const file = req.file;
    console.log(`📦 File received: ${file.originalname} (${(file.size / 1024).toFixed(2)} KB)`);

    // B. Upload File to Supabase Storage
    const timestamp = Date.now();
    const filePath = `answers/${userId}/${opportunityId}/${questionId}_${timestamp}.webm`;
    
    console.log(`⬆️  Uploading to Supabase Storage: ${filePath}`);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audition-recordings')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      throw new Error(`Failed to upload audio: ${uploadError.message}`);
    }

    console.log(`✅ File uploaded successfully`);

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('audition-recordings')
      .getPublicUrl(filePath);

    // C. Transcribe Audio with Google Speech-to-Text
    console.log('🎤 Transcribing audio with Google Speech-to-Text...');
    
    let transcript = '';
    
    try {
      const audioBytes = file.buffer.toString('base64');
      
      const request = {
        audio: {
          content: audioBytes,
        },
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: 'en-US',
          enableAutomaticPunctuation: true,
        },
      };

      const [response] = await speechClient.recognize(request);
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
      
      transcript = transcription || '[No speech detected]';
      console.log(`✅ Transcription complete: "${transcript.substring(0, 100)}${transcript.length > 100 ? '...' : ''}"`);
      
    } catch (transcriptionError) {
      console.warn('⚠️  Transcription failed:', transcriptionError.message);
      transcript = '[Transcription unavailable]';
    }

    // D. Save to Database (audition_answers table)
    console.log('💾 Saving answer to database...');

    const { data: answerData, error: dbError } = await supabase
      .from('audition_answers')
      .insert({
        user_id: userId,
        opportunity_id: opportunityId,
        question_id: questionId,
        question_text: questionText,
        audio_url: publicUrl,
        audio_path: filePath,
        transcript: transcript,
        submitted_at: new Date().toISOString()
      })
      .select();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      throw new Error(`Failed to save answer: ${dbError.message}`);
    }

    console.log(`✅ Answer saved to database (ID: ${answerData[0].id})`);

    // E. Respond with success
    res.status(200).json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        answerId: answerData[0].id,
        audioUrl: publicUrl,
        transcript: transcript,
        questionId: questionId
      }
    });

  } catch (error) {
    console.error('❌ Error in submit-answer:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process answer submission'
    });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
  console.log(`📡 Endpoints available:`);
  console.log(`   GET  /api/opportunities`);
  console.log(`   POST /api/audition/submit-answer`);
});


// --- Endpoint 1: Job List ---
app.get('/api/opportunities', async (req, res) => {
  try {
    // Fetch active opportunities from Supabase database
    const { data: opportunities, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching opportunities:', error);
      throw error;
    }

    console.log(`✅ Fetched ${opportunities.length} opportunities from database`);
    res.json(opportunities);

  } catch (error) {
    console.error('❌ Error in /api/opportunities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch opportunities'
    });
  }
});

// --- Endpoint 2: Submission Inbox ---

// --- Endpoint 1: Job List ---
app.get('/api/opportunities', (req, res) => {
  const opportunities = [
    {
      id: "1",
      title: "Backend Engineer",
      company: "Vetted AI",
      location: "Remote (Global)",
      type: "Contract",
      rate: "$90/hr",
      skills: ["Node.js", "Supabase", "Express"],
      questions: [
        "Tell us about a project you are proud of.",
        "How do you structure scalable APIs?",
        "Explain a time you optimized backend performance."
      ]
    },
    {
      id: "2",
      title: "Frontend Developer",
      company: "CongratsAI",
      location: "Remote (Europe)",
      type: "Full-time",
      rate: "$70/hr",
      skills: ["React", "Tailwind", "TypeScript"],
      questions: [
        "Describe your approach to responsive design.",
        "How do you handle component state efficiently?",
        "Show us your favorite UI you built."
      ]
    },
    {
      id: "3",
      title: "ML Engineer",
      company: "VisionFlow",
      location: "Hybrid (Paris)",
      type: "Contract",
      rate: "$100/hr",
      skills: ["Python", "TensorFlow", "FastAPI"],
      questions: [
        "How do you preprocess large datasets?",
        "What’s your experience with production ML pipelines?",
        "How do you handle model versioning?"
      ]
    }
  ];

  res.json(opportunities);
});

// --- Endpoint 2: Submission Inbox ---
app.post('/api/submit-audition', upload.array('audio_files'), async (req, res) => {
  try {
    console.log('📥 Received opportunityId:', req.body.opportunityId);
    console.log('📥 Received userId:', req.body.userId);
    console.log('📥 Received files count:', req.files?.length || 0);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No audio files provided'
      });
    }

    const uploadedFilePaths = [];

    // Loop through each file and upload to Supabase Storage
    for (const file of req.files) {
      // Create unique file path: public/{opportunityId}/{originalname}
      const filePath = `public/${req.body.opportunityId}/${file.originalname}`;
      
      console.log(`⬆️  Uploading ${file.originalname} to Supabase Storage...`);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('audition-recordings')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true // Allow overwriting if file exists
        });

      if (error) {
        console.error('❌ Upload error:', error);
        throw new Error(`Failed to upload ${file.originalname}: ${error.message}`);
      }

      console.log(`✅ Uploaded: ${filePath}`);
      uploadedFilePaths.push(filePath);
    }

    // Get data from request body
    const { opportunityId, userId } = req.body;
    const questions = JSON.parse(req.body.questions);

    console.log('💾 Saving submission to database...');

    // Insert submission record into database
    const { data: submissionData, error: dbError } = await supabase
      .from('audition_submissions')
      .insert({
        opportunity_id: opportunityId,
        user_id: userId,
        questions: questions,
        audio_urls: uploadedFilePaths,
        status: 'pending'
      })
      .select();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      throw new Error(`Failed to save submission: ${dbError.message}`);
    }

    console.log('✅ Submission saved to database:', submissionData[0].id);

    // Send success response with the newly created submission
    res.status(200).json({
      success: true,
      submission: submissionData[0]
    });

  } catch (error) {
    console.error('❌ Error in submit-audition:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to process submission'
    });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
});
