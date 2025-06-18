// layout.js (NO "use client" here)
import "./globals.css";
import SessionWrapper from "./SessionWrapper";

export const metadata = {
  title: "Linked Objectives",
  description: "A web app to help you manage your objectives and key results",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
