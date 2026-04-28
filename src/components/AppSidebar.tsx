import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { User, Brain } from "lucide-react";
import { getUser } from "@/lib/userStore";

interface AppSidebarProps {
  onLogout?: () => void;
}

export function AppSidebar({ onLogout }: AppSidebarProps) {
  const [, setLocation] = useLocation();
  const user = getUser();

  return (
    <Sidebar className="border-r border-border bg-sidebar h-full w-52">
      <SidebarHeader className="p-4 flex flex-col items-center gap-3 pt-8">
        <div
          className="flex items-center gap-1.5 cursor-pointer mb-2"
          onClick={() => setLocation("/main")}
        >
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm text-foreground">NeuroMove</span>
        </div>

        <Avatar className="h-16 w-16 border-2 border-primary/10">
          <AvatarFallback className="bg-primary/5 text-primary">
            <User size={28} />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col items-center text-center">
          <h3 className="font-semibold text-sm text-sidebar-foreground">
            {user?.name ?? "사용자"}
          </h3>
          {user?.id && (
            <p className="text-xs text-sidebar-foreground/60 mt-0.5">
              @{user.id}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full mt-2">
          <Button
            variant="outline"
            className="w-full text-xs h-9"
            onClick={() => setLocation("/mypage")}
            data-testid="btn-go-mypage"
          >
            마이페이지
          </Button>
          <Button
            variant="outline"
            className="w-full text-xs h-9"
            onClick={() => setLocation("/calibration/start")}
            data-testid="btn-optimize-again"
          >
            최적화 다시하기
          </Button>
          <Button
            className="w-full text-xs h-9 bg-primary text-primary-foreground"
            onClick={() => setLocation("/main")}
            data-testid="btn-start-drive"
          >
            운행 시작
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent />

      <SidebarFooter className="p-4">
        {onLogout && (
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground text-xs"
            onClick={onLogout}
            data-testid="btn-sidebar-logout"
          >
            로그아웃
          </Button>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
