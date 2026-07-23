import Analytics from './components/Analytics';
import Features from './components/Features';
import Footer from './components/Footer';
import Header from './components/Header';
import Hero from "./components/Hero";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F3F6F9] font-sans text-[#1D2226]">
      <Header/>
      <Hero/>
      <Features/>
      <Analytics/>
      <Footer/>
    </div>
  );
};

export default LandingPage;