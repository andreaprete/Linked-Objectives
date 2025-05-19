import { SidebarNav } from "@/components/SidebarNav";
import { TopNavbar } from "@/components/TopNavbar";
import { WelcomeBanner } from "@/components/WelcomeBanner";
import { WeeklyOverview } from "@/components/WeeklyOverview";
import { GoalsTabs } from "@/components/GoalsTabs";

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarNav />
      <div className="flex-1 flex flex-col">
        <TopNavbar />
        <main className="p-6 space-y-6">
          <WelcomeBanner />
          <WeeklyOverview />
          <GoalsTabs />
        </main>
      </div>
    </div>
  );
}