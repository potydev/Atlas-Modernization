import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';

// Quick check: skip Supabase entirely if env vars are placeholders
const useSupabase = isSupabaseConfigured();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      budget_digital_infra,
      budget_education,
      budget_research,
      budget_subsidy,
      projected_gdp,
      projected_employment,
      modernization_index,
    } = body;

    // Validate
    if (
      typeof budget_digital_infra !== 'number' ||
      typeof budget_education !== 'number' ||
      typeof budget_research !== 'number' ||
      typeof budget_subsidy !== 'number'
    ) {
      return NextResponse.json({ error: 'Invalid budget allocation' }, { status: 400 });
    }

    const total = budget_digital_infra + budget_education + budget_research + budget_subsidy;
    if (total !== 100) {
      return NextResponse.json({ error: 'Total budget must equal 100%' }, { status: 400 });
    }

    const run = {
      id: crypto.randomUUID(),
      budget_digital_infra,
      budget_education,
      budget_research,
      budget_subsidy,
      projected_gdp: projected_gdp || 0,
      projected_employment: projected_employment || 0,
      modernization_index: modernization_index || 0,
      created_at: new Date().toISOString(),
    };

    // Try Supabase only if configured
    if (useSupabase) {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { error } = await supabase.from('simulator_runs').insert(run);
        if (!error) {
          return NextResponse.json({ success: true, run });
        }
      } catch {
        // Supabase not configured
      }
    }

    return NextResponse.json({ success: true, run });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
