#!/usr/bin/env node

/**
 * Test script to verify Supabase Auditions database connection
 * Run with: node test-connection.js
 */

require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Auditions Supabase Connection...\n');
  console.log(`📡 URL: ${supabaseUrl}\n`);

  try {
    // Test 1: Check if opportunities table exists
    console.log('Test 1: Fetching opportunities...');
    const { data: opportunities, error: oppError } = await supabase
      .from('opportunities')
      .select('id, title, company')
      .limit(5);

    if (oppError) {
      console.error('❌ Failed:', oppError.message);
      console.log('\n💡 Hint: Run schema.sql in Supabase SQL Editor first!');
      return;
    }

    console.log(`✅ Success! Found ${opportunities.length} opportunities:`);
    opportunities.forEach((opp, i) => {
      console.log(`   ${i + 1}. ${opp.title} at ${opp.company}`);
    });

    // Test 2: Check if storage bucket exists
    console.log('\nTest 2: Checking storage buckets...');
    const { data: buckets, error: bucketError } = await supabase
      .storage
      .listBuckets();

    if (bucketError) {
      console.error('❌ Failed:', bucketError.message);
      return;
    }

    const auditionBucket = buckets.find(b => b.name === 'audition-recordings');
    if (auditionBucket) {
      console.log('✅ Storage bucket "audition-recordings" exists!');
    } else {
      console.log('⚠️  Storage bucket "audition-recordings" NOT found!');
      console.log('   Create it in Supabase Dashboard > Storage');
    }

    // Test 3: Check submissions table
    console.log('\nTest 3: Checking audition_submissions table...');
    const { count, error: countError } = await supabase
      .from('audition_submissions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Failed:', countError.message);
      return;
    }

    console.log(`✅ audition_submissions table exists! Current count: ${count}`);

    // Test 4: Check proctoring_snapshots table
    console.log('\nTest 4: Checking proctoring_snapshots table...');
    const { count: snapCount, error: snapError } = await supabase
      .from('proctoring_snapshots')
      .select('*', { count: 'exact', head: true });

    if (snapError) {
      console.error('❌ Failed:', snapError.message);
      return;
    }

    console.log(`✅ proctoring_snapshots table exists! Current count: ${snapCount}`);

    console.log('\n' + '='.repeat(50));
    console.log('🎉 ALL TESTS PASSED!');
    console.log('='.repeat(50));
    console.log('\nYour Auditions database is ready to use! 🚀');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    console.error('\n📋 Stack trace:', error.stack);
  }
}

// Run tests
testConnection();
