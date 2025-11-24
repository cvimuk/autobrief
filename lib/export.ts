import { Project, Page, ContentBrief, ExportData } from '@/types';

// Export as JSON
export function exportAsJSON(data: ExportData): string {
  return JSON.stringify(data, null, 2);
}

// Export as CSV
export function exportAsCSV(data: ExportData): string {
  const { project, pages } = data;

  const headers = ['URL', 'Full URL', 'Type', 'Title', 'Category', 'Priority'];
  const rows = pages.map(page => [
    page.url_path,
    `https://${project.domain}${page.url_path}`,
    page.page_type,
    page.title_pattern.replace('{brand}', project.brand_name),
    page.category || 'general',
    page.priority || '-'
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csv;
}

// Export as Markdown
export function exportAsMarkdown(data: ExportData): string {
  const { project, pages, briefs = [] } = data;

  let md = `# Content Briefs: ${project.domain}\n\n`;
  md += `**Brand:** ${project.brand_name}\n`;
  md += `**Focus:** ${project.focus_type}\n`;
  md += `**Created:** ${new Date().toLocaleDateString('th-TH')}\n\n`;
  md += `---\n\n`;

  // Add structure overview
  md += `## Web Structure Overview\n\n`;
  md += `| URL | Type | Keyword |\n`;
  md += `|-----|------|---------|\n`;

  pages.forEach(page => {
    const keyword = page.title_pattern.replace(/{brand}/g, project.brand_name);
    const required = page.is_required ? ' (Required)' : '';
    md += `| ${page.url_path}${required} | ${page.page_type} | ${keyword} |\n`;
  });

  md += `\n---\n\n`;

  // Add content briefs
  if (briefs.length > 0) {
    md += `## Content Briefs\n\n`;

    briefs.forEach((brief, index) => {
      md += `### ${index + 1}. ${brief.page_url}\n\n`;
      md += `**Page Type:** ${brief.page_type}\n\n`;
      md += `**Meta Title:** ${brief.meta_title || 'N/A'}\n\n`;
      md += `**Meta Description:** ${brief.meta_description || 'N/A'}\n\n`;
      md += `**H1:** ${brief.h1 || 'N/A'}\n\n`;

      if (brief.content_structure && brief.content_structure.length > 0) {
        md += `**Content Structure:**\n\n`;
        brief.content_structure.forEach((section, i) => {
          md += `${i + 1}. **${section.h2}**\n`;
          if (section.h3s && section.h3s.length > 0) {
            section.h3s.forEach(h3 => {
              md += `   - ${h3}\n`;
            });
          }
          md += `\n`;
        });
      }

      if (brief.keywords && brief.keywords.length > 0) {
        md += `**Keywords:** ${brief.keywords.join(', ')}\n\n`;
      }

      if (brief.word_count_min && brief.word_count_max) {
        md += `**Word Count:** ${brief.word_count_min}-${brief.word_count_max}\n\n`;
      }

      if (brief.internal_links && brief.internal_links.length > 0) {
        md += `**Internal Links:**\n`;
        brief.internal_links.forEach(link => {
          md += `- ${link.target} (${link.type})\n`;
        });
        md += `\n`;
      }

      md += `---\n\n`;
    });
  }

  return md;
}

// Download file helper
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
