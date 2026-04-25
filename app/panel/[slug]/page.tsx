import { supabase } from "../../../lib/supabase";

export default async function PanelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: link } = await supabase
    .from("affiliate_links")
    .select("influencer_name")
    .eq("slug", slug)
    .maybeSingle();

  if (!link) {
    return (
      <html>
        <body style={{ backgroundColor: "#0B0B0B", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "sans-serif", margin: 0 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 900, color: "#FF7A00" }}>HOG</div>
            <div style={{ color: "#888", marginTop: 8 }}>Panel bulunamadı.</div>
          </div>
        </body>
      </html>
    );
  }

  const { data: clicks } = await supabase
    .from("affiliate_clicks")
    .select("user_id, paid, paid_at, clicked_at, product_id, price")
    .eq("slug", slug)
    .order("clicked_at", { ascending: false });

  const total_click = clicks?.length || 0;
  const total_install = clicks?.filter(c => c.user_id).length || 0;
  const active_paid = clicks?.filter(c => c.paid).length || 0;
  const cancelled = clicks?.filter(c => c.user_id && !c.paid && c.paid_at).length || 0;
  const expected_payment = clicks?.filter(c => c.paid).reduce((sum, c) => sum + (c.price || 0), 0) || 0;

  const PRODUCT_LABELS: Record<string, string> = {
    "com.onur.hellofgym.premium.monthly": "HOG Premium (49₺)",
    "com.onur.hellofgym.pt.starter": "PT Starter (149₺)",
    "com.onur.hellofgym.pt.pro": "PT Pro (299₺)",
    "com.onur.hellofgym.pt.elite": "PT Elite (599₺)",
  };

  const apple_cut = 0.30; // Apple %30 alır
  const commission_rate = 0.20; // Influencer %20 alır (Apple sonrası)
  const commission = expected_payment * (1 - apple_cut) * commission_rate;

  const card = (label: string, value: string | number, color: string) => `
    <div style="background:#151515;border:1px solid #262626;border-radius:16px;padding:20px;text-align:center;flex:1;min-width:130px">
      <div style="font-size:28px;font-weight:900;color:${color}">${value}</div>
      <div style="font-size:12px;color:#888;margin-top:4px">${label}</div>
    </div>
  `;

  const rows = clicks?.slice(0, 50).map(c => `
    <tr style="border-bottom:1px solid #1a1a1a">
      <td style="padding:10px;color:#888;font-size:12px">${new Date(c.clicked_at).toLocaleDateString("tr-TR")}</td>
      <td style="padding:10px;color:#888;font-size:12px">${c.user_id ? "✓" : "—"}</td>
      <td style="padding:10px;font-size:12px;color:#aaa">${c.product_id ? (PRODUCT_LABELS[c.product_id] || c.product_id) : "—"}</td>
      <td style="padding:10px;font-size:12px;font-weight:700;color:${c.paid ? "#4CAF50" : c.paid_at ? "#FF4B4B" : "#888"}">${c.paid ? "Aktif" : c.paid_at ? "İptal" : "—"}</td>
    </tr>
  `).join("") || "";

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>HOG Panel — {link.influencer_name}</title>
      </head>
      <body style={{ margin: 0, backgroundColor: "#0B0B0B", color: "#fff", fontFamily: "sans-serif", padding: "24px", minHeight: "100vh" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: "#FF7A00" }}>HOG</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{link.influencer_name}</div>
            <div style={{ color: "#555", fontSize: 13, marginTop: 4 }}>Affiliate Paneli</div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}
            dangerouslySetInnerHTML={{ __html:
              card("Tıklama", total_click, "#FF7A00") +
              card("İndirme", total_install, "#fff") +
              card("Aktif Ödeme", active_paid, "#4CAF50") +
              card("İptal", cancelled, "#FF4B4B")
            }}
          />

          <div style={{ background: "#151515", border: "1px solid #FF7A00", borderRadius: 16, padding: 20, marginBottom: 16, textAlign: "center" }}>
            <div style={{ color: "#888", fontSize: 13, marginBottom: 6 }}>Bu Ay Toplam Abonelik Geliri</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#fff" }}>{expected_payment.toLocaleString("tr-TR")} ₺</div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #262626" }}>
              <div style={{ color: "#888", fontSize: 13, marginBottom: 4 }}>Senin Payın (Apple sonrası %20)</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#FF7A00" }}>{commission.toLocaleString("tr-TR")} ₺</div>
            </div>
            <div style={{ color: "#555", fontSize: 11, marginTop: 8 }}>Apple %30 komisyon sonrası • Her ayın 1'inde ödenir</div>
          </div>

          <div style={{ background: "#151515", border: "1px solid #262626", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #262626", fontSize: 12, fontWeight: 800, color: "#888", letterSpacing: 1 }}>SON KAYITLAR</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1a1a1a" }}>
                  <th style={{ padding: "8px 10px", color: "#555", fontSize: 11, textAlign: "left" }}>Tarih</th>
                  <th style={{ padding: "8px 10px", color: "#555", fontSize: 11, textAlign: "left" }}>İndirme</th>
                  <th style={{ padding: "8px 10px", color: "#555", fontSize: 11, textAlign: "left" }}>Paket</th>
                  <th style={{ padding: "8px 10px", color: "#555", fontSize: 11, textAlign: "left" }}>Durum</th>
                </tr>
              </thead>
              <tbody dangerouslySetInnerHTML={{ __html: rows || `<tr><td colspan="4" style="padding:20px;text-align:center;color:#555">Henüz veri yok</td></tr>` }} />
            </table>
          </div>

          <div style={{ textAlign: "center", marginTop: 24, color: "#333", fontSize: 12 }}>
            Her ayın 1'inde aktif abonelikler üzerinden Apple komisyonu düşüldükten sonra %20 ödenir.
          </div>
        </div>
      </body>
    </html>
  );
}
