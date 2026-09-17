
import { useState, useEffect } from 'react'
import axios from "axios";
import AuctionCard from './AuctionCard';
import './Home.css';

const Home = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");
  const [categories, setCategories] = useState([]);
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    axios.get('auctions/categories').then(response => setCategories(response.data));
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (state) params.state = state;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sort) params.sort = sort;

      const response = await axios.get('auctions', { params });
      setAuctions(response.data);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [search, category, state, minPrice, maxPrice, sort]);

  return (
    <div className="container" style={{ maxWidth: 1100, margin: "1.5rem auto 3rem" }}>
      <div className="search-bar" style={{ maxWidth: 600, margin: "0 auto 1.5rem" }}>
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

      <div className="row g-2 align-items-center mb-4">
        <div className="col-6 col-md-2">
          <select className="form-select" value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="ACTIVA">Activas</option>
            <option value="PROXIMA">Próximas</option>
            <option value="FINALIZADA">Finalizadas</option>
          </select>
        </div>
        <div className="col-6 col-md-2">
          <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categories.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <div className="col-6 col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Precio mín."
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div className="col-6 col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Precio máx."
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-4">
          <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="">Ordenar por...</option>
            <option value="time_asc">Menor tiempo restante</option>
            <option value="bids_desc">Mayor puja</option>
          </select>
        </div>
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
