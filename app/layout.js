import "./globals.css";

export const metadata = {
  title: "HRMS Portal | Every Workday, Perfectly Aligned",
  description: "A premium Human Resource Management System to track attendance, manage leave requests, view payrolls, and administer profiles.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
