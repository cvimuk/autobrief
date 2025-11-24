'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Page, Project, ExportData } from '@/types';
import { exportAsJSON, exportAsCSV, exportAsMarkdown, downloadFile } from '@/lib/export';

export default function ExportPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [briefs, setBriefs] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      const projectRes = await fetch(`/api/projects/${projectId}`);
      if (!projectRes.ok) throw new Error('Failed to fetch project');
      const projectData = await projectRes.json();
      setProject(projectData);

      const pagesRes = await fetch(`/api/projects/${projectId}/pages`);
      if (!pagesRes.ok) throw new Error('Failed to fetch pages');
      const pagesData = await pagesRes.json();
      setPages(pagesData);

      // Fetch briefs
      const briefsRes = await fetch(`/api/projects/${projectId}/briefs`);
      if (briefsRes.ok) {
        const briefsData = await briefsRes.json();
        setBriefs(briefsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'json' | 'csv' | 'markdown') => {
    if (!project) return;

    const exportData: ExportData = {
      project,
      pages,
      briefs
    };

    const brandName = project.brand_name;

    switch (format) {
      case 'json':
        const jsonContent = exportAsJSON(exportData);
        downloadFile(jsonContent, `${brandName}_structure.json`, 'application/json');
        break;

      case 'csv':
        const csvContent = exportAsCSV(exportData);
        downloadFile(csvContent, `${brandName}_structure.csv`, 'text/csv');
        break;

      case 'markdown':
        const mdContent = exportAsMarkdown(exportData);
        downloadFile(mdContent, `${brandName}_structure.md`, 'text/markdown');
        break;
    }
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

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">ไม่พบโปรเจกต์</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Export Files
            </h1>
            <p className="text-gray-600">
              Step 4: Download ไฟล์ในรูปแบบที่ต้องการ
            </p>
          </div>

          {/* Project Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>สรุปโปรเจกต์</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Brand:</span>
                  <span className="font-semibold">{project.brand_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Domain:</span>
                  <span className="font-semibold">{project.domain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Focus Type:</span>
                  <span className="font-semibold">{project.focus_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">จำนวนหน้า:</span>
                  <span className="font-semibold">{pages.length} หน้า</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">URL Style:</span>
                  <span className="font-semibold">{project.url_style}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>เลือกรูปแบบไฟล์</CardTitle>
              <CardDescription>
                Download ไฟล์ในรูปแบบที่เหมาะกับการใช้งาน
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
                  onClick={() => router.push(`/projects/${projectId}/briefs`)}
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
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-2xl">✅</div>
              <div>
                <h4 className="font-semibold text-green-900 mb-1">
                  โปรเจกต์สร้างสำเร็จ!
                </h4>
                <p className="text-sm text-green-700">
                  คุณสามารถ download ไฟล์ได้แล้ว หรือสร้างโปรเจกต์ใหม่ต่อได้เลย
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
