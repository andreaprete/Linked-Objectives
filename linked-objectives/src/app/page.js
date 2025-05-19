// export default function Home() {
//  return (
//    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white p-8">
//      <h1 className="text-3xl font-bold">Welcome to your OKR page</h1>
//    </div>
//  );
//}

import { SidebarNav } from "C:/Users/Admin/Desktop/Linked-Objectives/linked-objectives/src/app/components/SidebarNav";
import { TopNavbar } from "C:/Users/Admin/Desktop/Linked-Objectives/linked-objectives/src/app/components/TopNavbar";
import { WelcomeBanner } from "C:/Users/Admin/Desktop/Linked-Objectives/linked-objectives/src/app/components/WelcomeBanner";
import { WeeklyOverview } from "C:/Users/Admin/Desktop/Linked-Objectives/linked-objectives/src/app/components/WeeklyOverview";
import { GoalsTabs } from "C:/Users/Admin/Desktop/Linked-Objectives/linked-objectives/src/app/components/GoalsTabs";

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