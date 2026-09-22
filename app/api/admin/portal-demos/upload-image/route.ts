// File: app/api/admin/portal-demos/upload-image/route.ts

import { type NextRequest } from "next/server";
import { proxyFormData } from "@/lib/laravelProxy";

// POST /api/admin/portal-demos/upload-image — multipart image upload
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  return proxyFormData({
    path: "/api/admin/portal-demos/upload-image",
    formData,
  });
}
