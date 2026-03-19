import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClientPulse - Client Intake & Follow-Up Automation",
  description: "Automate client intake and follow-up for your service business. Capture leads, send automated follow-ups, and never lose a client again.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <div id="cookie-consent" className="fixed bottom-4 right-4 z-50 hidden max-w-sm bg-white border border-gray-200 rounded-2xl shadow-xl p-4">
          <p className="text-sm text-gray-600 mb-3">
            We use essential cookies for authentication. See our{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
          </p>
          <div className="flex gap-2">
            <button id="cookie-accept" className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Accept</button>
            <button id="cookie-decline" className="flex-1 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition">Decline</button>
          </div>
        </div>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            if(localStorage.getItem('cookie-consent'))return;
            document.getElementById('cookie-consent').style.display='block';
            document.getElementById('cookie-accept').onclick=function(){localStorage.setItem('cookie-consent','accepted');document.getElementById('cookie-consent').style.display='none'};
            document.getElementById('cookie-decline').onclick=function(){localStorage.setItem('cookie-consent','declined');document.getElementById('cookie-consent').style.display='none'};
          })();
        `}} />
      </body>
    </html>
  );
}
