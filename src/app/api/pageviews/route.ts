import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';

// Quick check: skip Supabase entirely if env vars are placeholders
const useSupabase = isSupabaseConfigured();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { section } = body;

    if (!section) {
      return NextResponse.json({ error: 'Section is required' }, { status: 400 });
    }

    // Try Supabase only if configured
    if (useSupabase) {
      try {
        const { supabase } = await import('@/lib/supabase');

        // Try to find existing record
        const { data } = await supabase
          .from('page_views')
          .select('*')
          .eq('section', section)
          .single();

        if (data) {
          await supabase
            .from('page_views')
            .update({ count: data.count + 1 })
            .eq('id', data.id);
        } else {
          await supabase.from('page_views').insert({
            id: crypto.randomUUID(),
            section,
            count: 1,
            created_at: new Date().toISOString(),
          });
        }
      } catch {
        // Supabase not configured, silently fail
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
