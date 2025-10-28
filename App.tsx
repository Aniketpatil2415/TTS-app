

import React, { useState } from 'react';
import ChatBot from './components/ChatBot';
import TextToSpeech from './components/TextToSpeech';
import ImageGenerator from './components/ImageGenerator';
import ScriptEnhancer from './components/ScriptEnhancer';
import type { ActiveTool } from './types';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>('script');
  const [script, setScript] = useState('');
  const [enhancedScript, setEnhancedScript] = useState('');


  const renderTool = () => {
    switch (activeTool) {
      case 'chat':
        return <ChatBot />;
      case 'tts':
        return <TextToSpeech />;
      case 'image':
        return <ImageGenerator script={script} enhancedScript={enhancedScript} />;
      case 'script':
        return <ScriptEnhancer script={script} setScript={setScript} enhancedScript={enhancedScript} setEnhancedScript={setEnhancedScript} />;
      default:
        return <ScriptEnhancer script={script} setScript={setScript} enhancedScript={enhancedScript} setEnhancedScript={setEnhancedScript} />;
    }
  };

  // FIX: Replaced JSX.Element with React.ReactNode to resolve "Cannot find namespace 'JSX'" error.
  const NavItem: React.FC<{ tool: ActiveTool; label: string; icon: React.ReactNode }> = ({ tool, label, icon }) => (
    <button
      onClick={() => setActiveTool(tool)}
      className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
        activeTool === tool
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-md p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white tracking-wider">
            Creator's AI <span className="text-blue-400">Toolkit</span>
          </h1>
          <nav className="flex space-x-2">
            <NavItem tool="script" label="Script Enhancer" icon={<PencilSquareIcon />} />
            <NavItem tool="tts" label="Text-to-Speech" icon={<SpeakerWaveIcon />} />
            <NavItem tool="image" label="Image Generator" icon={<PhotoIcon />} />
            <NavItem tool="chat" label="Chat Bot" icon={<ChatBubbleLeftRightIcon />} />
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {renderTool()}
      </main>
    </div>
  );
};

// --- Icon Components ---
const PencilSquareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const SpeakerWaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
  </svg>
);

const PhotoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

const ChatBubbleLeftRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.06c-.247.007-.48.057-.7.144a4.503 4.503 0 0 0-1.076.622l-1.636 1.227c-.43.324-.95.324-1.38 0l-1.636-1.227a4.503 4.503 0 0 0-1.076-.622 8.903 8.903 0 0 1-.7-.144l-3.722-.06c-1.133-.093-1.98-1.057-1.98-2.193V10.608c0-.97.616-1.813 1.5-2.097m14.25-2.166a2.25 2.25 0 0 0-2.25-2.25H5.25a2.25 2.25 0 0 0-2.25 2.25m16.5 0v12.16c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 18.512V6.344m16.5 0a2.25 2.25 0 0 0-2.25-2.25H5.25a2.25 2.25 0 0 0-2.25 2.25m16.5 0h-16.5" />
  </svg>
);

export default App;
