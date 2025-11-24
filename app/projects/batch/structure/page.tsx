'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Page, Project } from '@/types';

interface ProjectWithPages {
  project: Project;
  pages: Page[];
}

export default function BatchStructurePreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ids = searchParams.get('ids')?.split(',') || [];

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectWithPages[]>([]);
  const [selectedProject, setSelectedProject] = useState(0);

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
          pages: pagesData
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

  const handleContinue = () => {
    const idsParam = ids.join(',');
    router.push(`/projects/batch/export?ids=${idsParam}`);
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

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">ไม่พบโปรเจกต์</p>
      </div>
    );
  }

  const current = projects[selectedProject];

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

          {/* Website Tabs */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>เว็บไซต์ทั้งหมด ({projects.length})</CardTitle>
              <CardDescription>
                คลิกเพื่อดูโครงสร้างของแต่ละเว็บไซต์
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {projects.map((proj, index) => (
                  <button
                    key={proj.project.id}
                    onClick={() => setSelectedProject(index)}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      selectedProject === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-sm truncate">
                      {proj.project.brand_name}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {proj.pages.length} หน้า
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Project Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>ข้อมูลโปรเจกต์: {current.project.brand_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Brand:</span>
                  <div className="font-semibold">{current.project.brand_name}</div>
                </div>
                <div>
                  <span className="text-gray-500">Domain:</span>
                  <div className="font-semibold">{current.project.domain}</div>
                </div>
                <div>
                  <span className="text-gray-500">Focus Type:</span>
                  <div className="font-semibold">{current.project.focus_type}</div>
                </div>
                <div>
                  <span className="text-gray-500">จำนวนหน้า:</span>
                  <div className="font-semibold">{current.pages.length} หน้า</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pages Table */}
          <Card>
            <CardHeader>
              <CardTitle>โครงสร้างหน้าเว็บไซต์</CardTitle>
              <CardDescription>
                {current.pages.filter(p => p.is_required).length} หน้าบังคับ • {current.pages.filter(p => !p.is_required).length} หน้าเสริม
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
                  {current.pages.map((page) => (
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
                      <TableCell>{page.title_pattern.replace(/{brand}/g, current.project.brand_name)}</TableCell>
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
                  {current.pages.filter(p => p.page_type === 'pillar').length}
                </div>
                <div className="text-sm text-gray-600">Pillar Pages</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {current.pages.filter(p => p.page_type === 'cluster').length}
                </div>
                <div className="text-sm text-gray-600">Cluster Pages</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">
                  {current.pages.filter(p => p.page_type === 'conversion').length}
                </div>
                <div className="text-sm text-gray-600">Conversion Pages</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gray-600">
                  {current.pages.filter(p => p.page_type === 'support').length}
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
