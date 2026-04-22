import { redirect } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const IOS_URL = "https://apps.apple.com/app/id6760843561";
const ANDROID_URL = "https://play.google.com/store/apps/details?id=com.onur.hellofgym";

export default async function AffiliatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    await supabase.from("affiliate_clicks").insert({ slug });
  } catch (_) {}

  redirect(IOS_URL);
}
