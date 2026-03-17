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
        <div id="cookie-consent" className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 hidden">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              We use essential cookies for authentication. See our{" "}
              <a href="/privacy" className="underline">Privacy Policy</a>.
            </p>
            <div className="flex gap-2">
              <button id="cookie-accept" className="bg-white text-gray-900 px-4 py-2 rounded text-sm font-medium hover:bg-gray-200">Accept</button>
              <button id="cookie-decline" className="border border-white px-4 py-2 rounded text-sm hover:bg-gray-800">Decline</button>
            </div>
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
