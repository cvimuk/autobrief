'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Page, Project } from '@/types';

export default function StructurePreviewPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      // Fetch project
      const projectRes = await fetch(`/api/projects/${projectId}`);
      if (!projectRes.ok) throw new Error('Failed to fetch project');
      const projectData = await projectRes.json();
      setProject(projectData);

      // Fetch pages
      const pagesRes = await fetch(`/api/projects/${projectId}/pages`);
      if (!pagesRes.ok) throw new Error('Failed to fetch pages');
      const pagesData = await pagesRes.json();
      setPages(pagesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push(`/projects/${projectId}/export`);
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Web Structure Preview
            </h1>
            <p className="text-gray-600">
              Step 2: ตรวจสอบโครงสร้างเว็บไซต์ที่ AI สร้างให้
            </p>
          </div>

          {/* Project Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>ข้อมูลโปรเจกต์</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Brand:</span>
                  <div className="font-semibold">{project.brand_name}</div>
                </div>
                <div>
                  <span className="text-gray-500">Domain:</span>
                  <div className="font-semibold">{project.domain}</div>
                </div>
                <div>
                  <span className="text-gray-500">Focus Type:</span>
                  <div className="font-semibold">{project.focus_type}</div>
                </div>
                <div>
                  <span className="text-gray-500">จำนวนหน้า:</span>
                  <div className="font-semibold">{pages.length} หน้า</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pages Table */}
          <Card>
            <CardHeader>
              <CardTitle>โครงสร้างหน้าเว็บไซต์</CardTitle>
              <CardDescription>
                {pages.filter(p => p.is_required).length} หน้าบังคับ • {pages.filter(p => !p.is_required).length} หน้าเสริม
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Keyword</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id} className={page.is_required ? 'bg-blue-50' : ''}>
                      <TableCell className="font-mono text-sm">
                        {page.url_path}
                        {page.is_required && (
                          <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                            Required
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded ${
                          page.page_type === 'pillar' ? 'bg-purple-100 text-purple-700' :
                          page.page_type === 'cluster' ? 'bg-green-100 text-green-700' :
                          page.page_type === 'conversion' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {page.page_type}
                        </span>
                      </TableCell>
                      <TableCell>{page.title_pattern.replace(/{brand}/g, project.brand_name)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => router.push('/projects/new')}
                >
                  สร้างใหม่
                </Button>
                <Button onClick={handleContinue} className="flex-1">
                  ต่อไป: Export Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">
                  {pages.filter(p => p.page_type === 'pillar').length}
                </div>
                <div className="text-sm text-gray-600">Pillar Pages</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {pages.filter(p => p.page_type === 'cluster').length}
                </div>
                <div className="text-sm text-gray-600">Cluster Pages</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">
                  {pages.filter(p => p.page_type === 'conversion').length}
                </div>
                <div className="text-sm text-gray-600">Conversion Pages</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gray-600">
                  {pages.filter(p => p.page_type === 'support').length}
                </div>
                <div className="text-sm text-gray-600">Support Pages</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
