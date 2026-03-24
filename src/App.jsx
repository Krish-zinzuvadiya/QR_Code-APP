import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { PlusCircle, Trash2, Edit3, Eye, Copy, Check, FileText } from 'lucide-react';
import LZString from 'lz-string';

function App() {
  const [projectData, setProjectData] = useState({
    projectName: '',
    questions: [{ id: 1, text: '' }]
  });
  const [qrMode, setQrMode] = useState(false);
  const [encodedUrl, setEncodedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  
  const searchParams = new URLSearchParams(window.location.search);
  const qParam = searchParams.get('q');
  
  // Student View Flow (Decoding URL)
  if (qParam) {
    try {
      const decoded = LZString.decompressFromEncodedURIComponent(qParam);
      const data = JSON.parse(decoded);
      // Compatibility fallback for old structure
      if (Array.isArray(data)) {
        return <StudentView data={{ projectName: 'Project Questionnaire', questions: data }} />;
      }
      return <StudentView data={data} />;
    } catch (e) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient">
          <div className="glass-card p-8 text-center max-w-md w-full">
            <h1 className="text-2xl font-bold mb-2 text-danger">Invalid Link</h1>
            <p className="text-muted">The QR code seems to be broken.</p>
          </div>
        </div>
      );
    }
  }
  
  // Teacher View Handlers
  const addQuestion = () => {
    setProjectData({
      ...projectData,
      questions: [...projectData.questions, { id: Date.now(), text: '' }]
    });
  };

  const updateQuestion = (id, text) => {
    setProjectData({
      ...projectData,
      questions: projectData.questions.map(q => q.id === id ? { ...q, text } : q)
    });
  };

  const removeQuestion = (id) => {
    if (projectData.questions.length > 1) {
      setProjectData({
        ...projectData,
        questions: projectData.questions.filter(q => q.id !== id)
      });
    }
  };

  const generateLink = () => {
    const validQuestions = projectData.questions.filter(q => q.text.trim() !== '');
    if (!projectData.projectName.trim()) {
      alert("Please enter a Project Name at the top.");
      return;
    }
    if (validQuestions.length === 0) {
      alert("Please add at least one question.");
      return;
    }
    
    // Package data including the project name
    const finalData = {
      projectName: projectData.projectName.trim(),
      questions: validQuestions.map(q => q.text.trim())
    };

    const jsonStr = JSON.stringify(finalData);
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

  // QR Dispaly Mode
  if (qrMode) {
    return (
      <div className="min-h-screen bg-gradient flex flex-col items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 text-center">
          <h1 className="text-3xl font-extrabold mb-2 text-main">Your QR is Ready!</h1>
          <p className="text-muted mb-6">Scan to open the questionnaire for '{projectData.projectName}'.</p>
          
          <div className="bg-white p-6 rounded-2xl inline-block shadow-sm mb-6 border border-gray-100">
            <QRCode value={encodedUrl} size={200} level="H" />
          </div>
          
          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-100 mb-6">
            <input 
              type="text" 
              readOnly 
              value={encodedUrl} 
              className="flex-1 text-sm text-muted bg-transparent border-none p-2" 
            />
            <button 
              onClick={copyToClipboard}
              className="p-2 btn-secondary rounded-lg"
              title="Copy to clipboard"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>

          <button 
            onClick={() => setQrMode(false)}
            className="text-muted font-medium hover:text-main"
          >
            ← Back to Editor
          </button>
        </div>
      </div>
    );
  }

  // Main Editor UI
  return (
    <div className="min-h-screen bg-gradient p-4 flex justify-center pb-12">
      <div className="max-w-2xl w-full mt-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-main mb-2">Question <span className="text-gradient">Portal</span></h1>
          <p className="text-muted text-lg">Design your minimalist project questionnaire</p>
        </header>

        <div className="glass-card p-6 md:p-8 mb-6">
          <div className="mb-8">
            <label className="text-sm font-bold text-main mb-2 flex items-center gap-2">
              <Edit3 size={18} className="text-blue" /> Project Name
            </label>
            <input
              type="text"
              placeholder="e.g. Smart AI Automation System"
              className="p-4 text-lg font-medium"
              value={projectData.projectName}
              onChange={(e) => setProjectData({...projectData, projectName: e.target.value})}
            />
          </div>

          <div className="mb-6">
            <label className="text-sm font-bold text-main mb-4 flex items-center gap-2">
              <FileText size={18} className="text-purple" /> Project Questions
            </label>
            <div className="flex flex-col gap-4">
              {projectData.questions.map((q, index) => (
                <div key={q.id} className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue bg-opacity-10 text-blue font-bold flex items-center justify-center mt-1">
                    {index + 1}
                  </div>
                  <textarea
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, e.target.value)}
                    placeholder="Enter a question for the visitors..."
                    className="p-4 text-base"
                  />
                  {projectData.questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="mt-1 p-2 text-danger hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-6 border-b">
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 btn-secondary px-6 py-3 rounded-xl font-medium w-full sm:w-auto justify-center"
            >
              <PlusCircle size={20} />
              Add Question
            </button>
            <button
              onClick={generateLink}
              className="flex items-center justify-center gap-2 btn-primary px-8 py-3 rounded-xl font-bold text-lg w-full sm:w-auto"
            >
              <Eye size={20} />
              Generate App
            </button>
          </div>
          <div className="mt-6 text-center text-xs text-muted">
            The questions and project details will be embedded inside the link instantly.
          </div>
        </div>
      </div>
    </div>
  );
}

// Mobile/Student Output View Component
function StudentView({ data }) {
  const [answers, setAnswers] = useState({});

  const handleAnswerChange = (index, val) => {
    setAnswers({ ...answers, [index]: val });
  };

  return (
    <div className="min-h-screen">
      {/* Sticky beautiful clear header */}
      <div className="bg-white px-6 py-6 border-b shadow-sm sticky top-0 z-10 text-center">
        <h1 className="text-2xl md:text-3xl font-extrabold text-main mb-1 text-gradient leading-relaxed">
          {data.projectName || "Project Questionnaire"}
        </h1>
        <p className="text-muted text-sm md:text-base">Please answer the questions below</p>
      </div>

      {/* Questions Stack */}
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8 mt-4 pb-20">
        {data.questions.map((text, index) => (
          <div key={index} className="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h2 className="text-lg md:text-xl font-semibold text-main mb-4 leading-relaxed">
              <span className="text-blue mr-2">Q{index + 1}.</span>
              {text}
            </h2>
            <textarea
              className="w-full mt-2 p-4 bg-gray-50 text-base"
              placeholder="Type your answer here..."
              rows="4"
              value={answers[index] || ''}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
            ></textarea>
          </div>
        ))}
        
        {/* Complete button at bottom */}
        <button 
          onClick={() => alert("Answers ready to submit/save. Currently staying on device.")}
          className="btn-primary w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 text-lg"
        >
          <Check size={20} /> Done
        </button>
      </div>
    </div>
  );
}

export default App;
