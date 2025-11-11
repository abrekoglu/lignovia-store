import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-smooth">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 lg:px-6 py-8 lg:py-12">
        {children}
      </main>
      <Footer />
    </div>
  );
}

