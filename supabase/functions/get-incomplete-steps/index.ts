import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StepRequirements {
  [step: number]: {
    fields: string[];
    checkFunction?: (profile: any, skillsCount: number, hasResume: boolean) => boolean;
  };
}

const STEP_REQUIREMENTS: StepRequirements = {
  1: {
    fields: ['first_name', 'last_name'],
    checkFunction: (profile) => !!(profile.first_name && profile.last_name),
  },
  2: {
    fields: ['linkedin_url'],
    checkFunction: (profile) => !!profile.linkedin_url,
  },
  3: {
    fields: [],
    checkFunction: (_, skillsCount) => skillsCount > 0,
  },
  4: {
    fields: ['experience_level'],
    checkFunction: (profile) => !!profile.experience_level,
  },
  5: {
    fields: ['desired_roles'],
    checkFunction: (profile) => Array.isArray(profile.desired_roles) && profile.desired_roles.length > 0,
  },
  6: {
    fields: ['work_arrangements', 'location_preferences', 'current_city', 'current_country', 'start_timing'],
    checkFunction: (profile) => {
      return (
        Array.isArray(profile.work_arrangements) && profile.work_arrangements.length > 0 &&
        Array.isArray(profile.location_preferences) && profile.location_preferences.length > 0 &&
        !!profile.current_city &&
        !!profile.current_country &&
        !!profile.start_timing
      );
    },
  },
  7: {
    fields: ['desired_salary_min', 'desired_salary_max'],
    checkFunction: (profile) => {
      return !!profile.desired_salary_min && !!profile.desired_salary_max;
    },
  },
  8: {
    fields: ['resume'],
    checkFunction: (_, __, hasResume) => hasResume,
  },
  9: {
    fields: ['onboarding_completed'],
    checkFunction: (profile) => !!profile.onboarding_completed,
  },
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Checking incomplete steps for user:', user.id);

    // Fetch user's profile
    const { data: profile, error: profileError } = await supabase
      .from('talent_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user's skills count
    const { count: skillsCount, error: skillsError } = await supabase
      .from('talent_skills')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (skillsError) {
      console.error('Skills count error:', skillsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch skills' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has resume
    const { count: resumeCount } = await supabase
      .from('talent_files')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('file_type', 'resume');

    const hasResume = (resumeCount || 0) > 0;

    // Determine incomplete steps
    const incompleteSteps: number[] = [];
    const completedSteps: number[] = [];
    const totalSteps = Object.keys(STEP_REQUIREMENTS).length;

    for (let step = 1; step <= totalSteps; step++) {
      const requirement = STEP_REQUIREMENTS[step];
      const isComplete = requirement.checkFunction
        ? requirement.checkFunction(profile, skillsCount || 0, hasResume)
        : true;

      if (isComplete) {
        completedSteps.push(step);
      } else {
        incompleteSteps.push(step);
      }
    }

    // Check if user has completed vetting
    const { count: vettingCount } = await supabase
      .from('vetting_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    const hasCompletedVetting = (vettingCount || 0) > 0;

    // Calculate weighted progress
    // Wizard steps = 60% total (each step = 60/9 ≈ 6.67%)
    // Vetting = 40% total
    const wizardProgress = Math.round((completedSteps.length / totalSteps) * 60);
    const vettingProgress = hasCompletedVetting ? 40 : 0;
    const overallProgress = wizardProgress + vettingProgress;

    console.log('Incomplete steps:', incompleteSteps);
    console.log('Completed steps:', completedSteps);
    console.log('Wizard progress:', wizardProgress);
    console.log('Vetting progress:', vettingProgress);
    console.log('Overall progress:', overallProgress);

    return new Response(
      JSON.stringify({
        incompleteSteps,
        completedSteps,
        totalSteps,
        progress: overallProgress,
        wizardProgress,
        vettingProgress,
        hasCompletedVetting,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-incomplete-steps:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
