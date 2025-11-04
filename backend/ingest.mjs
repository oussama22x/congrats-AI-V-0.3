import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Initialize Supabase client with SERVICE ROLE KEY to bypass RLS
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service role for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env file');
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Opportunity IDs from opportunities table
const PRODUCT_ROLE_ID = '550e8400-e29b-41d4-a716-446655440001';
const SENIOR_BACKEND_ID = '550e8400-e29b-41d4-a716-446655440002';
const ML_ENGINEER_ID = '550e8400-e29b-41d4-a716-446655440003';
const FRONTEND_DEVELOPER_ID = '550e8400-e29b-41d4-a716-446655440004';
const DEVOPS_ENGINEER_ID = '550e8400-e29b-41d4-a716-446655440005';
const DATA_SCIENTIST_ID = '550e8400-e29b-41d4-a716-446655440006';
const UX_UI_DESIGNER_ID = '550e8400-e29b-41d4-a716-446655440007';
const BLOCKCHAIN_DEV_ID = '550e8400-e29b-41d4-a716-446655440008';
const MOBILE_DEV_ID = '550e8400-e29b-41d4-a716-446655440009';

// Master Question Bank Data
const questionsToIngest = [
  // --- Product Role Questions (from Lemu's doc) ---
  { id: 'C1', dimension_key: 'cognitive_analytical', type: 'reasoning_probe', prompt: "You receive five new product ideas from founders after a user call. What is your first move to make sense of them?", time_limit_seconds: 90, opportunity_id: PRODUCT_ROLE_ID },
  { id: 'C2', dimension_key: 'cognitive_analytical', type: 'micro_simulation', prompt: "A founder says: 'We should gamify onboarding.' What is your next question—and why?", time_limit_seconds: 90, opportunity_id: PRODUCT_ROLE_ID },
  { id: 'C3', dimension_key: 'cognitive_analytical', type: 'reasoning_probe', prompt: "When data is ambiguous or missing, how do you decide whether to test, wait, or act?", time_limit_seconds: 90, opportunity_id: PRODUCT_ROLE_ID },
  { id: 'C4', dimension_key: 'cognitive_analytical', type: 'micro_simulation', prompt: "Activation drops this week. Explain how you'd determine if this is signal or noise.", time_limit_seconds: 90, opportunity_id: PRODUCT_ROLE_ID },
  { id: 'E1', dimension_key: 'execution_reliability', type: 'process_probe', prompt: "How do you ensure every product decision is traceable to a hypothesis or metric?", time_limit_seconds: 90, opportunity_id: PRODUCT_ROLE_ID },
  { id: 'E2', dimension_key: 'execution_reliability', type: 'simulation', prompt: "Outline your 'Discovery Tracker v1' structure. What minimal fields are required and why?", time_limit_seconds: 90, opportunity_id: PRODUCT_ROLE_ID },
  { id: 'E3', dimension_key: 'execution_reliability', type: 'reasoning_probe', prompt: "With multiple competing hypotheses, how do you choose what to run first?", time_limit_seconds: 90, opportunity_id: PRODUCT_ROLE_ID },
  { id: 'M1', dimension_key: 'communication_collaboration', type: 'micro_simulation', prompt: "Write a two-sentence async update to a founder summarizing a failed experiment.", time_limit_seconds: 90, opportunity_id: PRODUCT_ROLE_ID },
  { id: 'M2', dimension_key: 'communication_collaboration', type: 'process_probe', prompt: "How do you document and share learnings so the team can act without another meeting?", time_limit_seconds: 90, opportunity_id: PRODUCT_ROLE_ID },
  { id: 'M3', dimension_key: 'communication_collaboration', type: 'reflection', prompt: "Give an example of turning a vague founder comment into a clear shared decision.", time_limit_seconds: 90, opportunity_id: PRODUCT_ROLE_ID },
  { id: 'A1', dimension_key: 'adaptability_learning', type: 'micro_simulation', prompt: "A founder changes direction mid-sprint. What is your playbook in the next 24 hours?", time_limit_seconds: 90, opportunity_id: PRODUCT_ROLE_ID },
  { id: 'A2', dimension_key: 'adaptability_learning', type: 'reflection', prompt: "Tell us about a time you invalidated your own hypothesis. What changed next?", time_limit_seconds: 90, opportunity_id: PRODUCT_ROLE_ID },
  { id: 'A3', dimension_key: 'adaptability_learning', type: 'reasoning_probe', prompt: "How do you build feedback loops into your own workflow?", time_limit_seconds: 90, opportunity_id: PRODUCT_ROLE_ID },
  { id: 'Q1', dimension_key: 'emotional_intelligence', type: 'simulation', prompt: "How do you give feedback to a founder who bypassed the prioritization process?", time_limit_seconds: 90, opportunity_id: PRODUCT_ROLE_ID },
  { id: 'Q2', dimension_key: 'emotional_intelligence', type: 'reflection', prompt: "Describe a moment when team friction improved the outcome. What did you do?", time_limit_seconds: 90, opportunity_id: PRODUCT_ROLE_ID },
  { id: 'Q3', dimension_key: 'emotional_intelligence', type: 'reflection', prompt: "What signals tell you an engineer or founder is overwhelmed, and how do you respond?", time_limit_seconds: 90, opportunity_id: PRODUCT_ROLE_ID },
  { id: 'J1', dimension_key: 'judgment_ethics', type: 'simulation', prompt: "A discovery result contradicts a founder's belief. How do you present it?", time_limit_seconds: 90, opportunity_id: PRODUCT_ROLE_ID },
  { id: 'J2', dimension_key: 'judgment_ethics', type: 'reasoning_probe', prompt: "Define 'good enough evidence' before shipping in a high-velocity environment.", time_limit_seconds: 90, opportunity_id: PRODUCT_ROLE_ID },
  { id: 'J3', dimension_key: 'judgment_ethics', type: 'simulation', prompt: "A stakeholder pressures you to prioritize an item with no supporting data. What do you do?", time_limit_seconds: 90, opportunity_id: PRODUCT_ROLE_ID },
  { id: 'X1', dimension_key: 'communication_collaboration', type: 'deliverable', prompt: "Draft a 120–150 word founder update explaining your next-step decision and success metric for the coming week.", time_limit_seconds: 90, opportunity_id: PRODUCT_ROLE_ID },
  { id: 'X2', dimension_key: 'cognitive_analytical', type: 'deliverable', prompt: "Write a three-sentence hypothesis statement including the problem, metric, and decision rule.", time_limit_seconds: 90, opportunity_id: PRODUCT_ROLE_ID },

  // --- Senior Backend Engineer Questions ---
  { id: 'BE1', dimension_key: 'execution_reliability', type: 'simulation', prompt: "Describe how you would design a scalable database schema for a multi-tenant social media application.", time_limit_seconds: 90, opportunity_id: SENIOR_BACKEND_ID },
  { id: 'BE2', dimension_key: 'cognitive_analytical', type: 'reasoning_probe', prompt: "A critical API endpoint is experiencing a 50% spike in latency. What is your process to diagnose and fix this?", time_limit_seconds: 90, opportunity_id: SENIOR_BACKEND_ID },
  { id: 'BE3', dimension_key: 'judgment_ethics', type: 'reasoning_probe', prompt: "When is it appropriate to use a microservice architecture versus a monolith, and what are the main trade-offs?", time_limit_seconds: 90, opportunity_id: SENIOR_BACKEND_ID },

  // --- ML Engineer (Computer Vision) Questions ---
  { id: 'ML1', dimension_key: 'cognitive_analytical', type: 'reasoning_probe', prompt: "How would you approach a problem where you need to detect objects in low-light, blurry video footage?", time_limit_seconds: 90, opportunity_id: ML_ENGINEER_ID },
  { id: 'ML2', dimension_key: 'execution_reliability', type: 'process_probe', prompt: "Describe your process for building and validating a new dataset for a custom object detection model.", time_limit_seconds: 90, opportunity_id: ML_ENGINEER_ID },
  { id: 'ML3', dimension_key: 'cognitive_analytical', type: 'simulation', prompt: "Explain the difference between a CNN and a Vision Transformer (ViT) and when you would choose one over the other.", time_limit_seconds: 90, opportunity_id: ML_ENGINEER_ID },

  // --- UX/UI Designer Questions ---
  { id: 'UX1', dimension_key: 'cognitive_analytical', type: 'reasoning_probe', prompt: "A user testing session shows that 70% of users are dropping off at the new sign-up page. What is your process to identify the core problem?", time_limit_seconds: 90, opportunity_id: UX_UI_DESIGNER_ID },
  { id: 'UX2', dimension_key: 'communication_collaboration', type: 'simulation', prompt: "You receive feedback from an engineer that your high-fidelity design is too complex to build in the current sprint. How do you respond?", time_limit_seconds: 90, opportunity_id: UX_UI_DESIGNER_ID },
  { id: 'UX3', dimension_key: 'execution_reliability', type: 'process_probe', prompt: "Walk me through your process of creating a design system component, from initial concept to handoff-ready specifications.", time_limit_seconds: 90, opportunity_id: UX_UI_DESIGNER_ID },

  // --- Blockchain Developer Questions ---
  { id: 'BC1', dimension_key: 'cognitive_analytical', type: 'reasoning_probe', prompt: "Explain the concept of 'gas fees' and how you would design a smart contract to optimize for gas usage.", time_limit_seconds: 90, opportunity_id: BLOCKCHAIN_DEV_ID },
  { id: 'BC2', dimension_key: 'judgment_ethics', type: 'simulation', prompt: "What are the security risks of an 'upgradeable' smart contract, and how do you mitigate them?", time_limit_seconds: 90, opportunity_id: BLOCKCHAIN_DEV_ID },
  { id: 'BC3', dimension_key: 'execution_reliability', type: 'process_probe', prompt: "Describe your testing workflow before deploying a new smart contract to the mainnet. What tools do you use?", time_limit_seconds: 90, opportunity_id: BLOCKCHAIN_DEV_ID },

  // --- Mobile Developer (iOS/Android) Questions ---
  { id: 'MD1', dimension_key: 'execution_reliability', type: 'process_probe', prompt: "How do you manage state in a complex mobile application? Describe your preferred method (e.g., Redux, Provider, Compose State).", time_limit_seconds: 90, opportunity_id: MOBILE_DEV_ID },
  { id: 'MD2', dimension_key: 'cognitive_analytical', type: 'reasoning_probe', prompt: "Your app is receiving reports of high battery drain. What are the first 3 things you would investigate?", time_limit_seconds: 90, opportunity_id: MOBILE_DEV_ID },
  { id: 'MD3', dimension_key: 'adaptability_learning', type: 'simulation', prompt: "Imagine you have to build a new feature that works on both iOS and Android. Would you choose native (Swift/Kotlin) or cross-platform (React Native/Flutter)? Explain your decision-making process.", time_limit_seconds: 90, opportunity_id: MOBILE_DEV_ID }
];

// Rubrics Data (from rubric_table.csv)
const rubricsToIngest = [
  { dimension_key: 'cognitive_analytical', weight: 0.25, anchor_1: "Unstructured; opinions; no test framing", anchor_2: "Identifies problems; weak metrics; partial framing", anchor_3: "Clear hypothesis + metric; basic structure", anchor_4: "Systemic links; clear decision rules; pragmatic next steps", anchor_5: "Elegant synthesis; teaches clarity; anticipates trade-offs" },
  { dimension_key: 'execution_reliability', weight: 0.20, anchor_1: "Theory only; no workflow; misses follow-through", anchor_2: "Ad hoc; tool-centric; light traceability", anchor_3: "Replicable process; minimal tracker; closes loops", anchor_4: "Lightweight system; consistent hygiene; measurable cadence", anchor_5: "Builds reusable templates; scales process across team" },
  { dimension_key: 'communication_collaboration', weight: 0.20, anchor_1: "Rambles; jargon; founders confused", anchor_2: "Verbose; requires meetings to clarify", anchor_3: "Async-ready; concise; actionable", anchor_4: "One-breath clarity; anticipates stakeholder needs", anchor_5: "Raises team bandwidth; teaches comms hygiene by example" },
  { dimension_key: 'adaptability_learning', weight: 0.15, anchor_1: "Defensive; resists change; stalls", anchor_2: "Slow to adapt; limited reflection", anchor_3: "Admits invalidation; iterates next step", anchor_4: "Calm under change; builds learning loops", anchor_5: "Sees patterns; preemptively adjusts systems" },
  { dimension_key: 'emotional_intelligence', weight: 0.10, anchor_1: "Blame tone; poor awareness", anchor_2: "Fragile under tension; avoids feedback", anchor_3: "Empathic and direct; respectful tone", anchor_4: "Balances empathy with assertion; preserves trust", anchor_5: "Elevates others; de-escalates and aligns quickly" },
  { dimension_key: 'judgment_ethics', weight: 0.10, anchor_1: "Avoids evidence; yields to pressure", anchor_2: "Unclear bar for action; vague rationale", anchor_3: "States evidence bar; explains trade-offs", anchor_4: "Holds truth with respect; documents rationale", anchor_5: "Defends user/business integrity under pressure" }
];

async function ingestData() {
  console.log('🚀 Starting data ingestion...\n');

  try {
    // Insert Questions
    console.log('📝 Inserting questions into database...');
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .upsert(questionsToIngest, { onConflict: 'id' });

    if (questionsError) {
      console.error('❌ Error inserting questions:', questionsError);
      throw questionsError;
    }

    console.log(`✅ Successfully inserted ${questionsToIngest.length} questions`);
    console.log(`   Question IDs: ${questionsToIngest.map(q => q.id).join(', ')}\n`);

    // Insert Rubrics
    console.log('📊 Inserting rubrics into database...');
    const { data: rubricsData, error: rubricsError } = await supabase
      .from('rubrics')
      .upsert(rubricsToIngest, { onConflict: 'dimension_key' });

    if (rubricsError) {
      console.error('❌ Error inserting rubrics:', rubricsError);
      throw rubricsError;
    }

    console.log(`✅ Successfully inserted ${rubricsToIngest.length} rubrics`);
    console.log(`   Dimensions: ${rubricsToIngest.map(r => r.dimension_key).join(', ')}\n`);

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SUCCESS! Data ingestion completed');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✓ Questions: ${questionsToIngest.length}`);
    console.log(`✓ Rubrics: ${rubricsToIngest.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ FAILED: Data ingestion encountered an error');
    console.error('Error details:', error);
    process.exit(1);
  }
}

// Run the ingestion
ingestData();
