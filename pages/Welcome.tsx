
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { FileText, Presentation, Sparkles, Layout as LayoutIcon, ArrowRight, PenTool, Download } from 'lucide-react';

export const Welcome: React.FC = () => {
  return (
    <div className="flex flex-col gap-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white isolate shadow-xl">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] filter contrast-125 brightness-100"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-30">
          <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] clip-path-polygon"></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center relative z-10">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex justify-center animate-fade-in-up">
               <div className="rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium leading-6 text-blue-50 border border-white/20 shadow-sm">
                  ✨ New: Export to PowerPoint 2.0
               </div>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-8 drop-shadow-sm">
              Docs & Decks, <br/>
              <span className="text-blue-200">Generated in Seconds</span>
            </h1>
            <p className="text-xl leading-relaxed text-blue-100 mb-12 max-w-2xl mx-auto font-light">
              DocGen AI transforms your raw ideas into structured Word reports and professional PowerPoint slides instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              {/* Primary CTA - High Contrast (White on Blue) */}
              <Link 
                to="/create" 
                className="
                  group w-full sm:w-auto inline-flex items-center justify-center 
                  px-8 py-4 text-lg font-bold text-blue-700 
                  bg-white rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.1),0_4px_6px_rgba(0,0,0,0.05)] 
                  hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(0,0,0,0.12),0_6px_8px_rgba(0,0,0,0.08)]
                  transition-all duration-200 ease-out
                "
              >
                Start Creating 
                <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              {/* Secondary CTA - Glass Style */}
              <Link 
                to="/dashboard" 
                className="
                  group w-full sm:w-auto inline-flex items-center justify-center 
                  px-8 py-4 text-lg font-semibold text-white 
                  bg-white/10 border border-white/20 
                  backdrop-blur-sm rounded-xl
                  hover:bg-white/20 hover:border-white/40
                  transition-all duration-200 ease-out
                "
              >
                View Dashboard
              </Link>
            </div>

            {/* Social Proof / Trust Badge */}
            <div className="mt-14 pt-8 border-t border-white/10 flex flex-col items-center gap-4">
              <p className="text-sm text-blue-200 font-medium uppercase tracking-widest opacity-70">Trusted by professionals at</p>
              <div className="flex gap-8 opacity-50 grayscale mix-blend-screen hover:opacity-70 transition-opacity duration-300">
                {/* Mock Logos */}
                <div className="font-bold text-xl tracking-tighter">ACME Corp</div>
                <div className="font-bold text-xl tracking-tighter">Globex</div>
                <div className="font-bold text-xl tracking-tighter">Soylent</div>
                <div className="font-bold text-xl tracking-tighter">Initech</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-bold tracking-wide text-blue-600 uppercase mb-2">Workflow Optimized</h2>
          <p className="text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Everything you need to write efficiently
          </p>
          <p className="text-lg text-slate-600 leading-relaxed">
            Stop staring at a blank cursor. Let our AI handle the structure, drafting, and formatting so you can focus on the content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Card 1 */}
          <div className="group relative bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
              <LayoutIcon className="h-7 w-7 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Intelligent Outlining</h3>
            <p className="text-slate-600 leading-relaxed">
              Describe your topic and let our AI propose a logical, professional structure for your document or slide deck in seconds.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group relative bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
              <Sparkles className="h-7 w-7 text-indigo-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Generation</h3>
            <p className="text-slate-600 leading-relaxed">
              Draft content section by section. The AI maintains context from previous sections to ensure your narrative flows perfectly.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group relative bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors duration-300">
              <FileText className="h-7 w-7 text-orange-500 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Dual Formats</h3>
            <p className="text-slate-600 leading-relaxed">
              Seamlessly switch between Word documents and PowerPoint presentations. Export your work instantly to the format you need.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works - Steps */}
      <section className="relative bg-slate-50/80 py-24 rounded-[3rem] -mx-4 sm:mx-0">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">How it works</h2>
            <p className="mt-4 text-lg text-slate-600">
              From rough idea to downloadable file in three simple steps.
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-3">
             {/* Connecting Line (Desktop) */}
            <div className="absolute top-12 left-1/6 right-1/6 h-0.5 border-t-2 border-dashed border-slate-300 hidden lg:block pointer-events-none" aria-hidden="true"></div>

            {/* Step 1 */}
            <div className="relative flex flex-col items-center text-center z-10">
              <div className="w-24 h-24 bg-white rounded-full shadow-md flex items-center justify-center mb-6 border-4 border-slate-50">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-inner">
                   <PenTool className="w-8 h-8" />
                </div>
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold border-4 border-white shadow-sm">1</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Choose & Define</h3>
              <p className="text-slate-600 max-w-xs leading-relaxed">
                Select Document or Presentation format and simply describe your topic to the AI.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative flex flex-col items-center text-center z-10">
              <div className="w-24 h-24 bg-white rounded-full shadow-md flex items-center justify-center mb-6 border-4 border-slate-50">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-inner">
                   <LayoutIcon className="w-8 h-8" />
                </div>
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold border-4 border-white shadow-sm">2</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Structure & Generate</h3>
              <p className="text-slate-600 max-w-xs leading-relaxed">
                Review the AI-suggested outline, then generate comprehensive content for each section.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative flex flex-col items-center text-center z-10">
              <div className="w-24 h-24 bg-white rounded-full shadow-md flex items-center justify-center mb-6 border-4 border-slate-50">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white shadow-inner">
                   <Download className="w-8 h-8" />
                </div>
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold border-4 border-white shadow-sm">3</div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Refine & Export</h3>
              <p className="text-slate-600 max-w-xs leading-relaxed">
                Tweak the content with AI commands and export your polished file to .docx or .pptx.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="mx-auto max-w-5xl px-4 lg:px-8">
         <div className="relative rounded-3xl bg-slate-800 px-6 py-16 sm:py-20 sm:px-12 shadow-2xl overflow-hidden text-center">
            {/* Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl mb-6">
                 Ready to start creating?
              </h2>
              <p className="text-lg leading-relaxed text-slate-300 mb-10 max-w-2xl mx-auto">
                 Join thousands of professionals who are saving hours on documentation every week. No credit card required.
              </p>
              <Link to="/create">
                 <Button className="bg-blue-500 hover:bg-blue-400 text-white px-10 py-4 h-auto text-lg font-semibold rounded-xl shadow-lg shadow-blue-900/50 hover:scale-105 transition-transform border-none">
                    Start Your First Project
                    <Sparkles className="w-5 h-5 ml-2" />
                 </Button>
              </Link>
            </div>
         </div>
      </section>
    </div>
  );
};
