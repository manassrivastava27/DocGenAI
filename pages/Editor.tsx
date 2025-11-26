
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectById, updateProject } from '../services/storage';
import { generateSectionContent, refineContent } from '../services/geminiService';
import { Project, Section, SectionStatus, DocType } from '../types';
import { Button } from '../components/Button';
import { 
  Save, Download, Wand2, ThumbsUp, ThumbsDown, 
  MessageSquare, CheckCircle, Loader2, 
  Layout, FileText, ArrowRight, Sparkles, ChevronRight,
  FileIcon, Info, Hash, PenTool
} from 'lucide-react';

export const Editor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  
  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refineInstruction, setRefineInstruction] = useState('');
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  
  // Popup State
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (id) {
        const p = await getProjectById(id);
        if (p) {
          setProject(p);
          if (p.sections.length > 0) setActiveSectionId(p.sections[0].id);
        }
        setLoadingProject(false);
      }
    };
    load();
  }, [id]);

  const activeSection = project?.sections.find(s => s.id === activeSectionId);

  // Helper to update state locally AND persist to Firestore
  const updateProjectState = async (updatedSections: Section[]) => {
    if (!project) return;
    const updatedProject = { ...project, sections: updatedSections };
    setProject(updatedProject); // Optimistic update
    await updateProject(updatedProject); // Async save
  };

  const handleGenerateContent = async () => {
    if (!project || !activeSection) return;

    setIsGenerating(true);
    
    // Get context from previous sections (up to 2)
    const currentIndex = project.sections.findIndex(s => s.id === activeSectionId);
    const prevSections = project.sections.slice(Math.max(0, currentIndex - 2), currentIndex);
    const context = prevSections.map(s => `${s.title}: ${s.content.substring(0, 200)}...`).join('\n');

    const content = await generateSectionContent(project.topic, activeSection.title, project.type, context);
    
    const updatedSections = project.sections.map(s => 
      s.id === activeSectionId ? { ...s, content, status: SectionStatus.COMPLETED } : s
    );

    await updateProjectState(updatedSections);
    setIsGenerating(false);
  };

  const handleRefineContent = async () => {
    if (!project || !activeSection || !refineInstruction) return;
    
    setIsRefining(true);
    const refined = await refineContent(activeSection.content, refineInstruction, project.type);
    
    const updatedSections = project.sections.map(s => 
      s.id === activeSectionId ? { ...s, content: refined, status: SectionStatus.REFINING } : s
    );

    await updateProjectState(updatedSections);
    setRefineInstruction('');
    setIsRefining(false);
  };

  // Textarea change just updates local state to avoid too many writes
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!project || !activeSection) return;
    const updatedSections = project.sections.map(s => 
      s.id === activeSectionId ? { ...s, content: e.target.value } : s
    );
    setProject({ ...project, sections: updatedSections });
  };

  const handleSaveManual = async () => {
    if (project) {
      setIsSaving(true);
      await updateProject(project);
      setIsSaving(false);
      setShowSaveSuccess(true);
    }
  };

  const handleExport = async () => {
    if (!project) return;
    setIsExporting(true);

    try {
      if (project.type === DocType.DOCX) {
        // Dynamic import for docx to keep initial bundle light
        const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
        
        const docSections = project.sections.flatMap(section => [
          new Paragraph({
            text: section.title,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...section.content.split('\n').map(line => {
             const trimmed = line.trim();
             // Skip empty lines if desired, or keep them as spacers
             if (!trimmed) return new Paragraph({ text: "" });
             
             return new Paragraph({
               children: [new TextRun({
                   text: trimmed,
                   size: 24 // 12pt font
               })],
               spacing: { after: 120 }
             });
          })
        ]);

        const doc = new Document({
          sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: project.name,
                    heading: HeadingLevel.TITLE,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: `Topic: ${project.topic}`,
                    heading: HeadingLevel.HEADING_2,
                    spacing: { after: 400 }
                }),
                ...docSections
            ],
          }],
        });

        const blob = await Packer.toBlob(doc);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name.replace(/\s+/g, '_')}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

      } else if (project.type === DocType.PPTX) {
        // Dynamic import for pptxgenjs
        const module = await import('pptxgenjs');
        const PptxGenJS = (module.default || module) as any; // Handle ESM default export variations
        
        const pres = new PptxGenJS();
        
        pres.layout = 'LAYOUT_16x9';
        pres.title = project.name;

        // Title Slide
        let slide = pres.addSlide();
        slide.background = { color: "FFFFFF" };
        slide.addText(project.name, { x: 1, y: 2, w: '80%', h: 1.5, fontSize: 32, bold: true, color: '363636', align: 'center' });
        slide.addText(project.topic, { x: 1, y: 3.5, w: '80%', h: 1, fontSize: 18, color: '666666', align: 'center' });

        // Content Slides
        project.sections.forEach(section => {
            let s = pres.addSlide();
            s.addText(section.title, { x: 0.5, y: 0.4, w: '90%', h: 0.8, fontSize: 24, bold: true, color: '363636' });
            
            // Simple text handling for the body
            s.addText(section.content, { 
              x: 0.5, y: 1.3, w: '90%', h: 5, 
              fontSize: 14, color: '666666', 
              valign: 'top',
              wrap: true
            });
        });

        await pres.writeFile({ fileName: `${project.name.replace(/\s+/g, '_')}.pptx` });
      }
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to generate document. Please check console for details.");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleFeedback = async (type: 'like' | 'dislike') => {
    if (!project || !activeSection) return;
    const updatedSections = project.sections.map(s => 
      s.id === activeSectionId ? { ...s, feedback: (s.feedback === type ? null : type) } : s
    );
    await updateProjectState(updatedSections);
  };

  const addComment = async () => {
    if (!project || !activeSection || !commentText) return;
    const newComment = {
      id: Date.now().toString(),
      text: commentText,
      timestamp: Date.now()
    };
    const updatedSections = project.sections.map(s => 
      s.id === activeSectionId ? { ...s, comments: [...s.comments, newComment] } : s
    );
    await updateProjectState(updatedSections);
    setCommentText('');
  };

  if (loadingProject) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500"/></div>;
  if (!project) return <div className="p-10 text-center">Project not found.</div>;

  return (
    <div className="flex h-full bg-[#F7F9FC] relative overflow-hidden font-sans">
      
      {/* ---------------- Sidebar ---------------- */}
      <div className="w-80 bg-[#F7F9FC] border-r border-slate-200 flex flex-col z-20 shadow-sm">
        <div className="p-6 border-b border-slate-100 bg-[#F7F9FC]">
          <div className="flex items-center justify-between mb-2">
             <h2 className="font-bold text-slate-800 text-sm flex items-center tracking-wide uppercase">
               {project.type === DocType.DOCX ? <FileText className="w-4 h-4 mr-2 text-blue-600"/> : <Layout className="w-4 h-4 mr-2 text-orange-600"/>}
               Outline
             </h2>
             <span className="bg-white border border-slate-200 text-slate-500 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
               {project.sections.length}
             </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {project.sections.map((section, idx) => {
            const isActive = activeSectionId === section.id;
            const hasContent = section.content.length > 0;
            
            return (
              <button
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                className={`w-full text-left px-4 py-3.5 rounded-xl text-sm flex items-center justify-between group transition-all duration-200 relative overflow-hidden ${
                  isActive 
                    ? 'bg-white text-blue-700 shadow-md shadow-blue-900/5 ring-1 ring-black/5' 
                    : 'text-slate-600 hover:bg-white/80 hover:text-slate-900 hover:translate-x-1'
                }`}
              >
                {isActive && <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-600 rounded-r-full"></div>}
                
                <div className="flex items-center truncate flex-1 gap-3 pl-2">
                  <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                    {hasContent ? <CheckCircle className="w-3.5 h-3.5" /> : (idx + 1)}
                  </div>
                  <span className={`truncate font-medium ${isActive ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>{section.title}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 bg-[#F7F9FC] text-xs text-slate-400 text-center flex items-center justify-center gap-2">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
           DocGen AI Active
        </div>
      </div>

      {/* ---------------- Main Editor Area ---------------- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white/50 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-70 pointer-events-none"></div>

        {/* Toolbar */}
        <div className="h-24 border-b border-slate-200/60 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md z-30 sticky top-0">
           <div className="flex-1 mr-8">
             <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2">
                <span className="text-slate-400 flex items-center gap-1"><PenTool className="w-3 h-3"/> {project.type === DocType.DOCX ? 'Document' : 'Presentation'}</span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className={`flex items-center gap-1 ${activeSection?.status === SectionStatus.COMPLETED ? 'text-green-600' : 'text-blue-600'}`}>
                   {activeSection?.status === SectionStatus.COMPLETED ? 'Reviewing' : 'Drafting'}
                </span>
             </div>
             <h1 className="font-extrabold text-2xl text-slate-900 truncate tracking-tight">
               {activeSection?.title || "Select a section"}
             </h1>
           </div>
           
           <div className="flex items-center gap-4">
             <Button 
               variant="secondary" 
               onClick={handleSaveManual} 
               isLoading={isSaving}
               className="shadow-sm border-slate-200 bg-[#F3F4F6] text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-md transition-all rounded-lg px-5"
             >
               <Save className="w-4 h-4 mr-2" /> Save
             </Button>
             <Button 
               variant="primary" 
               onClick={handleExport} 
               isLoading={isExporting}
               className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all rounded-lg px-6"
             >
               <Download className="w-4 h-4 mr-2" /> Export
             </Button>
           </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
          {activeSection ? (
            <div className="max-w-4xl mx-auto py-12 px-8 min-h-full flex flex-col">
              
              {/* --- Empty State: Generation Card --- */}
              {!activeSection.content && (
                <div className="flex-1 flex flex-col items-center justify-center -mt-16">
                   <div className="w-full max-w-2xl bg-gradient-to-b from-white to-slate-50/50 rounded-3xl p-14 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-white ring-1 ring-slate-200/50 relative overflow-hidden transition-all duration-500 animate-in fade-in zoom-in-95">
                      {/* Decorative Background Gradients */}
                      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
                      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

                      <div className="relative z-10">
                        <div className="relative mx-auto w-24 h-24 bg-white border border-blue-100 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/10 group">
                          <div className="absolute inset-0 bg-blue-50/50 rounded-3xl scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                          <Wand2 className="w-12 h-12 text-blue-600 drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
                          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-amber-400 animate-bounce" style={{ animationDuration: '3s' }} />
                        </div>
                        
                        <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Ready to generate content</h3>
                        <p className="text-slate-600 mb-10 leading-relaxed max-w-lg mx-auto text-lg">
                          Gemini will analyze <span className="font-semibold text-slate-900">"{activeSection.title}"</span> and generate context-aware content tailored to your project.
                        </p>
                        
                        <div className="flex flex-col items-center gap-6">
                          <Button 
                             onClick={handleGenerateContent} 
                             isLoading={isGenerating} 
                             size="lg"
                             className="group relative pl-10 pr-8 py-5 h-auto text-lg font-semibold rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden w-full sm:w-auto"
                          >
                             <div className="absolute inset-0 bg-white/20 blur-xl group-hover:opacity-100 opacity-0 transition-opacity duration-500"></div>
                             <span className="relative flex items-center justify-center">
                               Generate Content
                               {!isGenerating && <ArrowRight className="ml-3 w-5 h-5 opacity-80 group-hover:translate-x-1.5 transition-transform" />}
                             </span>
                          </Button>

                          <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/50 px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                             <Info className="w-3.5 h-3.5" />
                             <span>You can regenerate or refine the content anytime.</span>
                          </div>
                        </div>
                        
                      </div>
                   </div>
                </div>
              )}

              {/* --- Filled State: Editor --- */}
              {activeSection.content && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                  <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* Header of Editor Card */}
                    <div className="bg-slate-50/80 backdrop-blur border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                       <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <FileIcon className="w-3.5 h-3.5" />
                          <span>Editor</span>
                       </div>
                       <div className="flex items-center gap-3">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded">{activeSection.content.length} chars</span>
                       </div>
                    </div>

                    <textarea
                      value={activeSection.content}
                      onChange={handleContentChange}
                      onBlur={() => updateProject(project)} 
                      className="w-full h-[600px] p-10 focus:outline-none resize-none text-slate-800 bg-white leading-loose text-lg font-serif placeholder:text-slate-300"
                      placeholder="Start writing..."
                    />
                    
                    {/* Feedback & Tools Bar */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                       <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => toggleFeedback('like')}
                            className={`p-2 rounded-full transition-all active:scale-95 ${activeSection.feedback === 'like' ? 'bg-green-100 text-green-700 shadow-sm' : 'hover:bg-white hover:text-green-600 text-slate-400'}`}
                            title="This content is good"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => toggleFeedback('dislike')}
                            className={`p-2 rounded-full transition-all active:scale-95 ${activeSection.feedback === 'dislike' ? 'bg-red-100 text-red-700 shadow-sm' : 'hover:bg-white hover:text-red-600 text-slate-400'}`}
                            title="Needs improvement"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                       </div>

                       <div className="h-4 w-px bg-slate-200 mx-2"></div>

                       <button 
                        onClick={() => setShowComments(!showComments)}
                        className={`text-sm font-medium flex items-center transition-colors px-3 py-1.5 rounded-lg ${showComments ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
                       >
                         <MessageSquare className="w-4 h-4 mr-2" /> 
                         {activeSection.comments.length > 0 ? `${activeSection.comments.length} Comments` : 'Add Comment'}
                       </button>
                    </div>
                  </div>

                  {/* AI Refinement Box */}
                  <div className="mt-8 bg-white rounded-2xl p-2 border border-slate-200 shadow-md flex items-center gap-3 relative ring-4 ring-slate-50/50">
                    <div className="pl-4 pr-1">
                       <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                    </div>
                    <input
                      type="text"
                      value={refineInstruction}
                      onChange={(e) => setRefineInstruction(e.target.value)}
                      placeholder="Ask AI to refine (e.g., 'Make it more formal', 'Shorten this')..."
                      className="flex-1 bg-transparent text-slate-700 placeholder:text-slate-400 text-sm py-3 focus:outline-none font-medium"
                      onKeyDown={(e) => e.key === 'Enter' && handleRefineContent()}
                    />
                    <Button 
                      onClick={handleRefineContent} 
                      isLoading={isRefining} 
                      variant="primary" 
                      disabled={!refineInstruction}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 h-auto shadow-lg shadow-indigo-200"
                    >
                      Refine
                    </Button>
                  </div>

                  {/* Comments Panel */}
                  {showComments && (
                    <div className="mt-6 bg-yellow-50/80 rounded-2xl p-6 border border-yellow-100/60 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
                      <h4 className="text-xs font-bold text-yellow-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <MessageSquare className="w-3 h-3" /> Notes & Comments
                      </h4>
                      <div className="space-y-3 mb-4">
                        {activeSection.comments.map(c => (
                          <div key={c.id} className="bg-white p-4 rounded-xl text-sm text-slate-700 shadow-sm border border-yellow-100/50 relative">
                             <div className="absolute -left-2 top-4 w-2 h-2 bg-yellow-400 rounded-full ring-2 ring-white"></div>
                             {c.text}
                             <div className="mt-2 text-[10px] text-slate-400 font-medium">
                               {new Date(c.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </div>
                          </div>
                        ))}
                        {activeSection.comments.length === 0 && (
                          <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-yellow-200 rounded-xl bg-yellow-50/50">
                            No comments yet. Add a note for yourself or your team.
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input 
                          className="flex-1 rounded-xl border border-yellow-200 bg-white text-slate-900 placeholder:text-slate-400 text-sm px-4 py-3 focus:ring-2 focus:ring-yellow-400 outline-none shadow-sm" 
                          placeholder="Type a note..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addComment()}
                        />
                        <Button size="md" onClick={addComment} variant="secondary" className="bg-white hover:bg-yellow-50 text-yellow-700 border-yellow-200 shadow-sm">Post</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
             // No Section Selected State
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
               <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                 <Layout className="w-10 h-10 text-slate-300" />
               </div>
               <p className="font-semibold text-lg text-slate-500">Select a section to start editing</p>
               <p className="text-sm text-slate-400 mt-2">Choose from the outline on the left</p>
            </div>
          )}
        </div>
      </div>

      {/* Success Popup Modal */}
      {showSaveSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-white/50 p-8 max-w-sm w-full text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-green-500"></div>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-50 mb-6 shadow-inner ring-4 ring-green-50">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Saved!</h3>
            <p className="text-slate-500 mb-8 text-sm">
              Your progress has been securely saved to the cloud.
            </p>
            <Button 
              className="w-full py-3 text-base bg-slate-900 hover:bg-slate-800 shadow-lg rounded-xl" 
              onClick={() => setShowSaveSuccess(false)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
