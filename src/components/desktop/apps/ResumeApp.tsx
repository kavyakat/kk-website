import { resumePath } from "@/data/content";

export default function ResumeApp() {
  return <iframe title="Resume" src={resumePath} style={{ width: "100%", height: "100%", border: "none" }} />;
}
