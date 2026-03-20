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
        <div id="cookie-consent" className="fixed bottom-4 right-4 z-50 hidden max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-xl p-4">
          <p className="text-sm text-slate-300 mb-3">
            We use essential cookies for authentication. See our{" "}
            <a href="/privacy" className="text-blue-400 font-medium hover:text-blue-300 underline underline-offset-2">Privacy Policy</a>.
          </p>
          <div className="flex gap-2">
            <button id="cookie-accept" className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-400 transition">Accept</button>
            <button id="cookie-decline" className="flex-1 border border-slate-600 text-slate-300 px-3 py-2 rounded-lg text-sm hover:bg-slate-800 transition">Decline</button>
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
