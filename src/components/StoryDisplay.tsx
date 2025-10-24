import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { StoryResult } from '../../types';
import BookIcon from './icons/BookIcon';
import SpeakerIcon from './icons/SpeakerIcon';
import PauseIcon from './icons/PauseIcon';

interface StoryDisplayProps {
  storyResult: StoryResult | null;
  isLoading: boolean;
  error: string | null;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({ storyResult, isLoading, error }) => {
  const [playbackState, setPlaybackState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Effect to clean up audio resources when a new story is generated or the component is unmounted
  useEffect(() => {
    setPlaybackState('idle');

    return () => {
      if (audioSourceRef.current) {
        audioSourceRef.current.onended = null;
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [storyResult]);

  const handlePlayback = useCallback(() => {
    if (!storyResult?.audioBuffer) return;

    if (playbackState === 'paused' && audioContextRef.current) {
      audioContextRef.current.resume();
      setPlaybackState('playing');
      return;
    }

    if (playbackState === 'playing' && audioContextRef.current) {
      audioContextRef.current.suspend();
      setPlaybackState('paused');
      return;
    }

    if (playbackState === 'idle') {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }

      const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const source = context.createBufferSource();
      source.buffer = storyResult.audioBuffer;
      source.connect(context.destination);
      
      source.onended = () => {
        setPlaybackState('idle');
        audioSourceRef.current = null; 
      };

      source.start();
      setPlaybackState('playing');
      
      audioContextRef.current = context;
      audioSourceRef.current = source;
    }
  }, [playbackState, storyResult?.audioBuffer]);

  const renderPlayButton = () => {
    let text = 'Tocar Áudio';
    let icon = <SpeakerIcon className="w-5 h-5" />;

    if (playbackState === 'playing') {
      text = 'Pausar Áudio';
      icon = <PauseIcon className="w-5 h-5" />;
    } else if (playbackState === 'paused') {
      text = 'Continuar';
    }

    return (
      <button onClick={handlePlayback} className="w-full flex items-center justify-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-semibold space-x-2">
        {icon}
        <span>{text}</span>
      </button>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-yellow-500"></div>
          <p className="mt-4 text-lg font-semibold text-gray-600">Aguarde, estamos criando um mundo de fantasia...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-red-100 border border-red-300 rounded-lg">
          <p className="font-bold text-red-700">Oops! Algo deu errado.</p>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      );
    }
    
    if (storyResult) {
      return (
        <div className="space-y-6">
          {storyResult.audioBuffer && (
            <div className="bg-white p-4 rounded-xl shadow-inner">
              <h3 className="text-lg font-bold text-gray-800 mb-2">Ouça a História</h3>
              {renderPlayButton()}
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">Leia a História</h3>
            <div className="prose prose-lg max-w-none p-6 bg-white rounded-xl shadow-inner text-gray-700 leading-relaxed">
              <p>{storyResult.text}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <BookIcon className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300" />
        <p className="mt-4 text-xl font-semibold text-gray-500">Sua história aparecerá aqui!</p>
        <p className="text-gray-400">Preencha os campos e clique em "Gerar História" para começar a aventura.</p>
      </div>
    );
  };
  
  return (
    <div className="bg-blue-100 p-6 md:p-8 rounded-2xl shadow-lg min-h-[300px] md:min-h-full flex flex-col">
      {renderContent()}
    </div>
  );
};

export default StoryDisplay;