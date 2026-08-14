import { useRef, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface MicrophoneButtonProps {
  onTranscript: (text: string) => void;
  language?: string;
  className?: string;
}

export default function MicrophoneButton({ onTranscript, language = 'ar-DZ', className = '' }: MicrophoneButtonProps) {
  const { transcript, isRecording, start, stop } = useSpeechRecognition(language);
  const prevTranscriptRef = useRef('');

  useEffect(() => {
    if (transcript && transcript !== prevTranscriptRef.current) {
      prevTranscriptRef.current = transcript;
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  const toggleRecording = () => {
    if (isRecording) {
      stop();
    } else {
      prevTranscriptRef.current = '';
      start();
    }
  };

  return (
    <button
      type="button"
      onClick={toggleRecording}
      className={`inline-flex items-center justify-center rounded-full p-2 transition-all ${
        isRecording
          ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300 animate-pulse'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
      } ${className}`}
      title={isRecording ? 'Arrêter l enregistrement' : 'Dicter la réponse'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z" />
        <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </svg>
    </button>
  );
}
