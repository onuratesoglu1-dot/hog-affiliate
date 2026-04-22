import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export async function POST(req: NextRequest) {
  const { slug } = await req.json();
  if (!slug) return NextResponse.json({ ok: false });

  await supabase.from("affiliate_clicks").insert({
    slug,
    clicked_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
