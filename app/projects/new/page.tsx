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

interface WebsiteInput {
  brand_name: string;
  domain: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [websites, setWebsites] = useState<WebsiteInput[]>([
    { brand_name: '', domain: '' }
  ]);
  const [sharedSettings, setSharedSettings] = useState({
    focus_type: 'หวยล้วน' as FocusType,
    focus_percentages: { lottery: 100 },
    total_pages: 10,
    url_style: 'nested' as 'nested' | 'flat',
    output_language: 'thai_english' as 'thai' | 'thai_english',
    tone: 'professional',
    word_count_range: '1500-2000'
  });

  const handleFocusTypeChange = (focusType: FocusType) => {
    setSharedSettings({
      ...sharedSettings,
      focus_type: focusType,
      focus_percentages: FOCUS_TYPE_CONFIGS[focusType]
    });
  };

  const addWebsite = () => {
    if (websites.length < 5) {
      setWebsites([...websites, { brand_name: '', domain: '' }]);
    }
  };

  const removeWebsite = (index: number) => {
    if (websites.length > 1) {
      setWebsites(websites.filter((_, i) => i !== index));
    }
  };

  const updateWebsite = (index: number, field: keyof WebsiteInput, value: string) => {
    const newWebsites = [...websites];
    newWebsites[index][field] = value;
    setWebsites(newWebsites);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const projectIds: string[] = [];

      // Create and generate structure for each website
      for (const website of websites) {
        if (!website.brand_name || !website.domain) continue;

        const formData: ProjectFormData = {
          ...website,
          ...sharedSettings
        };

        // Save project to database
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error(`Failed to create project for ${website.brand_name}`);

        const project = await response.json();
        projectIds.push(project.id);

        // Generate structure
        const structureResponse = await fetch('/api/generate/structure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: project.id, formData })
        });

        if (!structureResponse.ok) {
          console.error(`Failed to generate structure for ${website.brand_name}`);
        }
      }

      // Redirect to batch structure preview with all project IDs
      const idsParam = projectIds.join(',');
      router.push(`/projects/batch/structure?ids=${idsParam}`);
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              สร้างโปรเจกต์ใหม่
            </h1>
            <p className="text-gray-600">
              Step 1: กรอกข้อมูลโปรเจกต์ (สร้างได้สูงสุด 5 เว็บพร้อมกัน)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Websites Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>เว็บไซต์ ({websites.length}/5)</CardTitle>
                    <CardDescription>
                      เพิ่มเว็บไซต์ที่ต้องการสร้างโครงสร้าง
                    </CardDescription>
                  </div>
                  {websites.length < 5 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addWebsite}
                      size="sm"
                    >
                      + เพิ่มเว็บไซต์
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {websites.map((website, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">เว็บไซต์ {index + 1}</h4>
                      {websites.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWebsite(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ลบ
                        </Button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`brand_${index}`}>ชื่อแบรนด์ *</Label>
                        <Input
                          id={`brand_${index}`}
                          required
                          placeholder="เช่น rb7, panama888"
                          value={website.brand_name}
                          onChange={(e) => updateWebsite(index, 'brand_name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`domain_${index}`}>โดเมน *</Label>
                        <Input
                          id={`domain_${index}`}
                          required
                          placeholder="เช่น rb7huay.com"
                          value={website.domain}
                          onChange={(e) => updateWebsite(index, 'domain', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shared Settings */}
            <Card>
              <CardHeader>
                <CardTitle>การตั้งค่าร่วม</CardTitle>
                <CardDescription>
                  การตั้งค่าเหล่านี้จะใช้กับทุกเว็บไซต์
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Focus Type */}
                <div>
                  <Label htmlFor="focus_type">Focus Type *</Label>
                  <Select
                    value={sharedSettings.focus_type}
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
                    สัดส่วน: {JSON.stringify(sharedSettings.focus_percentages)}
                  </div>
                </div>

                {/* Total Pages */}
                <div>
                  <Label htmlFor="total_pages">จำนวนหน้า: {sharedSettings.total_pages}</Label>
                  <Slider
                    id="total_pages"
                    min={5}
                    max={30}
                    step={1}
                    value={[sharedSettings.total_pages]}
                    onValueChange={(value) => setSharedSettings({ ...sharedSettings, total_pages: value[0] })}
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
                      onClick={() => setSharedSettings({ ...sharedSettings, url_style: 'nested' })}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        sharedSettings.url_style === 'nested'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold mb-1">Nested</div>
                      <div className="text-sm text-gray-600">/lottery/hanoi</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSharedSettings({ ...sharedSettings, url_style: 'flat' })}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        sharedSettings.url_style === 'flat'
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
                      onClick={() => setSharedSettings({ ...sharedSettings, output_language: 'thai' })}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        sharedSettings.output_language === 'thai'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold mb-1">ไทยล้วน</div>
                      <div className="text-sm text-gray-600">หวยฮานอย</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSharedSettings({ ...sharedSettings, output_language: 'thai_english' })}
                      className={`p-4 border-2 rounded-lg text-left transition-colors ${
                        sharedSettings.output_language === 'thai_english'
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
                    value={sharedSettings.tone}
                    onValueChange={(value) => setSharedSettings({ ...sharedSettings, tone: value })}
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
                    value={sharedSettings.word_count_range}
                    onValueChange={(value) => setSharedSettings({ ...sharedSettings, word_count_range: value })}
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
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/')}
                    disabled={loading}
                  >
                    ยกเลิก
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? `กำลังสร้าง ${websites.length} เว็บไซต์...` : `สร้าง ${websites.length} เว็บไซต์และ Generate Structure`}
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
