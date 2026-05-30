import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import BeyondWork from "@/components/BeyondWork";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Navbar />
      <div id="scroll-container">
        <Hero />
        <About />
        <Experience />
        <Skills />
        <BeyondWork />
        <Contact />
      </div>
    </>
  );
}
