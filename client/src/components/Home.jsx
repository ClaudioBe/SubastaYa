
import { useState, useEffect } from 'react'
import axios from "axios";
import AuctionCard from './AuctionCard';
import './Home.css';

const Home = () => {
  const [search, setSearch] = useState("");
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const response = await axios.get('auctions', {
        params: search ? { search } : {}
      });
      setAuctions(response.data);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [search]);

  return (
    <div className="container" style={{ maxWidth: 1100, margin: "3rem auto" }}>
      <div className="search-bar" style={{ maxWidth: 600, margin: "0 auto 2rem" }}>
        <svg className="search-bar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="search-bar__input"
          type="text"
          placeholder="Buscar por producto o categoría..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {auctions.length === 0 && <p>No se encontraron subastas.</p>}

      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {auctions.map(a => (
          <div className="col" key={a.id}>
            <AuctionCard auction={a} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home;