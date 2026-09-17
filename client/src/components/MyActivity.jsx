import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';

const bidStatusBadge = {
  GANADA: 'bg-success',
  GANANDO: 'bg-success',
  PERDIDA: 'bg-secondary',
  SUPERADO: 'bg-warning text-dark'
};

const bidStatusLabel = {
  GANADA: 'Ganada',
  GANANDO: 'Vas ganando',
  PERDIDA: 'Perdida',
  SUPERADO: 'Te superaron'
};

const MyActivity = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('compras');
  const [bids, setBids] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (tab === 'compras') {
          const response = await axios.get(`users/${user.id}/bids`);
          setBids(response.data);
        } else {
          const response = await axios.get('auctions', { params: { sellerId: user.id } });
          setAuctions(response.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tab, user]);

  if (!user) return <div className="container my-5">Iniciá sesión para ver tus actividades.</div>;

  return (
    <div className="container my-5" style={{ maxWidth: 900 }}>
      <h2 className="mb-4">Mis actividades</h2>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${tab === 'compras' ? 'active' : ''}`}
            onClick={() => setTab('compras')}
          >
            Mis Compras / Pujas
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === 'publicaciones' ? 'active' : ''}`}
            onClick={() => setTab('publicaciones')}
          >
            Mis Publicaciones
          </button>
        </li>
      </ul>

      {loading && <p className="text-muted">Cargando...</p>}

      {!loading && tab === 'compras' && (
        bids.length === 0 ? (
          <p className="text-muted">Todavía no participaste de ninguna subasta.</p>
        ) : (
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Subasta</th>
                <th>Tu mejor puja</th>
                <th>Puja actual</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {bids.map(b => (
                <tr key={b.id}>
                  <td>{b.title}</td>
                  <td>$ {b.myBestAmount}</td>
                  <td>$ {b.highestAmount}</td>
                  <td><span className={`badge ${bidStatusBadge[b.status]}`}>{bidStatusLabel[b.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}

      {!loading && tab === 'publicaciones' && (
        auctions.length === 0 ? (
          <p className="text-muted">Todavía no publicaste ninguna subasta.</p>
        ) : (
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Subasta</th>
                <th>Recaudación</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {auctions.map(a => {
                const auctionBids = a.bids || [];
                const recaudacion = auctionBids.length ? Math.max(...auctionBids.map(b => Number(b.amount))) : 0;
                const isFinished = a.state !== 'ACTIVA' || new Date() > new Date(a.end_date);
                const estado = !isFinished ? 'En curso' : (auctionBids.length ? 'Vendida' : 'No vendida');
                const badgeClass = !isFinished ? 'bg-primary' : (auctionBids.length ? 'bg-success' : 'bg-secondary');
                return (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td>$ {recaudacion}</td>
                    <td><span className={`badge ${badgeClass}`}>{estado}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )
      )}
    </div>
  );
};

export default MyActivity;
