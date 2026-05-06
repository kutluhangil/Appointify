import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CalendarClock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signIn(loginEmail, loginPassword);
      toast({ title: "Hoş geldiniz!" });
    } catch (error: any) {
      toast({ title: "Giriş başarısız", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword.length < 6) {
      toast({ title: "Şifre çok kısa", description: "En az 6 karakter gerekli", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await signUp(signupEmail, signupPassword, signupName);
      toast({ title: "Hesap oluşturuldu!", description: "E-postanızı doğrulamayı unutmayın." });
    } catch (error: any) {
      toast({ title: "Kayıt başarısız", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-[400px]">
        <div className="border border-border rounded-xl p-8 space-y-6 bg-card">
          <div className="flex flex-col items-start gap-3">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <CalendarClock className="h-5 w-5 text-foreground" />
              <span className="text-[16px] font-semibold text-foreground tracking-tight">Appointify</span>
            </Link>
            <div>
              <p className="text-[15px] font-medium text-foreground">Hesabınıza giriş yapın</p>
              <p className="text-[13px] text-muted-foreground mt-0.5">Randevu yönetiminize devam edin</p>
            </div>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 h-9 p-0.5">
              <TabsTrigger value="login" className="text-[12px]">Giriş Yap</TabsTrigger>
              <TabsTrigger value="signup" className="text-[12px]">Kayıt Ol</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-5">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[12px]">E-posta</Label>
                  <Input
                    type="email"
                    placeholder="siz@ornek.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="h-9 text-[13px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Şifre</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="h-9 text-[13px]"
                  />
                </div>
                <Button type="submit" className="w-full h-9 text-[13px]" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  Giriş Yap
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-5">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Ad Soyad</Label>
                  <Input
                    type="text"
                    placeholder="Ahmet Yılmaz"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    className="h-9 text-[13px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">E-posta</Label>
                  <Input
                    type="email"
                    placeholder="siz@ornek.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    className="h-9 text-[13px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px]">Şifre</Label>
                  <Input
                    type="password"
                    placeholder="En az 6 karakter"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-9 text-[13px]"
                  />
                </div>
                <Button type="submit" className="w-full h-9 text-[13px]" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  Hesap Oluştur
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-[11px] text-muted-foreground text-center">
            Devam ederek{" "}
            <span className="underline cursor-pointer">Kullanım Koşulları</span>
            {" "}ve{" "}
            <span className="underline cursor-pointer">Gizlilik Politikası</span>
            'nı kabul etmiş olursunuz.
          </p>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-6">
          © {new Date().getFullYear()} Appointify
        </p>
      </div>
    </div>
  );
}
