import { redirect } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const IOS_URL = "https://apps.apple.com/app/id6478711957";
const ANDROID_URL = "https://play.google.com/store/apps/details?id=com.onur.hellofgym";

export default async function AffiliatePage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  try {
    await supabase.from("affiliate_clicks").insert({
      slug,
      clicked_at: new Date().toISOString(),
    });
  } catch (_) {}

  redirect(IOS_URL);
}
