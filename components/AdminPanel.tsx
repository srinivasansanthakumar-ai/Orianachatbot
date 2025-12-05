import React, { useState, useRef } from 'react';
import { DocumentChunk, UploadedFile } from '../types';
import { processFile } from '../services/documentService';
import { initializeGemini } from '../services/geminiService';

interface AdminPanelProps {
  onBack: () => void;
  onFilesUpdated: (newChunks: DocumentChunk[], newFile: UploadedFile) => void;
  files: UploadedFile[];
  apiKey: string;
  setApiKey: (key: string) => void;
  logoUrl: string;
  setLogoUrl: (url: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onBack, 
  onFilesUpdated, 
  files, 
  apiKey, 
  setApiKey,
  logoUrl,
  setLogoUrl
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [tempKey, setTempKey] = useState(apiKey);

  const handleSaveKey = () => {
    if(!tempKey.trim()) {
      setStatusMsg("Please enter a valid API Key.");
      return;
    }
    setApiKey(tempKey);
    initializeGemini(tempKey);
    setStatusMsg("API Key saved and Gemini initialized.");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setLogoUrl(reader.result);
          setStatusMsg("Logo updated successfully.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    if (!apiKey) {
      alert("Please save a valid Gemini API Key first.");
      if(fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsProcessing(true);
    setStatusMsg("Starting upload...");

    try {
      const file = fileList[0]; 
      const result = await processFile(file, (msg) => setStatusMsg(msg));
      
      onFilesUpdated(result.chunks, result.fileInfo);
      setStatusMsg(`Successfully processed ${file.name} into ${result.chunks.length} knowledge vectors.`);
    } catch (err: any) {
      console.error(err);
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-emerald-700 p-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold"><i className="fas fa-user-shield mr-2"></i>Admin Dashboard</h2>
          <button onClick={onBack} className="text-white hover:text-gray-200">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          
          {/* API Key Section */}
          <div className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-2 text-emerald-800">1. System Configuration</h3>
            <label className="block text-sm font-medium text-gray-700 mb-1">Google Gemini API Key</label>
            <div className="flex gap-2">
              <input 
                type="password" 
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="Paste AIzaSy..."
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button 
                onClick={handleSaveKey}
                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition"
              >
                Save
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Required for RAG embeddings and generation.</p>
          </div>

          {/* Branding Section */}
          <div className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
             <h3 className="text-lg font-semibold mb-2 text-emerald-800">2. Brand Customization</h3>
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 border rounded bg-white flex items-center justify-center overflow-hidden">
                   <img src={logoUrl} alt="Preview" className="w-full h-full object-contain" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Update Oriana Logo</label>
                   <input 
                      type="file"
                      ref={logoInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-emerald-50 file:text-emerald-700
                        hover:file:bg-emerald-100
                      "
                   />
                </div>
             </div>
          </div>

          {/* Knowledge Base Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-emerald-800">3. Knowledge Base Management</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition relative">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.md,.json,.csv" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isProcessing}
              />
              <div className="pointer-events-none">
                <i className="fas fa-cloud-upload-alt text-4xl text-emerald-500 mb-2"></i>
                <p className="font-medium text-gray-700">Click to Upload Documents</p>
                <p className="text-sm text-gray-500">Supports .txt, .md, .json (Convert PDFs to text for best results)</p>
              </div>
            </div>

            {isProcessing && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded flex items-center animate-pulse">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {statusMsg}
              </div>
            )}
             {!isProcessing && statusMsg && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded flex items-center">
                <i className="fas fa-info-circle mr-2"></i>
                {statusMsg}
              </div>
            )}
          </div>

          {/* File List */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Active Documents ({files.length})</h3>
            <div className="max-h-40 overflow-y-auto bg-gray-50 border rounded-md">
              {files.length === 0 ? (
                <p className="text-gray-400 italic p-4 text-center">No documents uploaded yet.</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {files.map((f, idx) => (
                    <li key={idx} className="flex justify-between items-center p-3 bg-white hover:bg-gray-50">
                      <span className="flex items-center text-gray-700 truncate max-w-[60%]">
                        <i className="fas fa-file-alt text-emerald-500 mr-3"></i>
                        <span className="truncate">{f.name}</span>
                      </span>
                      <div className="flex items-center space-x-3 text-sm flex-shrink-0">
                         <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-bold">
                          {f.chunksCount} vectors
                         </span>
                         <span className="text-green-500 text-xs"><i className="fas fa-check"></i> Active</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminPanel;