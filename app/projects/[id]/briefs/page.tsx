'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Project } from '@/types';

export default function BriefPreviewPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [briefs, setBriefs] = useState<any[]>([]);

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

      // Check if briefs already exist
      const briefsRes = await fetch(`/api/projects/${projectId}/briefs`);
      if (briefsRes.ok) {
        const briefsData = await briefsRes.json();
        if (briefsData.length > 0) {
          setBriefs(briefsData);
          setLoading(false);
          return;
        }
      }

      // If no briefs, generate them
      setGenerating(true);
      await generateBriefs();
    } catch (error) {
      console.error('Error:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      setLoading(false);
    }
  };

  const generateBriefs = async () => {
    try {
      const response = await fetch('/api/generate/briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });

      if (!response.ok) throw new Error('Failed to generate briefs');

      // Fetch generated briefs
      const briefsRes = await fetch(`/api/projects/${projectId}/briefs`);
      const briefsData = await briefsRes.json();
      setBriefs(briefsData);
    } catch (error) {
      console.error('Error generating briefs:', error);
      alert('เกิดข้อผิดพลาดในการ generate briefs');
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push(`/projects/${projectId}/export`);
  };

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {generating ? 'กำลัง generate content briefs... (ใช้เวลา 1-3 นาที)' : 'กำลังโหลดข้อมูล...'}
          </p>
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
              Content Brief Preview
            </h1>
            <p className="text-gray-600">
              Step 3: ตรวจสอบ content brief ที่ AI สร้างให้
            </p>
          </div>

          {/* Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>สรุป</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Brand:</span>
                  <div className="font-semibold">{project.brand_name}</div>
                </div>
                <div>
                  <span className="text-gray-500">จำนวน Briefs:</span>
                  <div className="font-semibold">{briefs.length} briefs</div>
                </div>
                <div>
                  <span className="text-gray-500">Word Count:</span>
                  <div className="font-semibold">{project.word_count_range} คำ</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Briefs List */}
          <div className="space-y-6">
            {briefs.map((brief, index) => (
              <Card key={brief.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{index + 1}. {brief.page_url}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      brief.page_type === 'pillar' ? 'bg-purple-100 text-purple-700' :
                      brief.page_type === 'cluster' ? 'bg-green-100 text-green-700' :
                      brief.page_type === 'conversion' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {brief.page_type}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Meta Info */}
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Meta Information</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
                      <div>
                        <span className="text-gray-500">Title:</span> {brief.meta_title}
                      </div>
                      <div>
                        <span className="text-gray-500">Description:</span> {brief.meta_description}
                      </div>
                      <div>
                        <span className="text-gray-500">H1:</span> {brief.h1}
                      </div>
                    </div>
                  </div>

                  {/* Content Structure */}
                  {brief.content_structure && brief.content_structure.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Content Structure</h4>
                      <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
                        {brief.content_structure.map((section: any, i: number) => (
                          <div key={i}>
                            <div className="font-medium">{i + 1}. {section.h2}</div>
                            {section.h3s && section.h3s.length > 0 && (
                              <div className="ml-4 mt-1 space-y-1">
                                {section.h3s.map((h3: string, j: number) => (
                                  <div key={j} className="text-gray-600">• {h3}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Keywords */}
                  {brief.keywords && brief.keywords.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {brief.keywords.map((keyword: string, i: number) => (
                          <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Word Count */}
                  <div className="text-sm text-gray-600">
                    Word Count: {brief.word_count_min}-{brief.word_count_max} คำ
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/projects/${projectId}/structure`)}
            >
              ย้อนกลับ
            </Button>
            <Button onClick={handleContinue} className="flex-1">
              ต่อไป: Export Files
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
