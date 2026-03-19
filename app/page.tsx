"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Leaf, LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-3xl pointer-events-none"></div>
      <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-emerald-400/10 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-[420px] z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-3 rounded-2xl shadow-lg mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Diyetisyen Pro</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-center">Müşterilerinizi ve diyet planlarınızı tek noktadan yönetin.</p>
        </div>
        
        <Card className="shadow-2xl border-0 ring-1 ring-slate-200/50 dark:ring-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-6 pt-8 px-8">
            <CardTitle className="text-2xl font-bold text-center">Tekrar Hoş Geldiniz</CardTitle>
            <CardDescription className="text-center">
              Hesabınıza erişmek için giriş yapın
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta Adresi</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@posta.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/50 dark:bg-slate-950/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/50 dark:bg-slate-950/50"
                  required
                />
              </div>
              
              {error && <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-sm text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900">{error}</div>}
              
              <Button type="submit" className="w-full h-11 text-base shadow-md hover:shadow-lg transition-all" disabled={loading}>
                {loading ? "Giriş yapılıyor..." : (
                  <>
                    Giriş Yap <LogIn className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-8 text-center text-sm">
              <p className="text-slate-500 dark:text-slate-400">
                Henüz hesabınız yok mu?{" "}
                <Link href="/register" className="text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors">
                  Buradan kayıt olun
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
