import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              TM Web Structure Generator
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              สร้างโครงสร้างเว็บไซต์และ Content Brief อัตโนมัติด้วย AI
            </p>
            <Link href="/projects/new">
              <Button size="lg" className="text-lg px-8 py-6">
                เริ่มสร้างโปรเจกต์ใหม่
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Web Structure</CardTitle>
                <CardDescription>
                  สร้าง URL structure ที่ไม่ซ้ำกับที่เคยทำ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Generate อัตโนมัติด้วย AI</li>
                  <li>• Duplicate detection</li>
                  <li>• Nested/Flat URL styles</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Brief</CardTitle>
                <CardDescription>
                  โครงร่างเนื้อหาแบบ SEO-focused
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Meta Title/Description</li>
                  <li>• H1/H2/H3 structure</li>
                  <li>• Internal link mapping</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Files</CardTitle>
                <CardDescription>
                  Export หลายรูปแบบตามต้องการ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• JSON (Dev automation)</li>
                  <li>• CSV (Excel/Sheets)</li>
                  <li>• Markdown (Writer/SEO)</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* How it works */}
          <Card>
            <CardHeader>
              <CardTitle>วิธีใช้งาน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">กรอกข้อมูลโปรเจกต์</h3>
                    <p className="text-sm text-gray-600">
                      ระบุ Brand, Domain, Focus Type และจำนวนหน้าที่ต้องการ
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Generate Structure</h3>
                    <p className="text-sm text-gray-600">
                      AI จะสร้าง URL structure และตรวจสอบ duplicate อัตโนมัติ
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Generate Content Brief</h3>
                    <p className="text-sm text-gray-600">
                      AI จะสร้าง content brief พร้อม SEO structure สำหรับทุกหน้า
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Export Files</h3>
                    <p className="text-sm text-gray-600">
                      Download ไฟล์ในรูปแบบที่ต้องการ (JSON, CSV, Markdown)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tech stack note */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Powered by Gemini 2.5 Flash • Next.js 14 • Supabase</p>
            <p className="mt-2">100% Free Tier • No Credit Card Required</p>
          </div>
        </div>
      </div>
    </div>
  );
}
