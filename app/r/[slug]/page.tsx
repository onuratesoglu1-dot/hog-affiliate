import { redirect } from "next/navigation";

const IOS_URL = "https://apps.apple.com/app/id6478711957";

export default async function AffiliatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  console.log("affiliate slug:", slug);
  redirect(IOS_URL);
}
