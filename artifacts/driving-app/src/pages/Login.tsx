import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain } from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [, setLocation] = useLocation();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
    setLocation("/main");
  };

  return (
    <div className="min-h-screen flex bg-background">
      <motion.div
        className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary/90 to-primary/60 items-center justify-center relative overflow-hidden"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/30"
              style={{
                width: `${(i + 1) * 70}px`,
                height: `${(i + 1) * 70}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-white text-center px-8">
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Brain className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-3">NeuroMove</h1>
          <p className="text-white/80 text-lg">중증장애인을 위한 신경 기반 이동 보조 시스템</p>
          <p className="text-white/60 text-sm mt-3 max-w-xs mx-auto">
            뇌신경 신호를 분석하여 개인 맞춤형 운행 보조를 제공합니다
          </p>
        </div>
      </motion.div>

      <motion.div
        className="flex-1 flex items-center justify-center px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">NeuroMove</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">로그인</h2>
          <p className="text-muted-foreground text-sm mb-8">계정에 로그인하세요</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="login-id" className="text-sm font-medium">
                아이디
              </Label>
              <Input
                id="login-id"
                type="text"
                placeholder="아이디를 입력하세요"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="h-11"
                data-testid="input-login-id"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-sm font-medium">
                비밀번호
              </Label>
              <Input
                id="login-password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                data-testid="input-login-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary text-primary-foreground font-medium"
              data-testid="button-login-submit"
            >
              로그인
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            계정이 없으신가요?{" "}
            <button
              className="text-primary font-medium hover:underline"
              onClick={() => setLocation("/signup")}
              data-testid="link-go-signup"
            >
              회원가입
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
