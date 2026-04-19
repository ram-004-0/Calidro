import NavBar from "../Components/NavBar";
import Home from "./Home";
import Gallery from "./Gallery";
import Book from "./Book";
import Contact from "./Contact";
import Footer from "../Components/Footer";
const Landing = () => {
  return (
    <div>
      <NavBar />

      <section id="home">
        <Home />
      </section>

      <section id="gallery">
        <Gallery />
      </section>

      <section id="book">
        <Book />
      </section>
      <section id="contact">
        <Contact />
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
