'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';

type ProcessingState = 'idle' | 'loading' | 'success' | 'error';

export default function Home() {
  const [state, setState] = useState<ProcessingState>('idle');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Invalid file type. Please upload JPG, PNG, or WebP images.');
      setState('error');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit.');
      setState('error');
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);

    // Preview original image
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile) return;

    setState('loading');
    setErrorMessage(null);
    setResultImage(null);

    try {
      const formData = new FormData();
      formData.append('image_file', selectedFile);

      const response = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process image');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultImage(url);
      setState('success');
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while processing');
      setState('error');
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'background-removed.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setState('idle');
    setOriginalImage(null);
    setResultImage(null);
    setErrorMessage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="py-8 px-4 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          RemoveBG Mini
        </h1>
        <p className="mt-2 text-gray-400">智能图片背景移除工具</p>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
            ${isDragging 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />
          
          {originalImage ? (
            <div className="space-y-4">
              <img
                src={originalImage}
                alt="Original"
                className="max-h-64 mx-auto rounded-lg shadow-lg"
              />
              <p className="text-gray-400">{selectedFile?.name}</p>
            </div>
          ) : (
            <>
              <div className="text-6xl mb-4">📤</div>
              <p className="text-xl font-medium mb-2">拖拽图片到此处</p>
              <p className="text-gray-500">或点击上传</p>
              <p className="text-sm text-gray-600 mt-4">支持 JPG、PNG、WebP，最大 10MB</p>
            </>
          )}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-center">
            {errorMessage}
          </div>
        )}

        {/* Action Buttons */}
        {originalImage && (
          <div className="mt-6 flex justify-center gap-4">
            {state !== 'success' && (
              <button
                onClick={handleRemoveBackground}
                disabled={state === 'loading'}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold
                  hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all shadow-lg shadow-blue-500/25"
              >
                {state === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    处理中...
                  </span>
                ) : (
                  '移除背景'
                )}
              </button>
            )}
            
            {state === 'success' && (
              <button
                onClick={handleDownload}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-semibold
                  hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25"
              >
                下载结果图
              </button>
            )}

            <button
              onClick={handleReset}
              className="px-8 py-3 bg-gray-700 rounded-xl font-semibold hover:bg-gray-600 transition-all"
            >
              重置
            </button>
          </div>
        )}

        {/* Result Comparison */}
        {state === 'success' && originalImage && resultImage && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-center mb-6">对比预览</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <p className="text-center text-gray-400 mb-3 font-medium">原图</p>
                <img
                  src={originalImage}
                  alt="Original"
                  className="w-full rounded-lg"
                />
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4">
                <p className="text-center text-gray-400 mb-3 font-medium">结果预览</p>
                <img
                  src={resultImage}
                  alt="Result"
                  className="w-full rounded-lg bg-checkered"
                  style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleDownload}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-semibold
                  hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25"
              >
                下载 PNG 图片
              </button>
            </div>
          </div>
        )}

        {/* API Key Notice */}
        <div className="mt-12 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <p className="text-center text-gray-400 text-sm">
            ⚠️ 请在 <code className="bg-gray-700 px-2 py-1 rounded">.env.local</code> 文件中配置 <code className="bg-gray-700 px-2 py-1 rounded">REMOVE_BG_API_KEY</code>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-500 text-sm">
        RemoveBG Mini © 2026 | 使用 Remove.bg API
      </footer>
    </div>
  );
}
