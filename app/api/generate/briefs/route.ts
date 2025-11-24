import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateBrief } from '@/lib/gemini';

// POST /api/generate/briefs - Generate content briefs for all pages
export async function POST(request: NextRequest) {
  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();

    // Get project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get all pages for this project
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', projectId);

    if (pagesError || !pages) {
      return NextResponse.json(
        { error: 'Pages not found' },
        { status: 404 }
      );
    }

    console.log(`Generating briefs for ${pages.length} pages...`);

    // Generate briefs for each page
    const briefsToInsert = [];

    for (const page of pages) {
      try {
        console.log(`Generating brief for: ${page.url_path}`);
        const brief = await generateBrief(page, project);

        briefsToInsert.push({
          page_id: page.id,
          meta_title: brief.meta_title || '',
          meta_description: brief.meta_description || '',
          h1: brief.h1 || '',
          content_structure: brief.content_structure || [],
          word_count_min: brief.word_count?.min || 1500,
          word_count_max: brief.word_count?.max || 2000,
          internal_links: brief.internal_links || [],
          cta_placements: brief.cta_placements || [],
          keywords: brief.keywords || []
        });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        console.error(`Error generating brief for ${page.url_path}:`, error);
        // Continue with other pages even if one fails
      }
    }

    if (briefsToInsert.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate any briefs' },
        { status: 500 }
      );
    }

    // Save briefs to database
    const { data: savedBriefs, error: briefsError } = await supabase
      .from('content_briefs')
      .insert(briefsToInsert)
      .select();

    if (briefsError) {
      console.error('Error saving briefs:', briefsError);
      return NextResponse.json(
        { error: 'Failed to save briefs', details: briefsError.message },
        { status: 500 }
      );
    }

    console.log(`Successfully generated ${savedBriefs.length} briefs`);

    return NextResponse.json({
      success: true,
      count: savedBriefs.length,
      briefs: savedBriefs
    });
  } catch (error: any) {
    console.error('Error generating briefs:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
