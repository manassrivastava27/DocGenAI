
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProjects, deleteProject } from '../services/storage';
import { Project, DocType } from '../types';
import { Plus, FileText, Presentation, Trash2, Clock, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '../components/Button';

export const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Delete Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await getProjects();
      setProjects(data);
      setIsLoading(false);
    };
    fetchProjects();
  }, []);

  const promptDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    try {
      await deleteProject(deleteId);
      // Update local state to remove the deleted project without re-fetching
      setProjects(prev => prev.filter(p => p.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete", error);
      alert("Failed to delete project. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-500">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Projects</h1>
          <p className="text-slate-500">Manage and create your AI-generated documents.</p>
        </div>
        <Link to="/create">
          <Button icon={<Plus className="w-5 h-5" />}>New Project</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="mx-auto h-12 w-12 text-slate-400">
            <FileText className="w-full h-full" />
          </div>
          <h3 className="mt-2 text-sm font-semibold text-slate-900">No projects</h3>
          <p className="mt-1 text-sm text-slate-500">Get started by creating a new document.</p>
          <div className="mt-6">
            <Link to="/create">
              <Button variant="secondary" icon={<Plus className="w-4 h-4" />}>Create Project</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/project/${project.id}`)}
              className="group relative bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-lg ${project.type === DocType.DOCX ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                  {project.type === DocType.DOCX ? <FileText className="w-6 h-6" /> : <Presentation className="w-6 h-6" />}
                </div>
                <button
                  onClick={(e) => promptDelete(e, project.id)}
                  className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors z-10"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 truncate">{project.name}</h3>
              <p className="text-sm text-slate-500 truncate mb-4">{project.topic}</p>
              
              <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-100">
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(project.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Open <ChevronRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Delete Project?</h3>
            <p className="text-center text-slate-500 text-sm mb-6 leading-relaxed">
              Are you sure you want to delete this project? <br/>
              <span className="font-semibold text-red-600">This action cannot be undone and the project cannot be revived.</span>
            </p>
            
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                onClick={() => setDeleteId(null)} 
                className="flex-1"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={confirmDelete} 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100"
                isLoading={isDeleting}
              >
                Delete Forever
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
