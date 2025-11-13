import Navbar from "./Navbar";
import Footer from "./Footer";
import Container from "./Container";

export default function Layout({ children, containerClassName = "" }) {
  return (
    <div className="flex flex-col min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-smooth">
      <Navbar />
      <main className="flex-grow">
        <Container className={`py-8 md:py-12 lg:py-16 xl:py-20 ${containerClassName}`}>
          {children}
        </Container>
      </main>
      <Footer />
    </div>
  );
}

