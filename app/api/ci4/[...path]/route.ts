import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE = (process.env.CI4_API_BASE_URL || "https://arsh.appsredx.com/api/v1").replace(/\/+$/, "");
const ALLOWED_PATHS = [
  /^specialities$/,
  /^doctors$/,
  /^doctors\/[a-z0-9-]+$/i,
  /^appointments$/,
  /^appointments\/availability$/,
  /^enquiries$/,
  /^search$/,
  /^blogs$/,
  /^blogs\/[a-z0-9-]+$/i,
  /^home$/,
];

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const resource = path.join("/");
  if (!ALLOWED_PATHS.some((pattern) => pattern.test(resource))) {
    return NextResponse.json({ ok: false, errors: ["API route not allowed"] }, { status: 404 });
  }

  const target = new URL(`${API_BASE}/${path.map(encodeURIComponent).join("/")}`);
  request.nextUrl.searchParams.forEach((value, key) => target.searchParams.append(key, value));

  const headers = new Headers({ Accept: "application/json" });
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
      cache: "no-store",
    });
    const responseHeaders = new Headers();
    const upstreamType = upstream.headers.get("content-type");
    if (upstreamType) responseHeaders.set("content-type", upstreamType);
    return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return NextResponse.json({ ok: false, errors: ["Hospital API is temporarily unavailable"] }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
