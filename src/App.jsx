import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { PlusCircle, Trash2, Share2, Eye, Copy, Check } from 'lucide-react';
import LZString from 'lz-string';

function App() {
  const [questions, setQuestions] = useState([{ id: 1, text: '' }]);
  const [qrMode, setQrMode] = useState(false);
  const [encodedUrl, setEncodedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  
  // URL processing for student mode
  const searchParams = new URLSearchParams(window.location.search);
  const qParam = searchParams.get('q');
  
  if (qParam) {
    try {
      const decoded = LZString.decompressFromEncodedURIComponent(qParam);
      const decodedQuestions = JSON.parse(decoded);
      return <StudentView questions={decodedQuestions} />;
    } catch (e) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="glass-card p-8 rounded-2xl text-center max-w-md w-full">
            <div className="text-red-500 mb-4 text-5xl">⚠️</div>
            <h1 className="text-2xl font-bold mb-2">Invalid Link</h1>
            <p className="text-gray-400">The QR code or link you opened seems to be broken. Please ask the teacher for a new one.</p>
          </div>
        </div>
      );
    }
  }
  
  // --- Teacher View Logic ---
  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), text: '' }]);
  };

  const updateQuestion = (id, text) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const generateLink = () => {
    const validQuestions = questions.filter(q => q.text.trim() !== '');
    if (validQuestions.length === 0) {
      alert("Please add at least one question.");
      return;
    }
    
    // Compress and encode
    const jsonStr = JSON.stringify(validQuestions.map(q => q.text.trim()));
    const encoded = LZString.compressToEncodedURIComponent(jsonStr);
    
    const url = `${window.location.origin}${window.location.pathname}?q=${encoded}`;
    setEncodedUrl(url);
    setQrMode(true);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(encodedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (qrMode) {
    return (
      <div className="min-h-screen bg-gradient flex flex-col items-center justify-center p-4 text-white">
        <div className="glass-card max-w-lg w-full p-8 rounded-3xl shadow-2xl animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-500"></div>
          
          <button 
            onClick={() => setQrMode(false)}
            className="mb-8 text-gray-400 hover:text-white transition-colors flex items-center text-sm font-medium"
          >
            ← Back to Editor
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-400">
              Ready to Share
            </h1>
            <p className="text-gray-300 mb-8 max-w-sm mx-auto">
              Scan this QR code with any camera app to view the questions instantly. No app required.
            </p>
            
            <div className="bg-white p-6 rounded-2xl inline-block shadow-lg mx-auto mb-8 transform transition hover:scale-105 duration-300">
              <QRCode value={encodedUrl} size={256} className="text-gray-900" level="H" />
            </div>
            
            <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
              <div className="flex-1 truncate text-sm text-gray-300 bg-black/20 p-3 rounded-lg border border-white/5 font-mono">
                {encodedUrl}
              </div>
              <button 
                onClick={copyToClipboard}
                className="p-3 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 rounded-lg transition-colors flex-shrink-0"
                title="Copy link"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Teacher Editor View
  return (
    <div className="min-h-screen bg-gradient text-white p-4 md:p-8 flex justify-center items-start">
      <div className="glass-card w-full max-w-3xl p-6 md:p-10 rounded-3xl shadow-2xl relative mt-8 md:mt-12 animate-slide-up border border-white/10">
        
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-purple-500/20 rounded-2xl mb-4 text-purple-300">
            <Share2 size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            Question <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Portal</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-lg mx-auto">
            Create a list of questions for your expo. Generate a single QR code for visitors to scan and view instantly.
          </p>
        </header>

        <div className="space-y-4 mb-8">
          {questions.map((q, index) => (
            <div key={q.id} className="group relative flex items-start gap-4 animate-fade-in">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-xl font-medium text-purple-300 mt-1 shadow-inner">
                {index + 1}
              </div>
              <div className="flex-grow">
                <textarea
                  value={q.text}
                  onChange={(e) => updateQuestion(q.id, e.target.value)}
                  placeholder="Type your question here..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all min-h-[100px] resize-y shadow-sm"
                />
              </div>
              {questions.length > 1 && (
                <button
                  onClick={() => removeQuestion(q.id)}
                  className="p-3 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all mt-1 flex-shrink-0"
                  title="Remove question"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-10 pt-8 border-t border-white/10">
          <button
            onClick={addQuestion}
            className="flex items-center gap-2 text-purple-300 hover:text-purple-200 font-medium px-4 py-2 hover:bg-purple-500/10 rounded-lg transition-colors w-full sm:w-auto justify-center"
          >
            <PlusCircle size={20} />
            <span>Add Question</span>
          </button>
          
          <button
            onClick={generateLink}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition hover:-translate-y-1 w-full sm:w-auto text-lg"
          >
            <Eye size={20} />
            <span>Generate QR Code</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Student View Component
function StudentView({ questions }) {
  return (
    <div className="min-h-screen bg-gradient text-white p-4 md:p-8 flex justify-center items-start">
      <div className="glass-card w-full max-w-3xl p-6 md:p-10 rounded-3xl shadow-2xl relative mt-4 md:mt-12 animate-slide-up border border-white/10">
        
        <header className="mb-12 text-center relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full"></div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 relative z-10">
            Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Questions</span>
          </h1>
          <p className="text-gray-400 text-lg">Please answer or reflect on the following questions.</p>
        </header>

        <div className="space-y-6 relative z-10">
          {questions.map((text, index) => (
            <div 
              key={index} 
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors shadow-lg flex gap-5 animate-fade-in"
              style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
            >
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 text-xl font-bold text-blue-300">
                {index + 1}
              </div>
              <div className="pt-2">
                <p className="text-lg md:text-xl text-gray-100 leading-relaxed break-words whitespace-pre-wrap">{text}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
          Scanned at Expo Project
        </div>
      </div>
    </div>
  );
}

export default App;
