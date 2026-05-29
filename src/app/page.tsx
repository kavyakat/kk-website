import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Navbar />
      <div id="scroll-container">
        <Hero />
        <Experience />
        <Skills />
        <Contact />
      </div>
    </>
  );
}
