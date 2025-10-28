import React, { useState } from 'react';
import { generateImage, suggestImagePrompts } from '../services/geminiService';
import Button from './common/Button';
import Loader from './common/Loader';

interface ImageGeneratorProps {
    script: string;
    enhancedScript: string;
}

const aspectRatios = [
    { value: '1:1', label: 'Square (1:1)' },
    { value: '16:9', label: 'Widescreen (16:9)' },
    { value: '9:16', label: 'Vertical (9:16)' },
    { value: '4:3', label: 'Standard (4:3)' },
    { value: '3:4', label: 'Portrait (3:4)' },
];

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ script, enhancedScript }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image.');
      return;
    }
    setIsLoading(true);
    setImageUrl(null);
    setError(null);
    setSuggestedPrompts([]);
    try {
      const base64Image = await generateImage(prompt, aspectRatio);
      if (base64Image) {
        setImageUrl(`data:image/png;base64,${base64Image}`);
      } else {
        setError('Failed to generate image. The response was empty.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while generating the image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggest = async () => {
    setIsSuggesting(true);
    setError(null);
    const scriptToUse = enhancedScript || script;
    try {
      const suggestions = await suggestImagePrompts(scriptToUse);
      setSuggestedPrompts(suggestions);
    } catch (err) {
      setError("Could not generate suggestions.");
    } finally {
      setIsSuggesting(false);
    }
  }

  const hasScript = (script || enhancedScript).trim().length > 0;

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">AI Image Generator</h2>
      <p className="text-gray-400 mb-6">Describe an image and let AI bring your vision to life. Perfect for thumbnails, assets, and inspiration.</p>

      <div className="space-y-6">
        <div className="space-y-4">
           <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A cinematic shot of a robot meditating on a mountain top"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <div className="flex flex-col sm:flex-row gap-4">
              <select 
                value={aspectRatio} 
                onChange={e => setAspectRatio(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                  {aspectRatios.map(ar => <option key={ar.value} value={ar.value}>{ar.label}</option>)}
              </select>
              <Button onClick={handleSuggest} isLoading={isSuggesting} disabled={!hasScript || isLoading} variant="secondary">
                Suggest Prompts from Script
              </Button>
              <Button onClick={handleGenerate} isLoading={isLoading} disabled={!prompt.trim() || isSuggesting} className="flex-grow">
                Generate Image
              </Button>
          </div>
        </div>
        
        {suggestedPrompts.length > 0 && (
          <div className="space-y-2 animate-fade-in">
            <h3 className="text-sm font-semibold text-gray-300">Suggestions:</h3>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((p, i) => (
                <button 
                  key={i} 
                  onClick={() => setPrompt(p)}
                  className="bg-gray-700 text-gray-200 hover:bg-gray-600 px-3 py-1 text-sm rounded-md transition-colors"
                  >
                  "{p}"
                </button>
              ))}
            </div>
          </div>
        )}
        
        {error && <p className="text-red-400 text-center bg-red-900/50 p-3 rounded-lg">{error}</p>}
        
        <div className="w-full bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700" style={{aspectRatio: aspectRatio.replace(':', '/')}}>
          {isLoading ? (
            <Loader message="Creating your masterpiece..." />
          ) : imageUrl ? (
            <img src={imageUrl} alt={prompt} className="w-full h-full object-contain rounded-lg" />
          ) : (
            <div className="text-center text-gray-500 p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2">Your generated image will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
