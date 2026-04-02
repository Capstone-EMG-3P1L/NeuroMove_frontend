import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain } from "lucide-react";
import { setUser } from "@/lib/userStore";

const genderOptions = ["남성", "여성", "기타"];

interface SignupProps {
  onSignup: () => void;
}

export default function Signup({ onSignup }: SignupProps) {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ name: name || "사용자", age, gender, id });
    onSignup();
    setLocation("/calibration/start");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-card border border-border rounded-2xl shadow-sm p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">NeuroMove</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">회원가입</h2>
          <p className="text-muted-foreground text-sm mb-7">
            기본 정보를 입력하면 Calibration이 시작됩니다
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name" className="text-sm font-medium">
                이름
              </Label>
              <Input
                id="signup-name"
                type="text"
                placeholder="이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11"
                data-testid="input-signup-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-age" className="text-sm font-medium">
                나이
              </Label>
              <Input
                id="signup-age"
                type="number"
                placeholder="나이를 입력하세요"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="h-11"
                data-testid="input-signup-age"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">성별</Label>
              <div className="flex gap-2">
                {genderOptions.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`flex-1 h-11 rounded-lg border text-sm font-medium transition-colors ${
                      gender === g
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    }`}
                    onClick={() => setGender(g)}
                    data-testid={`button-gender-${g}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-id" className="text-sm font-medium">
                아이디
              </Label>
              <Input
                id="signup-id"
                type="text"
                placeholder="아이디를 입력하세요"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="h-11"
                data-testid="input-signup-id"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-sm font-medium">
                비밀번호
              </Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                data-testid="input-signup-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-primary text-primary-foreground font-medium mt-2"
              data-testid="button-signup-submit"
            >
              가입 후 Calibration 시작
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            이미 계정이 있으신가요?{" "}
            <button
              className="text-primary font-medium hover:underline"
              onClick={() => setLocation("/login")}
              data-testid="link-go-login"
            >
              로그인
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
