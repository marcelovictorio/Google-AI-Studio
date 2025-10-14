
import React, { useState, useRef } from 'react';
import { PaperclipIcon, SendIcon } from './Icons';

interface ChatInputProps {
  onSendMessage: (prompt: string, imageFile?: File) => void;
  isGenerating: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if ((prompt.trim() || imageFile) && !isGenerating) {
      onSendMessage(prompt.trim(), imageFile || undefined);
      setPrompt('');
      removeImage();
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSubmit(event as any);
    }
  };

  return (
    <div className="bg-gray-800 p-4">
      <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
        {imagePreviewUrl && (
          <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-700 rounded-lg">
            <div className="relative">
              <img src={imagePreviewUrl} alt="Preview" className="h-20 w-20 object-cover rounded-md" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold"
                aria-label="Remove image"
              >
                &times;
              </button>
            </div>
          </div>
        )}
        <div className="flex items-end bg-gray-700 rounded-xl p-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            disabled={isGenerating}
            aria-label="Attach image"
          >
            <PaperclipIcon className="w-6 h-6" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            disabled={isGenerating}
          />
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={imageFile ? "Describe how you want to edit the image..." : "Describe the image you want to create..."}
            className="flex-grow bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none px-2"
            rows={1}
            style={{ maxHeight: '120px' }}
            disabled={isGenerating}
          />
          <button
            type="submit"
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={isGenerating || !prompt.trim()}
            aria-label="Send message"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
};
