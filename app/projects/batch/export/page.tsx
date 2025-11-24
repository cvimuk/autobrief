'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Page, Project, ExportData } from '@/types';
import { exportAsJSON, exportAsCSV, exportAsMarkdown, downloadFile } from '@/lib/export';

interface ProjectWithPages {
  project: Project;
  pages: Page[];
  selected: boolean;
}

export default function BatchExportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ids = searchParams.get('ids')?.split(',') || [];

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectWithPages[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const projectsData: ProjectWithPages[] = [];

      for (const id of ids) {
        // Fetch project
        const projectRes = await fetch(`/api/projects/${id}`);
        if (!projectRes.ok) continue;
        const projectData = await projectRes.json();

        // Fetch pages
        const pagesRes = await fetch(`/api/projects/${id}/pages`);
        if (!pagesRes.ok) continue;
        const pagesData = await pagesRes.json();

        projectsData.push({
          project: projectData,
          pages: pagesData,
          selected: true // Select all by default
        });
      }

      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (index: number) => {
    const newProjects = [...projects];
    newProjects[index].selected = !newProjects[index].selected;
    setProjects(newProjects);
  };

  const selectAll = () => {
    setProjects(projects.map(p => ({ ...p, selected: true })));
  };

  const deselectAll = () => {
    setProjects(projects.map(p => ({ ...p, selected: false })));
  };

  const handleExport = (format: 'json' | 'csv' | 'markdown') => {
    const selectedProjects = projects.filter(p => p.selected);

    if (selectedProjects.length === 0) {
      alert('กรุณาเลือกเว็บไซต์ที่ต้องการ export อย่างน้อย 1 เว็บ');
      return;
    }

    selectedProjects.forEach(({ project, pages }) => {
      const exportData: ExportData = {
        project,
        pages
      };

      // Generate filename: brand-date-time.ext
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS
      const brandName = project.brand_name.replace(/\s+/g, '-').toLowerCase();
      const filename = `${brandName}-${dateStr}-${timeStr}`;

      switch (format) {
        case 'json':
          const jsonContent = exportAsJSON(exportData);
          downloadFile(jsonContent, `${filename}.json`, 'application/json');
          break;

        case 'csv':
          const csvContent = exportAsCSV(exportData);
          downloadFile(csvContent, `${filename}.csv`, 'text/csv');
          break;

        case 'markdown':
          const mdContent = exportAsMarkdown(exportData);
          downloadFile(mdContent, `${filename}.md`, 'text/markdown');
          break;
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  const selectedCount = projects.filter(p => p.selected).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Export Files
            </h1>
            <p className="text-gray-600">
              Step 3: เลือกเว็บไซต์ที่ต้องการ export และ download ไฟล์
            </p>
          </div>

          {/* Project Selection */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>เลือกเว็บไซต์ ({selectedCount}/{projects.length})</CardTitle>
                  <CardDescription>
                    เลือกเว็บไซต์ที่ต้องการ export
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                  >
                    เลือกทั้งหมด
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={deselectAll}
                  >
                    ยกเลิกทั้งหมด
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projects.map((proj, index) => (
                  <div
                    key={proj.project.id}
                    className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleSelection(index)}
                  >
                    <Checkbox
                      checked={proj.selected}
                      onCheckedChange={() => toggleSelection(index)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <div className="font-semibold">{proj.project.brand_name}</div>
                      <div className="text-sm text-gray-600">
                        {proj.project.domain} • {proj.pages.length} หน้า • {proj.project.focus_type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>เลือกรูปแบบไฟล์</CardTitle>
              <CardDescription>
                Download ไฟล์ในรูปแบบที่เหมาะกับการใช้งาน (จะ download {selectedCount} ไฟล์)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {/* JSON Export */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      <div className="text-4xl">📄</div>
                      <h3 className="font-semibold">JSON</h3>
                      <p className="text-sm text-gray-600">
                        สำหรับ WordPress Dev และ automation
                      </p>
                      <Button
                        onClick={() => handleExport('json')}
                        className="w-full"
                        variant="outline"
                        disabled={selectedCount === 0}
                      >
                        Download JSON
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* CSV Export */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      <div className="text-4xl">📊</div>
                      <h3 className="font-semibold">CSV</h3>
                      <p className="text-sm text-gray-600">
                        สำหรับ Excel, Google Sheets
                      </p>
                      <Button
                        onClick={() => handleExport('csv')}
                        className="w-full"
                        variant="outline"
                        disabled={selectedCount === 0}
                      >
                        Download CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Markdown Export */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-3">
                      <div className="text-4xl">📝</div>
                      <h3 className="font-semibold">Markdown</h3>
                      <p className="text-sm text-gray-600">
                        สำหรับ Content Writer และ SEO
                      </p>
                      <Button
                        onClick={() => handleExport('markdown')}
                        className="w-full"
                        variant="outline"
                        disabled={selectedCount === 0}
                      >
                        Download MD
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/projects/batch/structure?ids=${ids.join(',')}`)}
                >
                  ย้อนกลับ
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  className="flex-1"
                >
                  สร้างโปรเจกต์ใหม่
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Success Message */}
          {selectedCount > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <h4 className="font-semibold text-green-900 mb-1">
                    พร้อม Export แล้ว!
                  </h4>
                  <p className="text-sm text-green-700">
                    เลือกไว้ {selectedCount} เว็บไซต์ คลิกปุ่ม Download เพื่อ export ไฟล์
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
