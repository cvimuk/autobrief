'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ProjectFormData, FocusType, FOCUS_TYPE_CONFIGS } from '@/types';

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    brand_name: '',
    domain: '',
    focus_type: 'หวยล้วน',
    focus_percentages: { lottery: 100 },
    total_pages: 10,
    url_style: 'nested',
    output_language: 'thai_english',
    tone: 'professional',
    word_count_range: '1500-2000'
  });

  const handleFocusTypeChange = (focusType: FocusType) => {
    setFormData({
      ...formData,
      focus_type: focusType,
      focus_percentages: FOCUS_TYPE_CONFIGS[focusType]
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save project to database
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create project');

      const project = await response.json();

      // Generate structure
      const structureResponse = await fetch('/api/generate/structure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, formData })
      });

      if (!structureResponse.ok) throw new Error('Failed to generate structure');

      // Redirect to structure preview
      router.push(`/projects/${project.id}/structure`);
    } catch (error) {
      console.error('Error:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              สร้างโปรเจกต์ใหม่
            </h1>
            <p className="text-gray-600">
              Step 1: กรอกข้อมูลโปรเจกต์
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
                <CardDescription>
                  กรอกข้อมูลเว็บไซต์ที่ต้องการสร้าง
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Brand Name */}
                <div>
                  <Label htmlFor="brand_name">ชื่อแบรนด์ *</Label>
                  <Input
                    id="brand_name"
                    required
                    placeholder="เช่น rb7, panama888"
                    value={formData.brand_name}
                    onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                  />
                </div>

                {/* Domain */}
                <div>
                  <Label htmlFor="domain">โดเมน *</Label>
                  <Input
                    id="domain"
                    required
                    placeholder="เช่น rb7huay.com"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  />
                </div>

                {/* Focus Type */}
                <div>
                  <Label htmlFor="focus_type">Focus Type *</Label>
                  <Select
                    value={formData.focus_type}
                    onValueChange={(value) => handleFocusTypeChange(value as FocusType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="บอลล้วน">บอลล้วน</SelectItem>
                      <SelectItem value="บอล + คาสิโน">บอล + คาสิโน</SelectItem>
                      <SelectItem value="คาสิโนล้วน">คาสิโนล้วน</SelectItem>
                      <SelectItem value="คาสิโน + สล็อต">คาสิโน + สล็อต</SelectItem>
                      <SelectItem value="สล็อตล้วน">สล็อตล้วน</SelectItem>
                      <SelectItem value="หวยล้วน">หวยล้วน</SelectItem>
                      <SelectItem value="หวย + คาสิโน">หวย + คาสิโน</SelectItem>
                      <SelectItem value="หวย + คาสิโน + สล็อต">หวย + คาสิโน + สล็อต</SelectItem>
                      <SelectItem value="หวย + คาสิโน + สล็อต + บอล">หวย + คาสิโน + สล็อต + บอล</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="mt-2 text-sm text-gray-600">
                    สัดส่วน: {JSON.stringify(formData.focus_percentages)}
                  </div>
                </div>

                {/* Total Pages */}
                <div>
                  <Label htmlFor="total_pages">จำนวนหน้า: {formData.total_pages}</Label>
                  <Slider
                    id="total_pages"
                    min={5}
                    max={30}
                    step={1}
                    value={[formData.total_pages]}
                    onValueChange={(value) => setFormData({ ...formData, total_pages: value[0] })}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5 หน้า</span>
                    <span>30 หน้า</span>
                  </div>
                </div>

                {/* URL Style */}
                <div>
                  <Label>URL Style *</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, url_style: 'nested' })}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        formData.url_style === 'nested'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold mb-1">Nested</div>
                      <div className="text-sm text-gray-600">/lottery/hanoi</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, url_style: 'flat' })}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        formData.url_style === 'flat'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold mb-1">Flat</div>
                      <div className="text-sm text-gray-600">/hanoi-lottery</div>
                    </button>
                  </div>
                </div>

                {/* Output Language */}
                <div>
                  <Label>ภาษา *</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, output_language: 'thai' })}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        formData.output_language === 'thai'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold mb-1">ไทยล้วน</div>
                      <div className="text-sm text-gray-600">หวยฮานอย</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, output_language: 'thai_english' })}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        formData.output_language === 'thai_english'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold mb-1">ไทย + English</div>
                      <div className="text-sm text-gray-600">หวยฮานอย Hanoi</div>
                    </button>
                  </div>
                </div>

                {/* Tone */}
                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select
                    value={formData.tone}
                    onValueChange={(value) => setFormData({ ...formData, tone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Word Count Range */}
                <div>
                  <Label htmlFor="word_count_range">Word Count Range</Label>
                  <Select
                    value={formData.word_count_range}
                    onValueChange={(value) => setFormData({ ...formData, word_count_range: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000-1500">1,000-1,500 คำ</SelectItem>
                      <SelectItem value="1500-2000">1,500-2,000 คำ</SelectItem>
                      <SelectItem value="2000-2500">2,000-2,500 คำ</SelectItem>
                      <SelectItem value="2500-3000">2,500-3,000 คำ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/')}
                    disabled={loading}
                  >
                    ยกเลิก
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'กำลังสร้าง...' : 'สร้างโปรเจกต์และ Generate Structure'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
