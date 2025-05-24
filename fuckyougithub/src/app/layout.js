import "./globals.css";




export const metadata = {
  title: "Linked Objectives",
  description: "A web app to help you manage your objectives and key results",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>
          {children}
      </body>
    </html>
  );
}
