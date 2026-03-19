import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, query, orderBy, limit } from "firebase/firestore";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  // Vercel Cron doğrulama (Prod ortamında CRON_SECRET çevre değişkeni gerektirir)
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    const clientsSnap = await getDocs(collection(db, "clients"));
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    for (const clientDoc of clientsSnap.docs) {
      const clientId = clientDoc.id;
      const logsSnap = await getDocs(
        query(collection(db, `clients/${clientId}/weight_logs`), orderBy("date", "desc"), limit(1))
      );

      let missed = false;
      if (!logsSnap.empty) {
        const lastLog = logsSnap.docs[0].data();
        const lastDate = new Date(lastLog.date);
        
        // Eğer en son kayıt 3 günden önce atıldıysa danışan bildirimlerini kaçırıyor demektir.
        if (lastDate < threeDaysAgo) {
           missed = true;
        }
      } else {
        // Hiç kayıt yoksa, ama hesabı açalı 3 günü geçtiyse de uyarı trigger edilebilir
        const createdAt = new Date(clientDoc.data().createdAt || Date.now());
        if (createdAt < threeDaysAgo) missed = true;
      }

      await updateDoc(doc(db, "clients", clientId), { missedUpdates: missed });
    }

    return NextResponse.json({ success: true, message: "Tüm hasta güncel takip durumları kontrol edildi ve analiz edildi." });
  } catch (err: any) {
    console.error("Cron Error", err);
    return NextResponse.json({ error: "İşlem sırasında beklenmedik hata" }, { status: 500 });
  }
}
