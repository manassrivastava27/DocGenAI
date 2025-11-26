import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocType } from '../types';
import { createProject } from '../services/storage';
import { generateOutline } from '../services/geminiService';
import { Button } from '../components/Button';
import { 
  FileText, Presentation, Sparkles, Plus, X, ArrowLeft, ArrowRight, 
  Check, Type, AlignLeft, Lightbulb, GripVertical, Layers, Hash
} from 'lucide-react';

export const Wizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form State
  const [type, setType] = useState<DocType>(DocType.DOCX);
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  // Allow string for empty state during typing
  const [targetCount, setTargetCount] = useState<number | string>(8); 
  const [outline, setOutline] = useState<string[]>([]);
  const [showExamples, setShowExamples] = useState(false);
  
  // Drag State
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const handleGenerateOutline = async () => {
    if (!topic) return;
    setLoading(true);
    // Ensure valid number before generating
    const count = typeof targetCount === 'string' ? (parseInt(targetCount) || 8) : targetCount;
    const suggestions = await generateOutline(topic, type, count);
    setOutline(suggestions);
    setLoading(false);
  };

  const handleAddSection = () => {
    setOutline([...outline, "New Section"]);
  };

  const handleRemoveSection = (index: number) => {
    setOutline(outline.filter((_, i) => i !== index));
  };

  const handleUpdateSection = (index: number, value: string) => {
    const newOutline = [...outline];
    newOutline[index] = value;
    setOutline(newOutline);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault(); 
    if (draggedItem === null) return;
    if (draggedItem === index) return;

    const newOutline = [...outline];
    const item = newOutline[draggedItem];
    newOutline.splice(draggedItem, 1);
    newOutline.splice(index, 0, item);
    
    setOutline(newOutline);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleCreateProject = async () => {
    setCreating(true);
    try {
      const project = await createProject(name || topic, topic, type, outline);
      navigate(`/project/${project.id}`);
    } catch (error) {
      console.error("Failed to create project", error);
      alert("Failed to create project. Please try again.");
      setCreating(false);
    }
  };

  const exampleTopics = [
    "A research summary on sustainable indoor plants",
    "An overview of AI adoption in healthcare",
    "A 2025 EV industry analysis",
    "A beginner-friendly guide on money plants"
  ];

  return (
    <div className="max-w-2xl mx-auto">
       {/* Stepper */}
       <div className="mb-8 flex justify-between items-center px-4 sm:px-8">
          {[
            { num: 1, label: 'Type' },
            { num: 2, label: 'Topic' },
            { num: 3, label: 'Outline' }
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center">
               <div className={`
                 flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 transition-colors
                 ${step > s.num ? 'bg-green-500 border-green-500 text-white' : 
                   step === s.num ? 'bg-blue-600 border-blue-600 text-white' : 
                   'bg-white border-slate-200 text-slate-400'}
               `}>
                 {step > s.num ? <Check className="w-4 h-4" /> : s.num}
               </div>
               <span className={`ml-2 text-sm font-medium hidden sm:block ${step === s.num ? 'text-slate-900' : 'text-slate-400'}`}>
                 {s.label}
               </span>
               {idx < 2 && <div className="w-12 h-0.5 bg-slate-100 mx-4 hidden sm:block"></div>}
            </div>
          ))}
       </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8">
          
          {/* Step 1: Type Selection */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Format</h2>
              <p className="text-slate-500 mb-8">What kind of document are you creating today?</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div 
                  onClick={() => setType(DocType.DOCX)}
                  className={`group p-6 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center text-center relative overflow-hidden ${type === DocType.DOCX ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${type === DocType.DOCX ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className={`font-bold text-lg ${type === DocType.DOCX ? 'text-blue-900' : 'text-slate-900'}`}>Word Document</h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">Best for reports, articles, and detailed business documents.</p>
                  {type === DocType.DOCX && <div className="absolute top-4 right-4 text-blue-600"><Check className="w-5 h-5" /></div>}
                </div>

                <div 
                  onClick={() => setType(DocType.PPTX)}
                  className={`group p-6 border-2 rounded-2xl cursor-pointer transition-all flex flex-col items-center text-center relative overflow-hidden ${type === DocType.PPTX ? 'border-orange-500 bg-orange-50/50 shadow-sm' : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50'}`}
                >
                   <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${type === DocType.PPTX ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500'}`}>
                    <Presentation className="w-8 h-8" />
                  </div>
                  <h3 className={`font-bold text-lg ${type === DocType.PPTX ? 'text-orange-900' : 'text-slate-900'}`}>PowerPoint</h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">Best for slide decks, pitches, and visual presentations.</p>
                  {type === DocType.PPTX && <div className="absolute top-4 right-4 text-orange-500"><Check className="w-5 h-5" /></div>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Topic Input */}
          {step === 2 && (
            <div className="animate-fade-in space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                   <h2 className="text-2xl font-bold text-slate-900">Define Your Topic</h2>
                   <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${type === DocType.DOCX ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                     {type === DocType.DOCX ? 'Word Doc' : 'PowerPoint'}
                   </span>
                </div>
                <p className="text-slate-500 mt-1">Help the AI understand what you want to create.</p>
              </div>

              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex-1">
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                      <Type className="w-4 h-4 mr-2 text-slate-400" />
                      Project Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 transition-all"
                      placeholder="e.g., Q3 Financial Report"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  {/* Target Count Selector */}
                  <div className="w-full sm:w-36">
                    <label className="flex items-center text-sm font-semibold text-slate-700 mb-2 whitespace-nowrap">
                      {type === DocType.PPTX ? (
                        <Layers className="w-4 h-4 mr-2 text-orange-500" />
                      ) : (
                        <Hash className="w-4 h-4 mr-2 text-blue-500" />
                      )}
                      {type === DocType.PPTX ? 'Slides' : 'Sections'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={targetCount}
                        onChange={(e) => setTargetCount(e.target.value)}
                        onBlur={() => {
                          let val = parseInt(String(targetCount));
                          if (isNaN(val) || val < 1) val = 5; // Default to 5 if invalid
                          if (val > 50) val = 50;
                          setTargetCount(val);
                        }}
                        className={`w-full rounded-xl border shadow-sm focus:ring-2 px-4 py-3 font-bold text-center outline-none
                          ${type === DocType.PPTX 
                            ? 'border-orange-200 bg-orange-50 text-orange-900 focus:border-orange-500 focus:ring-orange-500' 
                            : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-blue-500 focus:ring-blue-500'}
                        `}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                    <AlignLeft className="w-4 h-4 mr-2 text-slate-400" />
                    What is this document about?
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-2 p-4 bg-white text-slate-900 placeholder:text-slate-400 transition-all resize-none"
                    rows={6}
                    placeholder="Describe your topic in a few sentences..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                {/* Suggestions Toggle */}
                <div>
                   <button 
                     onClick={() => setShowExamples(!showExamples)}
                     className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                   >
                     <Lightbulb className="w-4 h-4 mr-1.5" />
                     {showExamples ? 'Hide examples' : 'Need inspiration? See examples'}
                   </button>
                   
                   {showExamples && (
                     <div className="mt-3 grid grid-cols-1 gap-2">
                        {exampleTopics.map((ex, i) => (
                          <button 
                            key={i}
                            onClick={() => setTopic(ex)}
                            className="text-left text-sm text-slate-600 hover:bg-slate-50 p-2 rounded-lg border border-transparent hover:border-slate-200 transition-all"
                          >
                            "{ex}"
                          </button>
                        ))}
                     </div>
                   )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Outline */}
          {step === 3 && (
            <div className="animate-fade-in space-y-6">
               <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-blue-900 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
                      AI Structure Assistant
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">Generate a professional outline based on your topic.</p>
                  </div>
                  <Button 
                    onClick={handleGenerateOutline} 
                    isLoading={loading}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
                  >
                    Regenerate
                  </Button>
               </div>

               <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700">
                      {type === DocType.DOCX ? 'Document Sections' : 'Presentation Slides'}
                    </label>
                    <span className="text-xs text-slate-400">{outline.length} items</span>
                  </div>
                  
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {outline.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-slate-400 text-sm">No sections yet.</p>
                        <p className="text-slate-400 text-xs mt-1">Click "Generate Outline" or add manually.</p>
                      </div>
                    )}
                    {outline.map((item, idx) => (
                      <div 
                        key={idx} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={`flex gap-3 items-center group bg-white p-2 rounded-lg border transition-all ${
                          draggedItem === idx 
                            ? 'border-blue-300 bg-blue-50 opacity-80 shadow-md z-10' 
                            : 'border-transparent hover:border-slate-200 hover:shadow-sm'
                        }`}
                      >
                        {/* Drag Handle */}
                        <div 
                          className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-blue-600 transition-colors p-1"
                          title="Drag to reorder"
                        >
                           <GripVertical className="w-5 h-5" />
                        </div>

                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-medium select-none">
                          {idx + 1}
                        </div>
                        <input 
                          value={item}
                          onChange={(e) => handleUpdateSection(idx, e.target.value)}
                          className="flex-1 border border-slate-200 rounded-lg p-2.5 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                        />
                        <button 
                          onClick={() => handleRemoveSection(idx)} 
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove Section"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={handleAddSection}
                    className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 font-medium transition-all flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Manually
                  </button>
               </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-10 pt-6 flex items-center justify-between border-t border-slate-100">
            {step > 1 ? (
              <button 
                onClick={() => setStep(step - 1)}
                className="text-slate-500 hover:text-slate-800 font-medium text-sm flex items-center px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </button>
            ) : (
              <div /> 
            )}
            
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400 hidden sm:inline">
                {step === 3 ? "Ready to finalize?" : "You can refine this later"}
              </span>
              {step < 3 ? (
                <Button 
                  onClick={() => setStep(step + 1)} 
                  disabled={step === 2 && !topic}
                  className="px-8 shadow-lg shadow-blue-100 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:opacity-100 text-white transition-colors"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleCreateProject} 
                  disabled={outline.length === 0}
                  isLoading={creating}
                  className="px-8 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-100"
                >
                  Create Project <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};