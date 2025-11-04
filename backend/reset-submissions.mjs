import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Initialize Supabase client with SERVICE ROLE KEY
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetSubmissions() {
  console.log('🔄 Resetting all audition submissions...\n');

  try {
    // Delete all submissions
    const { data: deletedSubmissions, error: submissionsError } = await supabase
      .from('audition_submissions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except a non-existent ID

    if (submissionsError) {
      console.error('❌ Error deleting submissions:', submissionsError);
      throw submissionsError;
    }

    console.log('✅ All submissions deleted\n');

    // Delete all answers
    const { data: deletedAnswers, error: answersError } = await supabase
      .from('audition_answers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (answersError) {
      console.error('❌ Error deleting answers:', answersError);
      throw answersError;
    }

    console.log('✅ All answers deleted\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SUCCESS! All submissions reset');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✓ You can now apply to all opportunities again');
    console.log('✓ Refresh your frontend to see the changes');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ FAILED: Reset encountered an error');
    console.error('Error details:', error);
    process.exit(1);
  }
}

// Run the reset
resetSubmissions();