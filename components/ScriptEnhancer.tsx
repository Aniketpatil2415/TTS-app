import React, { useState, useEffect, useRef } from 'react';
import { enhanceScript } from '../services/geminiService';
import Button from './common/Button';
import Loader from './common/Loader';

interface ScriptEnhancerProps {
    script: string;
    setScript: (script: string) => void;
    enhancedScript: string;
    setEnhancedScript: (script: string) => void;
}

const ScriptEnhancer: React.FC<ScriptEnhancerProps> = ({ script, setScript, enhancedScript, setEnhancedScript }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showEnhancePrompt, setShowEnhancePrompt] = useState(false);
  const debounceTimeout = useRef<number | null>(null);
  
  const charLimit = 40000;

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (script.trim().length > 50 && !enhancedScript) {
      debounceTimeout.current = window.setTimeout(() => {
        setShowEnhancePrompt(true);
      }, 1500);
    } else {
      setShowEnhancePrompt(false);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [script, enhancedScript]);

  const handleEnhance = async () => {
    setShowEnhancePrompt(false);
    setIsLoading(true);
    try {
      const result = await enhanceScript(script);
      setEnhancedScript(result);
    } catch (error) {
      console.error(error);
      setEnhancedScript("There was an error enhancing your script. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
      setScript('');
      setEnhancedScript('');
      setShowEnhancePrompt(false);
      setIsLoading(false);
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 w-full mx-auto">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-2xl font-bold text-white mb-2">AI Script Enhancer</h2>
                <p className="text-gray-400">Paste your script below. Our AI, powered by Gemini Pro, will help you refine it for maximum impact.</p>
            </div>
            {(script || enhancedScript) && <Button onClick={handleReset} variant="secondary">Start Over</Button>}
        </div>
      
        {showEnhancePrompt && !isLoading && (
            <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 mb-6 flex items-center justify-between animate-fade-in">
                <p className="text-blue-200">Do you want to make your script better with AI?</p>
                <div className="flex gap-4">
                    <Button onClick={handleEnhance}>Yes, Enhance!</Button>
                    <Button onClick={() => setShowEnhancePrompt(false)} variant="secondary">No, Thanks</Button>
                </div>
            </div>
        )}

        {isLoading && <div className="my-6"><Loader message="Enhancing your script... This might take a moment for longer texts." /></div>}
        
        <div className={`grid gap-8 transition-all duration-500 ${enhancedScript ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            <div>
                <label htmlFor="original-script" className="block text-sm font-medium text-gray-300 mb-2">
                    Your Script
                </label>
                <textarea
                    id="original-script"
                    rows={15}
                    value={script}
                    onChange={(e) => {
                        if (e.target.value.length <= charLimit) {
                            setScript(e.target.value)
                            // Clear enhanced script if original changes
                            if (enhancedScript) {
                                setEnhancedScript('');
                            }
                        }
                    }}
                    placeholder="Paste your video or podcast script here..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <div className="text-right text-sm text-gray-500 mt-2">
                    {script.length} / {charLimit} characters
                </div>
            </div>
            {enhancedScript && (
                <div className="animate-fade-in">
                    <label htmlFor="enhanced-script" className="block text-sm font-medium text-gray-300 mb-2">
                       AI Enhanced Version
                    </label>
                    <textarea
                        id="enhanced-script"
                        rows={15}
                        value={enhancedScript}
                        readOnly
                        className="w-full bg-gray-900 border border-green-700 rounded-lg p-4 text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                </div>
            )}
        </div>
    </div>
  );
};

export default ScriptEnhancer;
