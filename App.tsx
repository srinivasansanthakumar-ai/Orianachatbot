import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import AdminPanel from './components/AdminPanel';
import { AppState, DocumentChunk, UploadedFile } from './types';
import { ADMIN_CREDS, BRAND_COLORS, ORIANA_LOGO_URL } from './constants';
import { initializeGemini } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.CHAT);
  
  // RAG State
  const [apiKey, setApiKey] = useState<string>(process.env.API_KEY || '');
  const [knowledgeBase, setKnowledgeBase] = useState<DocumentChunk[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  // Branding State
  const [customLogo, setCustomLogo] = useState<string>(ORIANA_LOGO_URL);

  // Admin Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Initial check for API key in env
  useEffect(() => {
    if (apiKey) {
      initializeGemini(apiKey);
    }
  }, [apiKey]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_CREDS.username && password === ADMIN_CREDS.password) {
      setAppState(AppState.ADMIN_PANEL);
      setLoginError('');
      setUsername('');
      setPassword('');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleUpdateKnowledgeBase = (newChunks: DocumentChunk[], fileInfo: UploadedFile) => {
    setKnowledgeBase(prev => [...prev, ...newChunks]);
    // Ensure we create a new array reference to trigger re-renders
    setUploadedFiles(prev => [...prev, fileInfo]);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${BRAND_COLORS.gradient} flex items-center justify-center p-4 md:p-6 relative`}>
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white opacity-5 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-yellow-400 opacity-10 rounded-full filter blur-3xl"></div>
      </div>

      {/* Top Right Admin Button */}
      <div className="absolute top-4 right-4 z-40">
        <button 
          onClick={() => setAppState(AppState.ADMIN_LOGIN)}
          className="text-white/80 hover:text-white hover:bg-white/10 px-3 py-1 rounded-full text-xs font-semibold transition flex items-center backdrop-blur-sm border border-white/20"
        >
          <i className="fas fa-cog mr-1"></i> Admin Settings
        </button>
      </div>

      {/* Main Content Render */}
      {appState === AppState.CHAT && (
        <div className="w-full max-w-lg z-10">
           <div className="mb-6 text-center">
              <img src={customLogo} alt="Oriana Logo" className="h-16 mx-auto mb-2 rounded-lg shadow-lg object-contain bg-white/20 backdrop-blur-sm p-1" />
           </div>
           <ChatInterface knowledgeBase={knowledgeBase} apiKey={apiKey} logoUrl={customLogo} />
        </div>
      )}

      {/* Admin Login Modal */}
      {appState === AppState.ADMIN_LOGIN && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm">
            <h2 className="text-2xl font-bold text-center text-emerald-800 mb-6">Admin Access</h2>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
              <div className="flex gap-2 mt-4">
                 <button 
                   type="button" 
                   onClick={() => setAppState(AppState.CHAT)}
                   className="flex-1 py-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
                 >
                   Cancel
                 </button>
                 <button 
                   type="submit" 
                   className="flex-1 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 shadow-lg"
                 >
                   Login
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {appState === AppState.ADMIN_PANEL && (
        <AdminPanel 
          onBack={() => setAppState(AppState.CHAT)}
          apiKey={apiKey}
          setApiKey={setApiKey}
          onFilesUpdated={handleUpdateKnowledgeBase}
          files={uploadedFiles}
          logoUrl={customLogo}
          setLogoUrl={setCustomLogo}
        />
      )}

    </div>
  );
};

export default App;