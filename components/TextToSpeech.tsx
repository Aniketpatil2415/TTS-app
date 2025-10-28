import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech, decode, decodeAudioData, createWavFile } from '../services/geminiService';
import Button from './common/Button';
import Loader from './common/Loader';

const voices = [
    { id: 'Kore', name: 'Kore (Female)'},
    { id: 'Puck', name: 'Puck (Male)'},
    { id: 'Charon', name: 'Charon (Male)'},
    { id: 'Fenrir', name: 'Fenrir (Male)'},
    { id: 'Zephyr', name: 'Zephyr (Female)'}
];

const emotions = [
    { id: 'default', name: 'Default' },
    { id: 'cheerfully', name: 'Cheerful' },
    { id: 'sadly', name: 'Sad' },
    { id: 'angrily', name: 'Angry' },
    { id: 'calmly', name: 'Calm' },
    { id: 'whisper', name: 'Whisper' },
];

const languages = [
    { id: 'en', name: 'English', placeholder: 'Enter text here. For emotional tone, try selecting from the dropdown below.' },
    { id: 'hi', name: 'Hindi (हिन्दी)', placeholder: 'यहां हिंदी में टेक्स्ट दर्ज करें। भावनात्मक लहजे के लिए, नीचे ड्रॉपडाउन से चयन करें।' },
    { id: 'mr', name: 'Marathi (मराठी)', placeholder: 'इथे मराठीत मजकूर टाका. भावनिक टोनसाठी, खालील ड्रॉपडाउनमधून निवडा.' },
];


const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [selectedEmotion, setSelectedEmotion] = useState('default');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Initialize AudioContext
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
     // Cleanup on unmount
    return () => {
        if (currentAudioSourceRef.current) {
            currentAudioSourceRef.current.stop();
        }
        audioContextRef.current?.close();
    }
  }, []);

  const charLimit = 120000; // Approx. 20,000 words

  const playAudio = () => {
    if (!audioBuffer || !audioContextRef.current) return;
     if (currentAudioSourceRef.current) {
        currentAudioSourceRef.current.stop();
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = speed;
    source.detune.value = pitch;
    source.connect(audioContextRef.current.destination);
    source.start();
    currentAudioSourceRef.current = source;
  };

  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      setError('Please enter some text to generate speech.');
      return;
    }
    if (text.length > charLimit) {
      setError(`Text exceeds the character limit of ${charLimit.toLocaleString()}.`);
      return;
    }
    setIsLoading(true);
    setError(null);
    setAudioData(null);
    setAudioBuffer(null);

    try {
      let promptText = text;
      if (selectedEmotion !== 'default') {
        if (selectedEmotion === 'whisper') {
            promptText = `Whisper: ${text}`;
        } else {
            promptText = `Say ${selectedEmotion}: ${text}`;
        }
      }

      const base64Audio = await generateSpeech(promptText, selectedVoice);
      if (base64Audio) {
        const pcmData = decode(base64Audio);
        setAudioData(pcmData);
        
        const decodedBuffer = await decodeAudioData(pcmData, audioContextRef.current!, 24000, 1);
        setAudioBuffer(decodedBuffer);
        
        // Auto-play after generation
        if (currentAudioSourceRef.current) currentAudioSourceRef.current.stop();
        const source = audioContextRef.current!.createBufferSource();
        source.buffer = decodedBuffer;
        source.playbackRate.value = speed;
        source.detune.value = pitch;
        source.connect(audioContextRef.current!.destination);
        source.start();
        currentAudioSourceRef.current = source;
      } else {
        setError('Failed to generate audio. The response was empty.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while generating speech. Please check the console.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!audioData) return;
    const wavBlob = createWavFile(audioData, 24000);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated_speech.wav';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const charCount = text.length;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const currentPlaceholder = languages.find(l => l.id === selectedLanguage)?.placeholder || languages[0].placeholder;

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">Text-to-Speech Studio</h2>
      <p className="text-gray-400 mb-6">Convert your script into high-quality, emotional audio in multiple languages.</p>
      
      <div className="space-y-6">
        <div>
            <label htmlFor="tts-text" className="block text-sm font-medium text-gray-300 mb-2">
              Your Text
            </label>
            <textarea
              id="tts-text"
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={currentPlaceholder}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              maxLength={charLimit}
            />
            <div className={`text-right text-sm mt-2 ${charCount > charLimit ? 'text-red-400' : 'text-gray-500'}`}>
                {charCount.toLocaleString()} / {charLimit.toLocaleString()} characters | {wordCount.toLocaleString()} words
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
                <div>
                  <label htmlFor="tts-language" className="block text-sm font-medium text-gray-300 mb-2">
                    Language Preset
                  </label>
                  <select
                    id="tts-language"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {languages.map(lang => (
                      <option key={lang.id} value={lang.id}>{lang.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    This helps guide you, but the model adapts to the language of the text.
                  </p>
                </div>
                 <div>
                  <label htmlFor="tts-emotion" className="block text-sm font-medium text-gray-300 mb-2">
                    Emotional Tone
                  </label>
                  <select
                    id="tts-emotion"
                    value={selectedEmotion}
                    onChange={(e) => setSelectedEmotion(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {emotions.map(emotion => (
                      <option key={emotion.id} value={emotion.id}>{emotion.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="tts-voice" className="block text-sm font-medium text-gray-300 mb-2">
                    Select Voice
                  </label>
                  <select
                    id="tts-voice"
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {voices.map(voice => (
                      <option key={voice.id} value={voice.id}>{voice.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">
                    Voices are multilingual and adapt to the language of the text.
                  </p>
                </div>
            </div>
            <div className="space-y-4">
               <div>
                    <label htmlFor="speed" className="block text-sm font-medium text-gray-300 mb-1">Speed: <span className="font-mono text-blue-300">{speed.toFixed(2)}x</span></label>
                    <input type="range" id="speed" min="0.5" max="2" step="0.05" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </div>
                 <div>
                    <label htmlFor="pitch" className="block text-sm font-medium text-gray-300 mb-1">Pitch: <span className="font-mono text-blue-300">{pitch > 0 ? '+' : ''}{pitch}</span></label>
                    <input type="range" id="pitch" min="-1200" max="1200" step="50" value={pitch} onChange={e => setPitch(parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </div>
            </div>
        </div>

        {error && <p className="text-red-400 text-center bg-red-900/50 p-3 rounded-lg">{error}</p>}
        
        {isLoading && <Loader message="Generating audio, this may take a moment..." />}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-gray-700/50">
          <Button onClick={handleGenerateSpeech} isLoading={isLoading} disabled={!text.trim() || charCount > charLimit}>
            Generate Audio
          </Button>
           <Button onClick={playAudio} disabled={!audioBuffer || isLoading} variant="secondary">
            Replay
          </Button>
          <Button onClick={handleDownload} disabled={!audioData || isLoading} variant="secondary">
            Download .WAV
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;