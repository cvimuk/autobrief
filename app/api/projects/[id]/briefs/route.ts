import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/projects/[id]/briefs - Get all briefs for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = supabaseAdmin();

    // Get all pages with their briefs for this project
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select(`
        *,
        content_briefs (*)
      `)
      .eq('project_id', params.id)
      .order('url_path', { ascending: true });

    if (pagesError) {
      console.error('Database error:', pagesError);
      return NextResponse.json(
        { error: 'Failed to fetch briefs', details: pagesError.message },
        { status: 500 }
      );
    }

    // Flatten the structure to get briefs with page info
    const briefs = pages
      .filter(page => page.content_briefs && page.content_briefs.length > 0)
      .map(page => ({
        ...page.content_briefs[0],
        page_url: page.url_path,
        page_title: page.title_pattern,
        page_type: page.page_type
      }));

    return NextResponse.json(briefs);
  } catch (error: any) {
    console.error('Error fetching briefs:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
