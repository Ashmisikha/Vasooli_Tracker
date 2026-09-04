import React from 'react';
import { Mail, Phone, Github, Linkedin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16 text-gray-600">
      <div className="container mx-auto px-4 py-10 max-w-7xl">
        
        {/* Main Branding Header */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-extrabold text-[#1A1A2E] flex items-center justify-center gap-2">
            <span className="text-[#00D09C]">Vasooli</span> Wealth - <span className="text-[#FF9933]">"Recovering value, building wealth"</span>
          </h3>
          <p className="text-sm text-gray-500 mt-1 font-semibold flex items-center justify-center gap-1.5">
            Built with <Heart className="w-4 h-4 text-[#EF4444] fill-[#EF4444]" /> for CODE 2026 Hackathon
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
          
          {/* Email & Phone Card */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
            <h4 className="font-extrabold text-[#1A1A2E] text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#00D09C]" /> Contact & Support
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-400">Email:</span>
                <a href="mailto:ashmisikhapiri@gmail.com" className="text-[#00D09C] font-bold hover:underline">
                  ashmisikhapiri@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-400">Phone:</span>
                <span className="font-bold text-gray-800">+91 98765 43210</span>
              </div>
            </div>
          </div>

          {/* Social Profiles Card */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
            <h4 className="font-extrabold text-[#1A1A2E] text-sm flex items-center gap-2">
              <Github className="w-4 h-4 text-gray-900" /> Developer Portfolios
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-400">GitHub:</span>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[#00D09C] font-bold hover:underline"
                >
                  github.com/ashmisikhapiri
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-400">LinkedIn:</span>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-[#00D09C] font-bold hover:underline"
                >
                  linkedin.com/in/ashmisikhapiri
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Line */}
        <div className="text-center border-t border-gray-100 pt-6 text-xs text-gray-400 font-semibold">
          © 2026 Ashmi Sikhapiri. Vasooli Wealth. All rights reserved. • CODE 2026 Hackathon Edition
        </div>

      </div>
    </footer>
  );
}
