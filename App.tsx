import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ViewState, BlogPost } from './types';
import { BLOG_POSTS } from './constants';

import { 
  sendChatMessage, 
  sendArticleChatMessage,
  analyzeRoofImage, 
  generateRoofDesign, 
  generateShedVideo, 
  searchLocalInfo, 
  findNearbySuppliers,
  generateArticleAudio,
  editImageWithPrompt
} from './services/geminiService';

// --- Icons ---
const MenuIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const ArrowRightIcon = () => <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>;
const ToolIcon = ({ name }: { name: string }) => {
  if (name === 'chat') return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
  if (name === 'camera') return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
  if (name === 'video') return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
  if (name === 'search') return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
  if (name === 'mic') return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
  if (name === 'bolt') return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
  if (name === 'image') return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
  return null;
};

// --- Components ---

const Header = ({ setView }: { setView: (v: ViewState) => void }) => (
  <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-stone-100 font-sans">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setView(ViewState.HOME)}>
        <div className="text-[#2F5C39]">
           <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xl leading-none text-stone-900 tracking-tight">Paul<span className="text-[#2F5C39]">Roofs</span></span>
          <span className="text-[10px] text-stone-500 uppercase tracking-widest">Est. 1995</span>
        </div>
      </div>
      <nav className="hidden md:flex items-center space-x-8">
        <button onClick={() => setView(ViewState.HOME)} className="text-stone-600 font-medium hover:text-[#2F5C39] transition">Services</button>
        <button onClick={() => setView(ViewState.BLOG_LIST)} className="text-stone-600 font-medium hover:text-[#2F5C39] transition">Homeowner Handbook</button>
        <button onClick={() => setView(ViewState.AI_TOOLS)} className="text-stone-600 font-medium hover:text-[#2F5C39] transition flex items-center">

          <span className="mr-1">AI Tools</span>
          <span className="bg-[#C5A572] text-white text-[10px] px-1.5 py-0.5 rounded-full">New</span>
        </button>
        <button className="bg-[#C5A572] hover:bg-[#B09060] text-white font-bold py-2 px-6 rounded-full transition shadow-md">
          Get a Free Estimate
        </button>
      </nav>
      <button className="md:hidden text-stone-700">
        <MenuIcon />
      </button>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-[#1B3B24] text-stone-300 py-16">
    <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
      <div className="md:col-span-1">
        <div className="flex items-center space-x-2 mb-6">
           <svg className="w-6 h-6 text-[#C5A572]" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>
           <span className="font-bold text-xl text-white">PaulRoofs</span>
        </div>
        <p className="mb-4 text-sm leading-relaxed opacity-80">Southern New Brunswick&apos;s most trusted resource for roofing, sheds, and home maintenance. We build it right, or we don&apos;t build it at all.</p>
        <div className="flex space-x-4">
           {/* Social placeholders */}
           <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#C5A572] transition cursor-pointer">fb</div>
           <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#C5A572] transition cursor-pointer">in</div>
        </div>
      </div>
      <div>
        <h3 className="text-white font-bold text-lg mb-6">Services</h3>
        <ul className="space-y-3 text-sm">
          <li><a href="#" className="hover:text-[#C5A572] transition">Roof Replacement</a></li>
          <li><a href="#" className="hover:text-[#C5A572] transition">Shed Construction</a></li>
          <li><a href="#" className="hover:text-[#C5A572] transition">Ice Dam Removal</a></li>
          <li><a href="#" className="hover:text-[#C5A572] transition">Emergency Repair</a></li>
        </ul>
      </div>
      <div>
        <h3 className="text-white font-bold text-lg mb-6">Resources</h3>
        <ul className="space-y-3 text-sm">
          <li><a href="#" className="hover:text-[#C5A572] transition">Maintenance Checklist</a></li>
          <li><a href="#" className="hover:text-[#C5A572] transition">Financing Options</a></li>
          <li><a href="#" className="hover:text-[#C5A572] transition">Warranty Guide</a></li>
          <li><a href="#" className="hover:text-[#C5A572] transition">Community Projects</a></li>
        </ul>
      </div>
      <div>
        <h3 className="text-white font-bold text-lg mb-6">Contact</h3>
        <p className="text-sm mb-2">123 Main St, Saint John, NB</p>
        <p className="text-sm mb-4">(506) 555-0123</p>
        <button className="bg-[#C5A572] hover:bg-[#B09060] text-white font-bold py-3 px-6 rounded w-full transition shadow-lg">
          Book Consultation
        </button>
      </div>
    </div>
    <div className="container mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-center text-xs opacity-50">
       © 2026 Paul&apos;s Roofing Ltd. All rights reserved. Privacy Policy.
    </div>
  </footer>
);

const Hero = ({ setView }: { setView: (v: ViewState) => void }) => (
  <section className="bg-[#FDFBF7] py-16 lg:py-24 relative overflow-hidden">
    <div className="container mx-auto px-4 relative z-10">
      <div className="flex flex-col lg:flex-row items-center">
        {/* Text Content */}
        <div className="lg:w-1/2 lg:pr-12 mb-12 lg:mb-0">
          <div className="inline-block bg-[#E8F5E9] text-[#2F5C39] text-xs font-bold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
            Serving Southern NB Since 1995
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold text-stone-900 mb-6 leading-tight">
            Meet Paul, Your Local <span className="text-[#2F5C39]">Roofing Expert</span>
          </h1>
          <p className="text-lg text-stone-600 mb-8 max-w-lg leading-relaxed">
            Dedicated to quality craftsmanship and community service. We&apos;re here to protect your home with honest work, modern tools, and old-school values.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-[#C5A572] hover:bg-[#B09060] text-white font-bold py-4 px-8 rounded-full text-lg transition shadow-lg flex items-center justify-center">
              Schedule a Consultation
            </button>
            <button onClick={() => setView(ViewState.AI_TOOLS)} className="bg-white border-2 border-[#C5A572] text-[#C5A572] hover:bg-[#FFFBF0] font-bold py-4 px-8 rounded-full text-lg transition flex items-center justify-center shadow-sm">
               Try AI Tools <ArrowRightIcon />
            </button>
          </div>
          <div className="mt-8 flex items-center space-x-4 text-stone-500 text-sm">
             <div className="flex -space-x-2">
                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" />
                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" />
                <img className="w-8 h-8 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/men/86.jpg" alt="User" />
             </div>
             <span>Trusted by 500+ neighbors this year</span>
          </div>
        </div>

        {/* Image Content */}
        <div className="lg:w-1/2 relative">
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
             {/* Main Hero Image - Paul */}
             <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Paul the Roofer" className="w-full h-[500px] object-cover object-top hover:scale-105 transition duration-700 ease-out" />
             
             {/* Floating Badge */}
             <div className="absolute top-8 right-8 bg-[#2F5C39] text-[#FDFBF7] p-6 rounded-full w-32 h-32 flex flex-col items-center justify-center text-center shadow-xl border-4 border-[#C5A572] transform rotate-12 hover:rotate-0 transition duration-300 cursor-default">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Best of</span>
                <span className="text-2xl font-bold leading-none my-1">CITY</span>
                <span className="text-sm font-bold text-[#C5A572]">2023</span>
                <span className="text-[8px] mt-1 opacity-80">Voted by You</span>
             </div>
          </div>

          {/* Decorative Pattern Background */}
          <div className="absolute -top-12 -right-12 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 -z-10"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#C5A572] rounded-full opacity-20 -z-10 blur-2xl"></div>
        </div>
      </div>
    </div>
  </section>
);

const LocalImpact = () => (
  <section className="py-20 bg-white border-b border-stone-100">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-16 items-center">
         <div className="md:w-1/2 w-full">
            <h2 className="text-3xl font-bold text-stone-900 mb-6">Our Local Impact</h2>
            <div className="bg-[#FDFBF7] rounded-3xl shadow-inner border border-stone-200 overflow-hidden relative h-80 w-full group">
               {/* Abstract Map Representation */}
               <div className="absolute inset-0 opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Transportation_map_of_Saint_John%2C_New_Brunswick.png/600px-Transportation_map_of_Saint_John%2C_New_Brunswick.png')] bg-cover bg-center grayscale group-hover:grayscale-0 transition duration-500"></div>
               
               {/* Map Markers */}
               <div className="absolute top-1/4 left-1/3 animate-bounce shadow-xl">
                  <div className="bg-[#2F5C39] text-white text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap">Recent Job: Quispamsis</div>
                  <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-6 border-t-[#2F5C39] mx-auto"></div>
               </div>
               <div className="absolute bottom-1/3 right-1/3 animate-bounce shadow-xl" style={{animationDelay: '1.2s'}}>
                  <div className="bg-[#C5A572] text-white text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap">Community Project</div>
                  <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-6 border-t-[#C5A572] mx-auto"></div>
               </div>
               <div className="absolute top-1/2 right-1/4 animate-bounce shadow-xl" style={{animationDelay: '0.5s'}}>
                  <div className="bg-[#2F5C39] text-white text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap">Roof Repair: West Side</div>
                  <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-6 border-t-[#2F5C39] mx-auto"></div>
               </div>
            </div>
         </div>
         <div className="md:w-1/2 space-y-8">
            <div className="bg-[#FDFBF7] p-8 rounded-2xl border border-stone-100 flex items-start space-x-6 relative shadow-sm">
                <div className="absolute -top-3 -left-3 text-6xl text-[#E8F5E9] font-serif leading-none">"</div>
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Reviewer" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm z-10" />
                <div className="z-10">
                  <p className="text-stone-700 italic mb-4 text-lg">&quot;Paul&apos;s team was professional and efficient. Our new roof looks amazing and the site was spotless when they left! Highly recommend the AI visualizer too.&quot;</p>
                  <div>
                      <p className="font-bold text-stone-900">- Sarah T., Oakwood</p>
                      <div className="flex text-[#C5A572] mt-1 text-sm">★★★★★</div>
                  </div>
                </div>
            </div>
            <div>
               <h3 className="font-bold text-xl text-stone-900 mb-2">Rooted in the Community</h3>
               <p className="text-stone-600 leading-relaxed">We don't just work here; we live here. From sponsoring the local hockey league to volunteering for Habitat for Humanity, PaulRoofs is proud to be a part of Saint John's fabric.</p>
            </div>
         </div>
      </div>
    </div>
  </section>
);

const FixOfTheWeek = () => (
  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg shadow-sm mb-8">
    <div className="flex items-start">
      <div className="bg-blue-100 p-2 rounded-full mr-4 text-blue-600">
        <ToolIcon name="bolt" />
      </div>
      <div>
        <h3 className="text-blue-900 font-bold text-lg mb-1">Fix of the Week: Draft-Proofing</h3>
        <p className="text-blue-800 text-sm">Seal windows and doors with caulk/weatherstripping. Crucial for Atlantic winters to prevent heat loss.</p>
      </div>
    </div>
  </div>
);

const BlogCard: React.FC<{ post: BlogPost; onClick: () => void }> = ({ post, onClick }) => (
  <div onClick={onClick} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-stone-100 flex flex-col h-full group">
    <div className="h-56 overflow-hidden relative">
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition z-10"></div>
      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
      <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full text-[#2F5C39] z-20 shadow-sm uppercase tracking-wide">
        {post.category}
      </span>
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <div className="text-xs text-stone-400 mb-3 flex items-center font-medium uppercase tracking-wider">
        <span>{post.date}</span>
        <span className="mx-2">•</span>
        <span>{post.readTime} read</span>
      </div>
      <h3 className="font-bold text-xl mb-3 text-stone-900 leading-snug group-hover:text-[#C5A572] transition">{post.title}</h3>
      <p className="text-stone-600 text-sm mb-6 line-clamp-3 flex-grow leading-relaxed">{post.excerpt}</p>
      <div className="mt-auto pt-5 border-t border-stone-100 flex items-center text-[#2F5C39] font-bold text-sm uppercase tracking-wide group-hover:translate-x-2 transition-transform">
        Read Article <ArrowRightIcon />
      </div>
    </div>
  </div>
);

const ArticleChat = ({ article }: { article: string }) => {
  const [history, setHistory] = useState<{ role: string; parts: { text: string }[] }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const userMsg = { role: 'user', parts: [{ text: input }] };
    setHistory(h => [...h, userMsg]);
    setInput('');

    try {
      const responseText = await sendArticleChatMessage(history, input, article);
      setHistory(h => [...h, { role: 'model', parts: [{ text: responseText || "I'm not sure about that." }] }]);
    } catch (e) {
      setHistory(h => [...h, { role: 'model', parts: [{ text: "Sorry, connection issue." }] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FDFBF7] border border-stone-200 rounded-2xl p-8 mt-12">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-[#E8F5E9] rounded-full text-[#2F5C39] mr-4">
          <ToolIcon name="chat" />
        </div>
        <div>
          <h3 className="font-bold text-xl text-stone-900">Ask Paul about this article</h3>
          <p className="text-sm text-stone-500">AI-powered Q&A based on this content</p>
        </div>
      </div>

      <div className="bg-white border border-stone-100 rounded-xl p-6 h-64 overflow-y-auto mb-6 space-y-4 shadow-inner">
        {history.length === 0 && <p className="text-stone-400 text-sm text-center mt-20 italic">&quot;How much does this usually cost?&quot; or &quot;Can I do this myself?&quot;</p>}
        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[#C5A572] text-white rounded-br-none' : 'bg-stone-100 text-stone-800 rounded-bl-none'}`}>
              {msg.parts[0].text}
            </div>
          </div>
        ))}
        {loading && <div className="text-stone-400 text-xs animate-pulse">Thinking...</div>}
      </div>

      <div className="flex shadow-sm rounded-lg overflow-hidden">
        <input 
          className="flex-grow border border-stone-200 px-6 py-3 text-sm focus:outline-none focus:bg-white bg-white transition" 
          placeholder="Type your question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend}
          disabled={loading}
          className="bg-[#2F5C39] text-white px-6 py-3 text-sm font-bold hover:bg-[#1B3B24] transition"
        >
          Ask
        </button>
      </div>
    </div>
  );
};

const BlogPostDetail = ({ post, onBack }: { post: BlogPost; onBack: () => void }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    return () => {
      if (audioSource) {
        audioSource.stop();
      }
    };
  }, [audioSource]);

  const handleTTS = async () => {
    if (isPlaying) {
      audioSource?.stop();
      setIsPlaying(false);
      return;
    }

    try {
      setLoadingAudio(true);
      const fullText = `${post.title}. ${post.content.replace(/[#*]/g, '')}`;
      const base64Audio = await generateArticleAudio(fullText);
      
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
      source.onended = () => setIsPlaying(false);
      
      setAudioSource(source);
      setIsPlaying(true);
    } catch (e) {
      console.error("TTS Error", e);
      alert("Failed to generate audio.");
    } finally {
      setLoadingAudio(false);
    }
  };

  return (
    <article className="max-w-4xl mx-auto py-12 px-4">
      <button onClick={onBack} className="text-stone-500 hover:text-[#2F5C39] mb-8 flex items-center font-medium transition">
        ← Back to Handbook
      </button>
      
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-[#C5A572] font-bold tracking-wider uppercase mb-4">
           <span>{post.category}</span>
           <span>•</span>
           <span>{post.date}</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-900 mb-8 leading-tight">{post.title}</h1>
        <div className="flex justify-center">
            <button 
              onClick={handleTTS}
              disabled={loadingAudio}
              className="flex items-center bg-[#2F5C39] hover:bg-[#1B3B24] text-white px-6 py-2 rounded-full transition text-sm font-bold shadow-md"
            >
              <ToolIcon name="mic" />
              <span className="ml-2">{loadingAudio ? 'Generating Audio...' : (isPlaying ? 'Stop Listening' : 'Listen to Article')}</span>
            </button>
        </div>
      </div>

      <img src={post.imageUrl} alt={post.title} className="w-full h-[400px] md:h-[500px] object-cover rounded-3xl mb-12 shadow-2xl" />

      <div className="prose prose-lg prose-stone max-w-none">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      <ArticleChat article={post.content} />

      <div className="mt-16 p-12 bg-[#1B3B24] rounded-3xl text-center text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#C5A572] rounded-full opacity-10 -mr-20 -mt-20 blur-3xl"></div>
         <h3 className="text-3xl font-bold mb-4 relative z-10">Need Professional Help?</h3>
         <p className="mb-8 opacity-90 max-w-2xl mx-auto text-lg relative z-10">Placed offers roofing, shed construction, and maintenance subscriptions across Southern New Brunswick. Let us handle the hard work.</p>
         <button className="bg-[#C5A572] hover:bg-[#B09060] text-white font-bold py-4 px-10 rounded-full transition shadow-lg relative z-10">Book a Free Quote</button>
      </div>
    </article>
  );
};


const BlogList = ({ setView, setSelectedBlogPostId }: { setView: (v: ViewState) => void, setSelectedBlogPostId: (id: string) => void }) => {
  return (
    <section className="py-16 bg-[#FDFBF7]">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold text-stone-900 mb-12 text-center">Homeowner's Handbook</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map(post => (
            <BlogCard 
              key={post.id} 
              post={post} 
              onClick={() => { setSelectedBlogPostId(post.id); setView(ViewState.BLOG_POST_DETAIL); }} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const AITools = () => (
  <section className="py-16 bg-[#FDFBF7]">
    <div className="container mx-auto px-4">
      <h1 className="text-5xl font-bold text-stone-900 mb-12 text-center">AI Tools for Your Home</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ChatBot />
        <RoofAnalyzer />
        <ShedVisualizer />
        <LocalExpert />
        <DesignStudio />
      </div>
    </div>
  </section>
);

// --- AI Tool Components ---

const ChatBot = () => {
  const [history, setHistory] = useState<{ role: string; parts: { text: string }[] }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const userMsg = { role: 'user', parts: [{ text: input }] };
    setHistory(h => [...h, userMsg]);
    setInput('');

    try {
      const responseText = await sendChatMessage(history, input);
      setHistory(h => [...h, { role: 'model', parts: [{ text: responseText || "I'm having trouble thinking right now." }] }]);
    } catch (e) {
      setHistory(h => [...h, { role: 'model', parts: [{ text: "Sorry, I encountered an error connecting to Paul's brain." }] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden">
      <div className="p-4 bg-[#2F5C39] text-white flex items-center">
        <ToolIcon name="chat" />
        <span className="font-bold ml-2">Paul's AI Assistant</span>
      </div>
      <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-[#FDFBF7]">
        {history.length === 0 && (
           <div className="text-center text-stone-400 mt-10">
             <p>Ask me about roofing, maintenance, or shed codes in NB!</p>
           </div>
        )}
        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#C5A572] text-white rounded-br-none' : 'bg-white text-stone-800 rounded-bl-none'}`}>
              {msg.parts[0].text}
            </div>
          </div>
        ))}
        {loading && <div className="text-stone-400 text-xs animate-pulse text-center">Paul is thinking...</div>}
      </div>
      <div className="p-4 bg-white border-t border-stone-100 flex">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question..."
          className="flex-grow border border-stone-200 rounded-l-lg px-4 py-3 focus:outline-none focus:border-[#C5A572]"
        />
        <button onClick={handleSend} disabled={loading} className="bg-[#1B3B24] text-white px-6 py-3 rounded-r-lg hover:bg-[#2F5C39] font-bold">Send</button>
      </div>
    </div>
  );
};

const RoofAnalyzer = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('Analyze this roof image for damage, wear, or moss growth.');
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64 = image.split(',')[1];
      const result = await analyzeRoofImage(base64, prompt);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      alert('Analysis failed');
    }
    finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!image || !editPrompt) return;
    setLoading(true);
    try {
       const base64 = image.split(',')[1];
       const result = await editImageWithPrompt(base64, editPrompt);
       setImage(result); // Update displayed image
       setEditPrompt('');
    } catch(e) {
      console.error(e);
      alert('Edit failed');
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-stone-100 p-8">
       <div className="flex items-center mb-6 text-stone-900">
         <div className="p-2 bg-[#E8F5E9] rounded-lg text-[#2F5C39] mr-3"><ToolIcon name="camera" /></div>
         <h3 className="font-bold text-xl">Roof Inspector & Editor</h3>
       </div>
       
       <div className="mb-6">
         <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide">Upload Roof Photo</label>
         <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#E8F5E9] file:text-[#2F5C39] hover:file:bg-[#C8E6C9] transition"/>
       </div>

       {image && (
         <div className="mb-6 relative group">
           <img src={image} alt="Uploaded roof" className="w-full h-64 object-cover rounded-xl shadow-md" />
         </div>
       )}

       <div className="flex space-x-2 mb-6 bg-stone-100 p-1 rounded-lg">
          <button 
             onClick={() => setIsEditing(false)} 
             className={`flex-1 py-2 text-sm font-bold rounded-md transition ${!isEditing ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
          >
            Analyze
          </button>
          <button 
             onClick={() => setIsEditing(true)} 
             className={`flex-1 py-2 text-sm font-bold rounded-md transition ${isEditing ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'}`}
          >
            Magic Edit
          </button>
       </div>

       {!isEditing ? (
         <>
            <textarea 
              className="w-full border border-stone-200 rounded-lg p-3 text-sm mb-3 focus:outline-none focus:border-[#C5A572]" 
              rows={2} 
              value={prompt} 
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button onClick={handleAnalyze} disabled={loading || !image} className="w-full bg-[#C5A572] hover:bg-[#B09060] text-white font-bold py-3 rounded-lg transition disabled:opacity-50">
              {loading ? 'Analyzing...' : 'Analyze Roof'}
            </button>
            {analysis && (
              <div className="mt-6 p-4 bg-[#FDFBF7] border border-stone-100 rounded-xl text-sm text-stone-700 h-40 overflow-y-auto leading-relaxed">
                <strong className="block mb-2 text-[#2F5C39]">Gemini Analysis:</strong>
                {analysis}
              </div>
            )}
         </>
       ) : (
         <>
            <textarea 
              className="w-full border border-stone-200 rounded-lg p-3 text-sm mb-3 focus:outline-none focus:border-[#C5A572]" 
              rows={2} 
              placeholder="e.g. Remove the moss, Add solar panels"
              value={editPrompt} 
              onChange={(e) => setEditPrompt(e.target.value)}
            />
            <button onClick={handleEdit} disabled={loading || !image} className="w-full bg-[#7E57C2] hover:bg-[#673AB7] text-white font-bold py-3 rounded-lg transition disabled:opacity-50">
              {loading ? 'Editing...' : 'Apply Edit'}
            </button>
         </>
       )}
    </div>
  );
};

const ShedVisualizer = () => {
  const [prompt, setPrompt] = useState('A modern 10x12 garden shed with vinyl siding and black shingle roof in a backyard.');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setVideoUrl(null);
    try {
      const url = await generateShedVideo(prompt);
      setVideoUrl(url);
    } catch (e) {
      console.error(e);
      alert('Video generation failed. Ensure you selected a key if prompted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-stone-100 p-8">
       <div className="flex items-center mb-6 text-stone-900">
         <div className="p-2 bg-[#E8F5E9] rounded-lg text-[#2F5C39] mr-3"><ToolIcon name="video" /></div>
         <h3 className="font-bold text-xl">Shed Visualizer (Veo)</h3>
       </div>
       
       <textarea 
          className="w-full border border-stone-200 rounded-lg p-3 text-sm mb-4 focus:outline-none focus:border-[#C5A572]" 
          rows={3} 
          value={prompt} 
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your dream shed..."
        />
        
        <button onClick={handleGenerate} disabled={loading} className="w-full bg-[#1A237E] hover:bg-[#283593] text-white font-bold py-3 rounded-lg transition disabled:opacity-50 mb-4 shadow-md">
          {loading ? 'Generating Video (this takes time)...' : 'Visualize Shed'}
        </button>

        {loading && <div className="text-center text-xs text-stone-500 italic">Creating your 720p masterpiece with Veo 3.1...</div>}

        {videoUrl && (
          <video controls className="w-full rounded-xl shadow-lg" autoPlay loop>
            <source src={videoUrl} type="video/mp4" />
          </video>
        )}
    </div>
  );
};

const LocalExpert = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [result, setResult] = useState<{text?: string, sources?: any} | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'search' | 'maps'>('search');

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      if (mode === 'search') {
        const res = await searchLocalInfo(query);
        setResult({ text: res.text, sources: res.groundingMetadata });
      } else {
        // Mock location for demo if geolocation fails or not allowed instantly
        const lat = location?.lat || 45.2733; // Saint John
        const lng = location?.lng || -66.0633;
        const res = await findNearbySuppliers(query, lat, lng);
        setResult({ text: res.text, sources: res.groundingMetadata });
      }
    } catch (e) {
      console.error(e);
      alert('Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Get location on mount/click
  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.log('Location denied', err)
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-stone-100 p-8">
      <div className="flex items-center mb-6 text-stone-900">
         <div className="p-2 bg-[#E8F5E9] rounded-lg text-[#2F5C39] mr-3"><ToolIcon name="search" /></div>
         <h3 className="font-bold text-xl">Local Research</h3>
       </div>

       <div className="flex space-x-2 mb-4 bg-stone-100 p-1 rounded-lg">
          <button onClick={() => setMode('search')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${mode === 'search' ? 'bg-white text-[#C5A572] shadow-sm' : 'text-stone-500'}`}>Web Search</button>
          <button onClick={() => { setMode('maps'); requestLocation(); }} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${mode === 'maps' ? 'bg-white text-[#C5A572] shadow-sm' : 'text-stone-500'}`}>Maps</button>
       </div>

       <div className="flex space-x-2 mb-4">
         <input 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder={mode === 'search' ? "e.g. NB roof snow load codes" : "e.g. Roofing suppliers nearby"}
            className="flex-grow border border-stone-200 rounded-lg px-4 py-3 text-sm focus:border-[#C5A572] focus:outline-none"
          />
          <button onClick={handleSearch} disabled={loading} className="bg-[#1B3B24] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#2F5C39] transition">Go</button>
       </div>

       {result && (
         <div className="text-sm text-stone-700 bg-[#FDFBF7] p-4 rounded-xl border border-stone-100 h-40 overflow-y-auto leading-relaxed">
            <p className="mb-2 whitespace-pre-wrap">{result.text}</p>
            {result.sources && (
              <div className="mt-3 border-t border-stone-200 pt-3">
                <strong className="text-xs text-stone-500 block mb-2 uppercase tracking-wide">Sources:</strong>
                <div className="flex flex-wrap gap-2">
                   {result.sources.groundingChunks?.map((chunk: any, i: number) => (
                     chunk.web?.uri ? (
                       <a key={i} href={chunk.web.uri} target="_blank" rel="noreferrer" className="text-xs text-[#2F5C39] hover:underline truncate max-w-[150px] bg-[#E8F5E9] px-2 py-1 rounded">{chunk.web.title || 'Source'}</a>
                     ) : null
                   ))}
                </div>
              </div>
            )}
         </div>
       )}
    </div>
  );
};


const DesignStudio = () => {
    const [prompt, setPrompt] = useState('A modern house with a charcoal metal roof and cedar siding.');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setImage(null);
        try {
            const url = await generateRoofDesign(prompt, '1K');
            setImage(url);
        } catch (e) {
            console.error(e);
            alert("Generation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-stone-100 p-8">
            <div className="flex items-center mb-6 text-stone-900">
                <div className="p-2 bg-[#E8F5E9] rounded-lg text-[#2F5C39] mr-3"><ToolIcon name="image" /></div>
                <h3 className="font-bold text-xl">Design Studio</h3>
            </div>
            <textarea
                className="w-full border border-stone-200 rounded-lg p-3 text-sm mb-4 focus:outline-none focus:border-[#C5A572]"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />
            <button onClick={handleGenerate} disabled={loading} className="w-full bg-[#00695C] hover:bg-[#004D40] text-white font-bold py-3 rounded-lg transition disabled:opacity-50 shadow-md">
                {loading ? 'Designing...' : 'Generate Design'}
            </button>
             {image && (
                <div className="mt-6">
                    <img src={image} alt="Generated Design" className="w-full rounded-xl shadow-lg" />
                </div>
            )}
        </div>
    );
};

// --- Main Pages ---

const Home = ({ setView, setSelectedBlogPostId }: { setView: (v: ViewState) => void, setSelectedBlogPostId: (id: string) => void }) => {

  return (
    <>
      <Hero setView={setView} />
      
      <LocalImpact />

      <div className="bg-[#FDFBF7] py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16">
            
            <div className="lg:w-2/3">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-3xl font-bold text-stone-900">Recent Articles</h2>
                 <button onClick={() => setView(ViewState.BLOG_LIST)} className="text-[#C5A572] font-bold hover:text-[#B09060] transition">View All →</button>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {BLOG_POSTS.slice(0, 4).map(post => (
                  <BlogCard 
                    key={post.id} 
                    post={post} 
                    onClick={() => { setSelectedBlogPostId(post.id); setView(ViewState.BLOG_POST_DETAIL); }} 
                  />
                ))}
              </div>
            </div>

            <div className="lg:w-1/3">
               <h2 className="text-3xl font-bold text-stone-900 mb-8">Quick Tips</h2>
               <FixOfTheWeek />
               <FixOfTheWeek />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const App = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [selectedBlogPostId, setSelectedBlogPostId] = useState<string | null>(null);

  const selectedPost = selectedBlogPostId ? BLOG_POSTS.find(post => post.id === selectedBlogPostId) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header setView={setView} />
      <main className="flex-grow">
        {view === ViewState.HOME && <Home setView={setView} setSelectedBlogPostId={setSelectedBlogPostId} />}
        {view === ViewState.BLOG_LIST && <BlogList setView={setView} setSelectedBlogPostId={setSelectedBlogPostId} />}
        {view === ViewState.BLOG_POST_DETAIL && selectedPost && <BlogPostDetail post={selectedPost} onBack={() => setView(ViewState.BLOG_LIST)} />}
        {view === ViewState.AI_TOOLS && <AITools />}
      </main>
      <Footer />
    </div>
  );
};

export default App;
