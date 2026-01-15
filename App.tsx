
import React, { useState, useEffect } from 'react';
import { BOOK_CONTENT } from './constants';
import { GoogleGenAI } from "@google/genai";
import { Menu, X, Map, Info, Book, User, ArrowUp, Loader2 } from 'lucide-react';

// Generative Image Component to "restore" original photos from descriptions
const GenerativeImage: React.FC<{ prompt: string; alt: string; className?: string }> = ({ prompt, alt, className }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchImage = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: `${prompt} The image should look like a high-quality, authentic, documentary photo from a travel history book. Warm, natural lighting, sharp focus.` }],
          },
        });

        if (isMounted) {
          const parts = response.candidates?.[0]?.content?.parts || [];
          for (const part of parts) {
            if (part.inlineData) {
              const base64 = part.inlineData.data;
              setImageUrl(`data:image/png;base64,${base64}`);
              setLoading(false);
              return;
            }
          }
          throw new Error("No image data found");
        }
      } catch (err) {
        console.error("Image gen failed:", err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    fetchImage();
    return () => { isMounted = false; };
  }, [prompt]);

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center bg-stone-200 animate-pulse border-2 border-amber-900/10 rounded-sm ${className}`}>
        <Loader2 className="w-12 h-12 text-amber-900 animate-spin mb-4" />
        <span className="font-cinzel text-xs text-amber-900/60 uppercase tracking-widest text-center px-4">Restoring Original Photo...</span>
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className={`flex items-center justify-center bg-stone-300 text-stone-500 rounded-sm ${className}`}>
        <span className="text-sm italic text-center px-4">Could not load original visual</span>
      </div>
    );
  }

  return <img src={imageUrl} alt={alt} className={`${className} object-cover`} />;
};

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('cover');
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      
      const sections = ['cover', 'intro', ...BOOK_CONTENT.sections.map(s => s.id), 'about'];
      for (const id of sections) {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen paper-bg flex flex-col md:flex-row overflow-x-hidden">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-stone-900 text-stone-100 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:shrink-0`}>
        <div className="p-6 h-full flex flex-col">
          <h2 className="text-xl font-cinzel font-bold mb-8 text-amber-500 border-b border-stone-700 pb-2 uppercase tracking-widest">Contents</h2>
          
          <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            <button 
              onClick={() => scrollTo('cover')}
              className={`w-full text-left p-2 rounded transition-colors flex items-center gap-2 ${activeSection === 'cover' ? 'bg-amber-900 text-amber-200' : 'hover:bg-stone-800'}`}
            >
              <Book size={18} /> <span className="text-sm">Cover</span>
            </button>
            <button 
              onClick={() => scrollTo('intro')}
              className={`w-full text-left p-2 rounded transition-colors flex items-center gap-2 ${activeSection === 'intro' ? 'bg-amber-900 text-amber-200' : 'hover:bg-stone-800'}`}
            >
              <Info size={18} /> <span className="text-sm">Introduction</span>
            </button>
            
            <div className="pt-4 pb-2 text-xs font-cinzel text-stone-500 uppercase tracking-widest">The Stories</div>
            
            {BOOK_CONTENT.sections.map((section, idx) => (
              <button 
                key={section.id}
                onClick={() => scrollTo(section.id)}
                className={`w-full text-left p-2 rounded transition-colors flex items-center gap-2 ${activeSection === section.id ? 'bg-amber-900 text-amber-200' : 'hover:bg-stone-800'}`}
              >
                <span className="text-xs text-amber-600 font-bold">{idx + 1}.</span>
                <span className="text-sm truncate">{section.title}</span>
              </button>
            ))}

            <div className="pt-4 pb-2 text-xs font-cinzel text-stone-500 uppercase tracking-widest">Afterword</div>
            <button 
              onClick={() => scrollTo('about')}
              className={`w-full text-left p-2 rounded transition-colors flex items-center gap-2 ${activeSection === 'about' ? 'bg-amber-900 text-amber-200' : 'hover:bg-stone-800'}`}
            >
              <User size={18} /> <span className="text-sm">Author & Book</span>
            </button>
          </nav>
          
          <div className="mt-8 pt-4 border-t border-stone-700 text-[10px] text-stone-500 font-cinzel text-center">
            Copyright © 2026<br/>Maryam M. Mahmoud
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 w-full bg-stone-900 text-amber-500 p-4 z-40 flex justify-between items-center shadow-lg">
        <span className="font-cinzel font-bold tracking-widest text-sm uppercase">A Taste of History</span>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 md:h-screen md:overflow-y-auto scroll-smooth pt-16 md:pt-0">
        
        {/* Section: Cover Page */}
        <section id="cover" className="min-h-screen leather-bg flex items-center justify-center p-4 md:p-12 relative overflow-hidden">
          <div className="max-w-4xl w-full aspect-[3/4] md:aspect-auto md:min-h-[85vh] bg-[#d2b48c] border-[12px] border-amber-900 rounded-sm shadow-2xl p-8 md:p-16 flex flex-col justify-between text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/old-map.png')]"></div>
            
            <header className="relative z-10">
              <div className="mb-4 inline-block px-4 py-1 border border-amber-900 text-amber-900 font-cinzel text-xs tracking-[0.2em] uppercase">Culinary Heritage Series</div>
              <h1 className="text-5xl md:text-8xl font-bold text-amber-900 mb-2 font-cinzel drop-shadow-md uppercase leading-tight">
                {BOOK_CONTENT.title}
              </h1>
              <div className="w-24 h-1 bg-amber-900 mx-auto my-6"></div>
              <p className="text-xl md:text-3xl text-amber-800 font-serif italic mb-8">
                {BOOK_CONTENT.subtitle}
              </p>
            </header>

            <div className="flex-1 flex items-center justify-center relative z-10 my-8">
              <div className="max-w-2xl w-full p-6 border-2 border-amber-800/30 rounded-sm bg-stone-100/20 backdrop-blur-sm shadow-inner overflow-hidden">
                 <GenerativeImage 
                  prompt="A magnificent and artistic book cover illustration featuring a collection of iconic global foods (Pizza, Sushi, Biryani, Hummus) arranged in a balanced, classical composition on a vintage textured parchment background. Warm golden hues, professional culinary illustration style." 
                  alt="A Taste of History Cover Page Illustration" 
                  className="w-full h-[300px] md:h-[450px] rounded shadow-2xl mix-blend-multiply transition-transform duration-1000 hover:scale-105"
                />
              </div>
            </div>

            <footer className="relative z-10">
              <p className="text-2xl md:text-4xl font-serif text-amber-900 font-bold tracking-[0.1em] uppercase">
                {BOOK_CONTENT.author}
              </p>
            </footer>
          </div>
        </section>

        {/* Section: Introduction */}
        <section id="intro" className="min-h-screen flex items-center justify-center p-8 md:p-24 bg-[#fcf8f1]">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-6xl text-amber-900 mb-12 border-b-4 border-amber-900/20 pb-4 inline-block font-cinzel uppercase">Introduction</h2>
            <div className="space-y-6 text-lg md:text-xl leading-relaxed text-stone-700 font-serif italic">
              {BOOK_CONTENT.introduction.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Sections: Food Items */}
        {BOOK_CONTENT.sections.map((food, idx) => (
          <section key={food.id} id={food.id} className="min-h-screen py-16 md:py-24 px-4 md:px-12 flex flex-col items-center border-b border-amber-200">
            <div className="max-w-5xl w-full">
              {/* Food Header */}
              <div className="mb-12 text-center">
                <span className="text-amber-700 font-cinzel text-lg font-bold tracking-tighter block mb-2 uppercase">{idx + 1}. {food.country}</span>
                <h2 className="text-5xl md:text-8xl text-amber-900 uppercase font-cinzel tracking-tight">{food.title}</h2>
              </div>

              {/* Main Image and Fact */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
                <div className="lg:col-span-8 space-y-4">
                  <div className="relative group">
                    <GenerativeImage 
                      prompt={food.image} 
                      alt={food.title} 
                      className="w-full h-[400px] md:h-[600px] shadow-2xl border-[16px] border-white grayscale-[10%] hover:grayscale-0 transition-all duration-700" 
                    />
                    <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-4 text-sm italic backdrop-blur-sm transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                      {food.captions[0]}
                    </div>
                  </div>
                  <p className="text-sm text-stone-500 italic md:hidden text-center">{food.captions[0]}</p>
                </div>
                
                <div className="lg:col-span-4 h-full flex flex-col justify-center">
                  {food.didYouKnow && (
                    <div className="bg-amber-50 p-8 border-l-8 border-amber-600 rounded-r-lg shadow-sm border-y border-r border-amber-200">
                      <h4 className="font-cinzel text-amber-800 text-xl font-bold mb-4 flex items-center gap-2 uppercase tracking-wide">
                        <Info className="text-amber-600" /> Did you know?
                      </h4>
                      <p className="text-stone-700 italic leading-relaxed text-lg font-serif">
                        {food.didYouKnow}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
                <div className="space-y-6">
                  <h3 className="text-3xl font-cinzel text-amber-800 border-b-2 border-amber-800/20 pb-2 uppercase tracking-wide">History and Origin</h3>
                  {food.history.map((para, i) => (
                    <p key={i} className="text-lg leading-relaxed text-stone-700 first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-amber-900 first-letter:font-cinzel">{para}</p>
                  ))}
                </div>
                <div className="space-y-6">
                  <h3 className="text-3xl font-cinzel text-amber-800 border-b-2 border-amber-800/20 pb-2 uppercase tracking-wide">Cultural Significance</h3>
                  {food.significance.map((para, i) => (
                    <p key={i} className="text-lg leading-relaxed text-stone-700">{para}</p>
                  ))}
                </div>
              </div>

              {/* Variations / Special Sections */}
              {food.variations && (
                <div className="bg-stone-900 text-stone-100 p-8 md:p-16 rounded-sm shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 opacity-10 p-4">
                    <Map size={120} />
                  </div>
                  <h3 className="text-4xl text-amber-500 font-cinzel mb-8 relative z-10 uppercase tracking-widest">{food.variations.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    {food.variations.content.map((para, i) => (
                      <p key={i} className="text-stone-300 text-lg leading-relaxed">{para}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        ))}

        {/* Section: About Book & Author */}
        <section id="about" className="min-h-screen py-24 px-8 md:px-24 leather-bg text-stone-100">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
              <div className="mb-20">
                <h2 className="text-4xl md:text-5xl font-cinzel text-amber-500 mb-8 tracking-widest border-b border-amber-900 pb-4 uppercase">About The Book</h2>
                <p className="text-xl leading-relaxed text-stone-300 font-serif italic max-w-2xl mx-auto">
                  {BOOK_CONTENT.aboutBook}
                </p>
              </div>
              
              <div className="w-full h-px bg-amber-900/50 mb-20"></div>

              <div>
                <h2 className="text-4xl md:text-5xl font-cinzel text-amber-500 mb-8 tracking-widest border-b border-amber-900 pb-4 uppercase">About The Author</h2>
                <p className="text-xl font-cinzel text-amber-500 tracking-widest uppercase mb-4 text-2xl">{BOOK_CONTENT.author}</p>
                <p className="text-amber-700 font-serif italic mb-8">IB MYP Student & Food Historian</p>
                <p className="text-xl leading-relaxed text-stone-300 font-serif max-w-2xl mx-auto">
                  {BOOK_CONTENT.aboutAuthor}
                </p>
              </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black py-12 text-center text-stone-600 text-sm font-cinzel tracking-[0.3em] px-4 border-t border-amber-900/20">
          <p className="uppercase mb-2 text-stone-400">{BOOK_CONTENT.title}</p>
          <p className="uppercase mb-4 text-xs">{BOOK_CONTENT.subtitle}</p>
          <p className="opacity-40 uppercase text-[10px]">Designed and Authored by {BOOK_CONTENT.author} &copy; 2026</p>
        </footer>
      </main>

      {/* Floating Scroll to Top */}
      {showScrollTop && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 bg-amber-900 text-amber-200 p-3 rounded-full shadow-2xl hover:bg-amber-800 transition-all z-50 border border-amber-600/30 group"
        >
          <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform" />
        </button>
      )}
    </div>
  );
};

export default App;
