import React from 'react';
import { Mail, ExternalLink, Globe, Github, Heart, Star, Zap, Shield } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="contact-page">
      {/* Header Section */}
      <div className="contact-header">
        <div className="contact-hero">
          <h1>KAI FREE GPT</h1>
          <p className="hero-subtitle">Your Free, Privacy-First AI Assistant</p>
          <div className="hero-badges">
            <span className="badge badge-primary">
              <Zap size={16} />
              100% Free
            </span>
            <span className="badge badge-secondary">
              <Shield size={16} />
              Privacy-First
            </span>
            <span className="badge badge-success">
              <Heart size={16} />
              Open Source
            </span>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="contact-section">
        <h2>About KAI FREE GPT</h2>
        <div className="about-content">
          <p>
            KAI FREE GPT is a powerful, privacy-focused AI chat interface that runs entirely on your local machine using Ollama. 
            Unlike cloud-based AI services, your conversations and data never leave your device, ensuring complete privacy and security.
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <h3>🤖 Multiple AI Models</h3>
              <p>Support for various models including LLaMA, Mistral, CodeLlama, and vision models like LLaVA</p>
            </div>
            <div className="feature-card">
              <h3>🖼️ Vision & Image Generation</h3>
              <p>Analyze images and generate art with compatible models</p>
            </div>
            <div className="feature-card">
              <h3>🧠 Reasoning Display</h3>
              <p>See how the AI thinks through problems with detailed reasoning traces</p>
            </div>
            <div className="feature-card">
              <h3>🔒 Complete Privacy</h3>
              <p>Everything runs locally - no data sent to external servers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="contact-section">
        <h2>Contact & Support</h2>
        <div className="contact-grid">
          <div className="contact-card">
            <div className="contact-icon">
              <Mail size={32} />
            </div>
            <h3>Email Support</h3>
            <p>Get help with setup, troubleshooting, or feature requests</p>
            <a href="mailto:freegpt@kartikbhardwaj.me" className="contact-link">
              freegpt@kartikbhardwaj.me
            </a>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <Globe size={32} />
            </div>
            <h3>Official Website</h3>
            <p>Visit our website for updates, documentation, and more resources</p>
            <a href="https://www.kartikbhardwaj.me/freegpt" target="_blank" rel="noopener noreferrer" className="contact-link">
              <ExternalLink size={16} />
              www.kartikbhardwaj.me/freegpt
            </a>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <Github size={32} />
            </div>
            <h3>Source Code</h3>
            <p>KAI FREE GPT is open source. Contribute, report issues, or fork the project</p>
            <a href="https://github.com/kartikbhardwaj/kai-free-gpt" target="_blank" rel="noopener noreferrer" className="contact-link">
              <Github size={16} />
              View on GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Developer Information */}
      <div className="contact-section">
        <h2>About the Developer</h2>
        <div className="developer-info">
          <div className="developer-card">
            <div className="developer-avatar">
              <span className="avatar-text">KB</span>
            </div>
            <div className="developer-details">
              <h3>Kartik Bhardwaj</h3>
              <p className="developer-title">Full Stack Developer & AI Enthusiast</p>
              <p className="developer-bio">
                Passionate about creating open-source tools that make AI accessible to everyone while respecting privacy. 
                KAI FREE GPT represents my commitment to democratizing AI technology.
              </p>
              <div className="developer-links">
                <a href="https://www.kartikbhardwaj.me" target="_blank" rel="noopener noreferrer" className="dev-link">
                  <Globe size={16} />
                  Portfolio
                </a>
                <a href="mailto:kartik@kartikbhardwaj.me" className="dev-link">
                  <Mail size={16} />
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="contact-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          <div className="faq-item">
            <h3>Is KAI FREE GPT really free?</h3>
            <p>Yes! KAI FREE GPT is completely free and open source. There are no subscriptions, API costs, or hidden fees.</p>
          </div>
          <div className="faq-item">
            <h3>How is my privacy protected?</h3>
            <p>Everything runs locally on your machine using Ollama. Your conversations, data, and models never leave your device.</p>
          </div>
          <div className="faq-item">
            <h3>What models are supported?</h3>
            <p>Any model supported by Ollama, including LLaMA, Mistral, CodeLlama, LLaVA (vision), and many others.</p>
          </div>
          <div className="faq-item">
            <h3>Can I contribute to the project?</h3>
            <p>Absolutely! The project is open source. Submit bug reports, feature requests, or contribute code on GitHub.</p>
          </div>
        </div>
      </div>

      {/* Support Section */}
      <div className="contact-section support-section">
        <h2>Support the Project</h2>
        <div className="support-content">
          <p>
            If you find KAI FREE GPT useful, consider supporting the project:
          </p>
          <div className="support-actions">
            <button className="support-btn">
              <Star size={16} />
              Star on GitHub
            </button>
            <button className="support-btn">
              <Heart size={16} />
              Share with Friends
            </button>
            <button className="support-btn">
              <Mail size={16} />
              Send Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;