import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase';

// Quick check: skip Supabase entirely if env vars are placeholders
const useSupabase = isSupabaseConfigured();

// Mock storage for pledges (Supabase integration when env vars are set)
let pledgesStore: Array<{
  id: string;
  name: string;
  country: string | null;
  message: string;
  created_at: string;
}> = [
  { id: '1', name: 'Ahmad R.', country: 'Indonesia', message: 'Modernization is our future. I pledge to support digital education.', created_at: new Date().toISOString() },
  { id: '2', name: 'Sarah K.', country: 'Kenya', message: 'From market trader to e-commerce. Modernization changed my life.', created_at: new Date().toISOString() },
  { id: '3', name: 'Chen W.', country: 'China', message: 'Green technology is not optional, it is essential.', created_at: new Date().toISOString() },
  { id: '4', name: 'Maria S.', country: 'Brazil', message: 'Inclusivity in modernization ensures no one is left behind.', created_at: new Date().toISOString() },
  { id: '5', name: 'Karl E.', country: 'Estonia', message: 'We proved that small nations can lead in digital governance.', created_at: new Date().toISOString() },
  { id: '6', name: 'Priya M.', country: 'India', message: 'Digital India transformed 1.4 billion lives.', created_at: new Date().toISOString() },
  { id: '7', name: 'David L.', country: 'Singapore', message: 'Smart Nation starts with smart citizens. Education first.', created_at: new Date().toISOString() },
  { id: '8', name: 'Fatima A.', country: 'UAE', message: 'From oil to knowledge economy — our transformation inspires the world.', created_at: new Date().toISOString() },
];

export async function GET() {
  if (useSupabase) {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('pledges')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        const { count } = await supabase
          .from('pledges')
          .select('*', { count: 'exact', head: true });
        return NextResponse.json({ pledges: data, total: count || data.length });
      }
    } catch {
      // Supabase error, fall through to mock data
    }
  }

  return NextResponse.json({ pledges: pledgesStore, total: pledgesStore.length + 2839 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, country, message } = body;

    if (!name || !message) {
      return NextResponse.json({ error: 'Name and message are required' }, { status: 400 });
    }

    if (message.length > 200) {
      return NextResponse.json({ error: 'Message must be 200 characters or less' }, { status: 400 });
    }

    const newPledge = {
      id: crypto.randomUUID(),
      name: name.slice(0, 50),
      country: country?.slice(0, 50) || null,
      message: message.slice(0, 200),
      created_at: new Date().toISOString(),
    };

    // Try Supabase only if configured
    if (useSupabase) {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { error } = await supabase.from('pledges').insert(newPledge);
        if (!error) {
          return NextResponse.json({ success: true, pledge: newPledge });
        }
      } catch {
        // Supabase not configured
      }
    }

    // Fallback to in-memory store
    pledgesStore.unshift(newPledge);
    return NextResponse.json({ success: true, pledge: newPledge });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
