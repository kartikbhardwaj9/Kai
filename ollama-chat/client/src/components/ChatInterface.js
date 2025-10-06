import React, { useState, useEffect, useRef } from 'react';
import { Send, Image, FileImage, Loader2, Copy, RotateCcw, Settings } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ollamaService from '../services/ollamaService';

const ChatInterface = ({ selectedModel, models }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamMessage, setCurrentStreamMessage] = useState('');
  const [showReasoningFor, setShowReasoningFor] = useState({});
  const [settings, setSettings] = useState({
    temperature: 0.7,
    top_k: 40,
    top_p: 0.9,
    showReasoning: true,
    autoExpandReasoning: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamMessage]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  const isVisionModel = (modelName) => {
    return modelName && (
      modelName.toLowerCase().includes('llava') || 
      modelName.toLowerCase().includes('vision') ||
      modelName.toLowerCase().includes('bakllava')
    );
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && !imageFile) || !selectedModel || isStreaming) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage.trim(),
      image: imagePreview,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setCurrentStreamMessage('');
    setIsStreaming(true);

    // Create assistant message placeholder
    const assistantMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: '',
      reasoning: '',
      metadata: {},
      timestamp: new Date()
    };

    setMessages([...newMessages, assistantMessage]);

    try {
      // For vision models with images
      if (imageFile && isVisionModel(selectedModel)) {
        const result = await ollamaService.analyzeImage(
          selectedModel,
          imageFile,
          inputMessage.trim() || "Describe this image in detail."
        );
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: result.response, metadata: { tokens: result.eval_count } }
            : msg
        ));
      } else {
        // Regular chat
        const chatMessages = newMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        let accumulatedContent = '';
        let reasoningContent = '';
        let metadata = {};

        await ollamaService.chat(
          selectedModel,
          chatMessages,
          settings,
          (chunk, fullContent, data) => {
            // Extract reasoning - try multiple ways to get thinking process
            if (data.message) {
              if (data.message.reasoning) {
                reasoningContent += data.message.reasoning;
              }
              // Also try to extract thinking patterns from content
              if (data.message.content && data.message.content.includes('thinking:')) {
                const thinking = data.message.content.match(/thinking:(.*?)(?:\n|$)/i);
                if (thinking) {
                  reasoningContent += thinking[1] + '\n';
                }
              }
            }
            
            // For models that include reasoning in their response, try to separate it
            if (chunk && (chunk.includes('Let me think') || chunk.includes('I need to') || chunk.includes('First,'))) {
              reasoningContent += chunk + ' ';
            }
            
            accumulatedContent = fullContent;
            setCurrentStreamMessage(fullContent);
            
            // Update the assistant message in real-time
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { 
                    ...msg, 
                    content: fullContent,
                    reasoning: reasoningContent,
                    rawData: data, // Store raw data for debugging
                    isStreaming: true
                  }
                : msg
            ));

            // Auto-expand reasoning for new messages if setting is enabled
            if (settings.autoExpandReasoning && !showReasoningFor[assistantMessage.id]) {
              setShowReasoningFor(prev => ({
                ...prev,
                [assistantMessage.id]: true
              }));
            }
          },
          (finalContent, data) => {
            // Streaming complete
            metadata = {
              tokens: data?.eval_count || 0,
              eval_duration: data?.eval_duration || 0,
              prompt_eval_count: data?.prompt_eval_count || 0,
              prompt_eval_duration: data?.prompt_eval_duration || 0
            };

            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { 
                    ...msg, 
                    content: finalContent,
                    reasoning: reasoningContent,
                    metadata,
                    isStreaming: false
                  }
                : msg
            ));
            
            setCurrentStreamMessage('');
            setIsStreaming(false);
          },
          (error) => {
            console.error('Chat error:', error);
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { 
                    ...msg, 
                    content: `Error: ${error.message}`,
                    isError: true,
                    isStreaming: false
                  }
                : msg
            ));
            setIsStreaming(false);
            setCurrentStreamMessage('');
          }
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { 
              ...msg, 
              content: `Error: ${error.message}`,
              isError: true,
              isStreaming: false
            }
          : msg
      ));
      setIsStreaming(false);
      setCurrentStreamMessage('');
    }

    // Clean up image after sending
    removeImage();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const toggleReasoning = (messageId) => {
    setShowReasoningFor(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
      setCurrentStreamMessage('');
    }
  };

  const formatTokensPerSecond = (tokens, duration) => {
    if (!tokens || !duration) return '';
    const tokensPerSecond = (tokens / (duration / 1000000000)).toFixed(1);
    return `${tokensPerSecond} tokens/s`;
  };

  const formatDuration = (nanoseconds) => {
    if (!nanoseconds) return '';
    const seconds = (nanoseconds / 1000000000).toFixed(2);
    return `${seconds}s`;
  };

  return (
    <div className="chat-interface">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-info">
          <h2>Chat with {selectedModel || 'No Model Selected'}</h2>
          {selectedModel && isVisionModel(selectedModel) && (
            <span className="vision-badge">Vision Model</span>
          )}
        </div>
        <div className="chat-actions">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="settings-btn"
            title="Settings"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={clearChat}
            className="clear-btn"
            title="Clear Chat"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <div className="setting-group">
            <label>Temperature: {settings.temperature}</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
              className="setting-slider"
            />
          </div>
          <div className="setting-group">
            <label>Top K: {settings.top_k}</label>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={settings.top_k}
              onChange={(e) => setSettings(prev => ({ ...prev, top_k: parseInt(e.target.value) }))}
              className="setting-slider"
            />
          </div>
          <div className="setting-group">
            <label>Top P: {settings.top_p}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.top_p}
              onChange={(e) => setSettings(prev => ({ ...prev, top_p: parseFloat(e.target.value) }))}
              className="setting-slider"
            />
          </div>
          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={settings.showReasoning}
                onChange={(e) => setSettings(prev => ({ ...prev, showReasoning: e.target.checked }))}
              />
              Show Reasoning Process
            </label>
          </div>
          <div className="setting-group">
            <label>
              <input
                type="checkbox"
                checked={settings.autoExpandReasoning}
                onChange={(e) => setSettings(prev => ({ ...prev, autoExpandReasoning: e.target.checked }))}
                disabled={!settings.showReasoning}
              />
              Auto-expand Reasoning (New Messages)
            </label>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h3>Welcome to KAI Chat!</h3>
            <p>Start a conversation with your AI model.</p>
            {selectedModel && isVisionModel(selectedModel) && (
              <p className="vision-info">
                📸 This model supports image analysis. Upload an image to get started!
              </p>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-content">
                {message.image && (
                  <div className="message-image">
                    <img src={message.image} alt="Uploaded" />
                  </div>
                )}
                
                <div className="message-text">
                  {message.role === 'assistant' ? (
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          const language = match ? match[1] : 'text';
                          
                          return !inline ? (
                            <div className="code-block-wrapper">
                              <div className="code-block-header">
                                <span className="code-language">{language}</span>
                                <button
                                  onClick={() => copyToClipboard(String(children).replace(/\n$/, ''))}
                                  className="code-copy-btn"
                                  title="Copy code"
                                >
                                  <Copy size={14} />
                                </button>
                              </div>
                              <SyntaxHighlighter
                                style={oneDark}
                                language={language}
                                PreTag="div"
                                showLineNumbers={true}
                                wrapLines={true}
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code className={`inline-code ${className || ''}`} {...props}>
                              {children}
                            </code>
                          );
                        },
                        p({ children }) {
                          return <p className="message-paragraph">{children}</p>;
                        },
                        h1({ children }) {
                          return <h1 className="message-heading message-h1">{children}</h1>;
                        },
                        h2({ children }) {
                          return <h2 className="message-heading message-h2">{children}</h2>;
                        },
                        h3({ children }) {
                          return <h3 className="message-heading message-h3">{children}</h3>;
                        },
                        ul({ children }) {
                          return <ul className="message-list">{children}</ul>;
                        },
                        ol({ children }) {
                          return <ol className="message-list message-ordered-list">{children}</ol>;
                        },
                        li({ children }) {
                          return <li className="message-list-item">{children}</li>;
                        },
                        blockquote({ children }) {
                          return <blockquote className="message-quote">{children}</blockquote>;
                        },
                        strong({ children }) {
                          return <strong className="message-bold">{children}</strong>;
                        },
                        em({ children }) {
                          return <em className="message-italic">{children}</em>;
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <div className="user-message-text">
                      {message.content.split('\n').map((line, index) => (
                        <p key={index} className="user-message-line">
                          {line || '\u00A0'}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reasoning Section - Always show for assistant messages */}
                {message.role === 'assistant' && settings.showReasoning && (
                  <div className="reasoning-section">
                    <button
                      onClick={() => toggleReasoning(message.id)}
                      className="reasoning-toggle"
                    >
                      {showReasoningFor[message.id] ? 'Hide' : 'Show'} {message.reasoning ? 'Reasoning' : 'Thinking Process'}
                    </button>
                    {showReasoningFor[message.id] && (
                      <div className="reasoning-content">
                        {message.reasoning ? (
                          <ReactMarkdown
                            components={{
                              code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                  <SyntaxHighlighter
                                    style={oneDark}
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                );
                              }
                            }}
                          >
                            {message.reasoning}
                          </ReactMarkdown>
                        ) : (
                          <div className="thinking-process">
                            <div className="thinking-header">
                              <strong>Model Processing Info:</strong>
                            </div>
                            <div className="thinking-details">
                              <p>• Model: {selectedModel}</p>
                              <p>• Temperature: {settings.temperature}</p>
                              <p>• Response generated using streaming API</p>
                              {message.metadata && message.metadata.tokens > 0 && (
                                <p>• Generated {message.metadata.tokens} tokens</p>
                              )}
                              {message.rawData && (
                                <details className="raw-data-details">
                                  <summary>Raw Response Data (for debugging)</summary>
                                  <pre>{JSON.stringify(message.rawData, null, 2)}</pre>
                                </details>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Actions */}
                <div className="message-actions">
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className="copy-btn"
                      title="Copy Message"
                    >
                      <Copy size={14} />
                    </button>
                  )}
                  
                  {/* Metadata */}
                  {message.metadata && (
                    <div className="message-metadata">
                      {message.metadata.tokens > 0 && (
                        <span className="metadata-item">
                          {message.metadata.tokens} tokens
                        </span>
                      )}
                      {message.metadata.eval_duration > 0 && (
                        <span className="metadata-item">
                          {formatTokensPerSecond(message.metadata.tokens, message.metadata.eval_duration)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {message.isStreaming && (
                  <div className="streaming-indicator">
                    <Loader2 className="loading-spinner thinking-spinner" size={16} />
                    <span className="thinking-text">
                      {currentStreamMessage ? 'Generating response...' : 'Thinking deeply...'}
                    </span>
                    <div className="thinking-dots">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area">
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Upload preview" />
            <button onClick={removeImage} className="remove-image-btn">×</button>
          </div>
        )}
        
        <div className="input-container">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              selectedModel 
                ? `Message ${selectedModel}...` 
                : "Please select a model first..."
            }
            disabled={!selectedModel || isStreaming}
            className="message-input"
            rows={1}
          />
          
          <div className="input-actions">
            {selectedModel && isVisionModel(selectedModel) && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="image-upload-btn"
                  title="Upload Image"
                  disabled={isStreaming}
                >
                  <FileImage size={20} />
                </button>
              </>
            )}
            
            <button
              onClick={handleSendMessage}
              disabled={(!inputMessage.trim() && !imageFile) || !selectedModel || isStreaming}
              className="send-btn"
            >
              {isStreaming ? (
                <Loader2 className="loading-spinner" size={20} />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;