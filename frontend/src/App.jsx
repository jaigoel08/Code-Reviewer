import { useState, useEffect, useRef } from 'react'
import "prismjs/themes/prism-tomorrow.css"
import Editor from "react-simple-code-editor"
import prism from "prismjs"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from 'axios'
import clsx from "clsx";


function App() {
  const [ count, setCount ] = useState(0)
  const [ code, setCode ] = useState(` function sum() {
  return 1 + 1
}`)

  const [ review, setReview ] = useState(``)
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [topHeight, setTopHeight] = useState(50); // percent
  const [dragging, setDragging] = useState(false);
  const [lastAction, setLastAction] = useState('review'); // 'review' or 'generate'
  const [output, setOutput] = useState("");

  useEffect(() => {
    prism.highlightAll()
  }, [])

  async function reviewCode() {
    setLoading(true);
    setLastAction('review');
    const response = await axios.post('http://localhost:3000/ai/get-review', { code })
    setReview(response.data)
    setLoading(false);
  }

  async function generateCodeFromPrompt() {
    setGeneratedCode('');
    setLastAction('generate');
    try {
      const response = await axios.post('http://localhost:3000/ai/generate-code', { prompt });
      setGeneratedCode(response.data);
    } catch (error) {
      setGeneratedCode('// Error generating code.');
    }
  }

  async function getCodeOutput() {
    setLoading(true);
    setLastAction('output');
    setOutput("");
    try {
      const response = await axios.post('http://localhost:3000/ai/get-output', { code });
      setOutput(response.data);
    } catch (error) {
      setOutput('// Error getting output.');
    }
    setLoading(false);
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  function handleMouseDown(e) {
    setDragging(true);
    document.body.style.cursor = 'row-resize';
  }

  function handleMouseUp(e) {
    setDragging(false);
    document.body.style.cursor = '';
  }

  function handleMouseMove(e) {
    if (!dragging) return;
    const container = document.getElementById('split-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    let y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    let percent = (y / rect.height) * 100;
    if (percent < 10) percent = 10;
    if (percent > 90) percent = 90;
    setTopHeight(percent);
  }

  useEffect(() => {
    function onMove(e) { handleMouseMove(e); }
    function onUp(e) { handleMouseUp(e); }
    if (dragging) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onMove);
      window.addEventListener('touchend', onUp);
    } else {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging]);

  return (
    <div className={clsx(
      "min-h-screen transition-colors duration-500",
      isDarkMode ? "bg-gray-900" : "bg-gray-100"
    )}>
      <header className={clsx(
        "flex justify-between items-center p-4 shadow-md border-b transition-colors duration-500",
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      )}>
        <h1 className={clsx(
          "text-2xl font-bold transition-colors duration-500",
          isDarkMode ? "text-white" : "text-gray-800"
        )}>Coding Buddy</h1>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-all duration-300 transform hover:scale-105 shadow"
        >
          {isDarkMode ? "💡" : "🌚"}
        </button>
      </header>
      <main className="p-2 sm:p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 rounded-lg shadow-lg transition-colors duration-500 h-auto md:h-[calc(100vh-80px)]" style={{ minHeight: 'calc(100vh - 80px)' }}>
        {/* Left Side: Split vertically */}
        <div
          id="split-container"
          className={clsx(
            "flex-1 bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-4 shadow h-[50vh] md:h-full flex flex-col gap-2 sm:gap-4 transition-colors duration-500"
          )}
          style={{ minHeight: 0 }}
        >
          {/* Top Half: Code Review */}
          <div
            className={clsx(
              "flex flex-col min-h-[24px] transition-all duration-200",
              topHeight <= 10 ? "h-8 overflow-hidden" : ""
            )}
            style={{ flexBasis: `${topHeight}%`, minHeight: 0 }}
          >
            {topHeight > 10 ? (
              <>
                <div className="code flex-1 transition-all duration-300 min-h-[60px] overflow-auto">
                  <Editor
                    value={code}
                    onValueChange={code => setCode(code)}
                    highlight={code => prism.highlight(code, prism.languages.javascript, "javascript")}
                    padding={10}
                    style={{
                      fontFamily: '"Fira code", "Fira Mono", monospace',
                      fontSize: 14,
                      border: isDarkMode ? "1px solid #444" : "1px solid #ddd",
                      borderRadius: "5px",
                      height: "100%",
                      width: "100%",
                      background: isDarkMode ? "#1f2937" : "#fff",
                      color: isDarkMode ? "#f3f4f6" : "#111"
                    }}
                  />
                </div>
                <div className="flex gap-2 mt-2 sm:mt-4 self-end">
                  <button
                    onClick={reviewCode}
                    className="p-2 sm:p-2.5 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-500 transition-all duration-300 transform hover:scale-105 shadow text-xs sm:text-sm md:text-base"
                  >
                    {loading && lastAction === 'review' ? "Reviewing..." : "Review"}
                  </button>
                  <button
                    onClick={getCodeOutput}
                    className="p-2 sm:p-2.5 bg-purple-600 text-white rounded cursor-pointer hover:bg-purple-500 transition-all duration-300 transform hover:scale-105 shadow text-xs sm:text-sm md:text-base"
                  >
                    {loading && lastAction === 'output' ? "Running..." : "Output"}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center h-8 overflow-hidden bg-gray-100 dark:bg-gray-800 rounded">
                <div className="px-2 text-xs text-gray-500 truncate" title={code}>{code}</div>
              </div>
            )}
          </div>
          {/* Draggable Divider - always visible */}
          <div
            className="w-full h-2 bg-gray-300 dark:bg-gray-700 cursor-row-resize flex items-center justify-center relative z-10 select-none"
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
            style={{ margin: '2px 0' }}
          >
            <div className="w-16 h-1 rounded bg-gray-400 dark:bg-gray-600" />
          </div>
          {/* Bottom Half: Prompt to Generate Code */}
          <div
            className={clsx(
              "flex-1 flex flex-col justify-between bg-gray-50 dark:bg-gray-900 rounded-lg p-2 sm:p-4 shadow-inner transition-colors duration-500 min-h-[24px] mt-2",
              topHeight >= 90 ? "h-8 overflow-hidden" : ""
            )}
            style={{ flexBasis: `${100 - topHeight}%`, minHeight: 0 }}
          >
            {topHeight < 90 ? (
              <>
                <div>
                  <label className={clsx("block mb-2 font-semibold transition-colors duration-500 text-xs sm:text-sm", isDarkMode ? "text-gray-200" : "text-gray-700")}>Prompt to Generate Code</label>
                  <input
                    type="text"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Describe what you want to generate..."
                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 text-xs sm:text-sm"
                  />
                  <button
                    onClick={generateCodeFromPrompt}
                    className="mt-2 sm:mt-3 px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 transition-all duration-300 transform hover:scale-105 shadow text-xs sm:text-sm md:text-base"
                  >
                    Generate Code
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center h-8 overflow-hidden bg-gray-100 dark:bg-gray-800 rounded">
                <div className="px-2 text-xs text-gray-500 truncate" title={prompt}>{prompt || 'Prompt to generate code...'}</div>
              </div>
            )}
          </div>
        </div>
        {/* Right Side: Review Area */}
        <div className="flex-1 bg-gray-800 text-white rounded-lg p-2 sm:p-4 shadow h-[50vh] md:h-full overflow-y-auto transition-colors duration-500 dark:bg-gray-900 mt-4 md:mt-0">
          {loading ? (
            <p className="text-gray-300 animate-pulse">Loading...</p>
          ) : lastAction === 'review' ? (
            <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
          ) : lastAction === 'output' ? (
            <pre className="whitespace-pre-wrap break-words text-xs sm:text-sm md:text-base">{output}</pre>
          ) : (
            <pre className="whitespace-pre-wrap break-words text-xs sm:text-sm md:text-base">{generatedCode}</pre>
          )}
        </div>
      </main>
    </div>
  )
}

export default App