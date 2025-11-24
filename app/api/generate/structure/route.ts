import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateStructure } from '@/lib/gemini';
import { ProjectFormData } from '@/types';

// POST /api/generate/structure
export async function POST(request: NextRequest) {
  try {
    const { projectId, formData } = await request.json();

    if (!projectId || !formData) {
      return NextResponse.json(
        { error: 'Missing projectId or formData' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();

    // Get existing URL patterns to avoid duplicates
    const { data: existingPatterns } = await supabase
      .from('url_patterns')
      .select('pattern');

    const patterns = existingPatterns?.map(p => p.pattern) || [];

    // Generate structure using Gemini AI
    console.log('Generating structure with AI...');
    const result = await generateStructure(formData, patterns);

    if (!result.pages || !Array.isArray(result.pages)) {
      throw new Error('Invalid structure generated');
    }

    console.log(`Generated ${result.pages.length} pages`);

    // Save pages to database
    const pagesToInsert = result.pages.map((page: any) => ({
      project_id: projectId,
      url_path: page.url_path,
      page_type: page.page_type,
      title_pattern: page.title_pattern,
      category: page.category || 'general',
      is_required: page.is_required || false,
      priority: page.priority || 'secondary'
    }));

    const { data: savedPages, error: pagesError } = await supabase
      .from('pages')
      .insert(pagesToInsert)
      .select();

    if (pagesError) {
      console.error('Error saving pages:', pagesError);
      throw new Error(`Failed to save pages: ${pagesError.message}`);
    }

    // Save URL patterns for duplicate detection
    const urlPatterns = result.pages.map((page: any) => {
      // Normalize pattern: /lottery/hanoi -> /lottery/{subtype}
      const parts = page.url_path.split('/').filter(Boolean);
      let pattern = page.url_path;

      if (parts.length === 2) {
        pattern = `/${parts[0]}/{subtype}`;
      }

      return {
        pattern,
        example_url: page.url_path,
        project_id: projectId,
        category: page.category || 'general'
      };
    });

    // Insert patterns (ignore duplicates)
    await supabase
      .from('url_patterns')
      .upsert(urlPatterns, {
        onConflict: 'pattern',
        ignoreDuplicates: false
      });

    return NextResponse.json({
      success: true,
      pages: savedPages,
      internal_links: result.internal_links || {}
    });
  } catch (error: any) {
    console.error('Error generating structure:', error);
    return NextResponse.json(
      { error: 'Failed to generate structure', details: error.message },
      { status: 500 }
    );
  }
}
