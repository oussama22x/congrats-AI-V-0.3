import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Initialize Supabase client with SERVICE ROLE KEY
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env file');
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// All 9 opportunities from server.js
const opportunities = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "Product Role (Internal)",
    company: "Vetted AI",
    location: "Remote (Global)",
    type: "Full-time",
    rate: "N/A",
    skills: ["Product Management", "Design", "Strategy"],
    questions: [],
    status: "active"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Senior Backend Engineer",
    company: "CongratsAI",
    location: "Remote (Europe)",
    type: "Contract",
    rate: "$90-120/hr",
    skills: ["Node.js", "PostgreSQL", "Express", "Supabase", "TypeScript"],
    questions: [],
    status: "active"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    title: "ML Engineer (Computer Vision)",
    company: "VisionFlow AI",
    location: "Hybrid (Paris)",
    type: "Full-time",
    rate: "€80-100/hr",
    skills: ["Python", "TensorFlow", "PyTorch", "Computer Vision", "Docker"],
    questions: [],
    status: "active"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    title: "Frontend Developer (React)",
    company: "StreamTech Inc",
    location: "Remote (US)",
    type: "Full-time",
    rate: "$70-95/hr",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL"],
    questions: [],
    status: "active"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    title: "DevOps Engineer",
    company: "CloudScale Systems",
    location: "Hybrid (London)",
    type: "Contract",
    rate: "£85-110/hr",
    skills: ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD"],
    questions: [],
    status: "active"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    title: "Data Scientist",
    company: "InsightLabs",
    location: "Remote (Canada)",
    type: "Full-time",
    rate: "$80-105/hr",
    skills: ["Python", "SQL", "Machine Learning", "Statistics", "Data Visualization"],
    questions: [],
    status: "active"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    title: "UX/UI Designer",
    company: "DesignHub Co",
    location: "Remote (Australia)",
    type: "Full-time",
    rate: "$65-90/hr",
    skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Interaction Design"],
    questions: [],
    status: "active"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    title: "Blockchain Developer",
    company: "CryptoTech Labs",
    location: "Remote (Singapore)",
    type: "Contract",
    rate: "$100-140/hr",
    skills: ["Solidity", "Web3.js", "Smart Contracts", "Ethereum", "DeFi"],
    questions: [],
    status: "active"
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    title: "Mobile Developer (iOS/Android)",
    company: "AppWorks Studio",
    location: "Hybrid (Berlin)",
    type: "Full-time",
    rate: "€75-100/hr",
    skills: ["Swift", "Kotlin", "React Native", "Mobile UI", "App Store Optimization"],
    questions: [],
    status: "active"
  }
];

async function insertOpportunities() {
  console.log('🚀 Inserting all 9 opportunities into database...\n');

  try {
    // Upsert opportunities (insert or update if already exists)
    const { data, error } = await supabase
      .from('opportunities')
      .upsert(opportunities, { onConflict: 'id' });

    if (error) {
      console.error('❌ Error inserting opportunities:', error);
      throw error;
    }

    console.log('✅ Successfully inserted/updated all opportunities!');
    console.log(`   Total opportunities: ${opportunities.length}`);
    console.log('\n📋 Opportunity List:');
    opportunities.forEach((opp, index) => {
      console.log(`   ${index + 1}. ${opp.title} - ${opp.company} (${opp.location})`);
    });
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SUCCESS! All opportunities are now in database');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ FAILED: Error inserting opportunities');
    console.error('Error details:', error);
    process.exit(1);
  }
}

// Run the insertion
insertOpportunities();
