import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ProjectFormData } from '@/types';

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const formData: ProjectFormData = await request.json();

    const supabase = supabaseAdmin();

    // Insert project into database
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        brand_name: formData.brand_name,
        domain: formData.domain,
        focus_type: formData.focus_type,
        focus_percentages: formData.focus_percentages,
        url_style: formData.url_style,
        output_language: formData.output_language,
        total_pages: formData.total_pages,
        tone: formData.tone,
        word_count_range: formData.word_count_range
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create project', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(project);
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/projects - List all projects
export async function GET() {
  try {
    const supabase = supabaseAdmin();

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
