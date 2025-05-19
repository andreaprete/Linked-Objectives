import { useEffect, useState } from "react";

export function WelcomeBanner() {
  const [user, setUser] = useState({ name: "", avatar: "" });

  useEffect(() => {
    fetch("/api/user").then((res) => res.json()).then(setUser);
  }, []);

  return (
    <div className="bg-white shadow p-4 rounded">
      <div className="flex items-center space-x-4">
        <img src={user.avatar || "/avatar.png"} className="w-12 h-12 rounded-full" />
        <div>
          <h2 className="text-lg font-semibold">Welcome back, {user.name}</h2>
          <div className="text-sm text-blue-600 space-x-2">
            <a href="/profile">View Profile</a>
            <a href="/reports">View Progress Reports</a>
          </div>
        </div>
      </div>
    </div>
  );
}