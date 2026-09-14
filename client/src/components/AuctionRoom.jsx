import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import swal from 'sweetalert2';
import { formatTimeLeft, isEndingToday } from '../utils/time';

const AuctionRoom = () => {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [timeLeft, setTimeLeft] = useState('00:00:00');
  const [amount, setAmount] = useState('');
  // TODO: reemplazar por el id del usuario logueado cuando exista sesión real.
  const [buyerId, setBuyerId] = useState('');
  const [error, setError] = useState('');

  const fetchAuction = async () => {
    const response = await axios.get(`auctions/${id}`);
    setAuction(response.data);
  };

  useEffect(() => {
    fetchAuction();
    const pollId = setInterval(fetchAuction, 4000);
    return () => clearInterval(pollId);
  }, [id]);

  useEffect(() => {
    if (!auction) return;
    setTimeLeft(formatTimeLeft(auction.end_date));
    const tickId = setInterval(() => setTimeLeft(formatTimeLeft(auction.end_date)), 1000);
    return () => clearInterval(tickId);
  }, [auction?.end_date]);

  if (!auction) return <div className="container my-5">Cargando subasta...</div>;

  const bids = [...(auction.bids || [])].sort((a, b) => Number(b.amount) - Number(a.amount));
  const highestBid = bids[0];
  const currentPrice = highestBid ? Number(highestBid.amount) : Number(auction.base_price);
  const minAmount = currentPrice + Number(auction.min_increase);
  const isFinished = new Date() > new Date(auction.end_date) || auction.state !== 'ACTIVA';

  const handleBid = async (e) => {
    e.preventDefault();
    setError('');
    if (!buyerId) {
      setError('Debe ingresar su ID de usuario para pujar.');
      return;
    }
    try {
      await axios.post(`auctions/${id}/bids`, { buyerId, amount });
      setAmount('');
      swal.fire({ title: 'Puja realizada!', icon: 'success', timer: 1000, showConfirmButton: false });
      fetchAuction();
    } catch (err) {
      setError(err.response?.data || 'No se pudo realizar la puja.');
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: 900 }}>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="position-relative">
            <img
              src={auction.url_image}
              alt={auction.title}
              className="img-fluid rounded shadow-sm"
              style={{ width: '100%', height: 380, objectFit: 'cover' }}
            />
            {isEndingToday(auction.end_date) && !isFinished && (
              <span className="badge bg-danger position-absolute top-0 end-0 m-2">TERMINA HOY</span>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <span className="badge bg-secondary mb-2">{auction.category?.name}</span>
          <h2 className="text-uppercase">{auction.title}</h2>
          <p className="text-muted">{auction.description}</p>
          <p className="mb-1">Vendedor: <strong>{auction.user?.name}</strong></p>

          <div className="d-flex align-items-center gap-3 my-3">
            <div>
              <div className="text-muted small">{highestBid ? 'Puja actual' : 'Precio base'}</div>
              <div className="fs-3 fw-bold">$ {currentPrice}</div>
            </div>
            <div>
              <div className="text-muted small">Tiempo restante</div>
              <div className={`fs-5 fw-bold ${isFinished ? 'text-danger' : ''}`}>
                {isFinished ? 'FINALIZADA' : timeLeft}
              </div>
            </div>
          </div>

          {!isFinished ? (
            <form onSubmit={handleBid} className="border rounded p-3">
              <div className="mb-2">
                <label className="form-label">Tu ID de usuario</label>
                <input
                  type="number"
                  className="form-control"
                  value={buyerId}
                  onChange={(e) => setBuyerId(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Monto a pujar (mínimo $ {minAmount})</label>
                <input
                  type="number"
                  className="form-control"
                  value={amount}
                  min={minAmount}
                  step="0.01"
                  placeholder={minAmount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              {error && <p className="text-danger small">{error}</p>}
              <button type="submit" className="btn btn-dark w-100">Pujar</button>
            </form>
          ) : (
            <div className="alert alert-secondary">Esta subasta ya finalizó.</div>
          )}

          <div className="mt-4">
            <h6>Historial de pujas</h6>
            {bids.length === 0 && <p className="text-muted small">Todavía no hay pujas.</p>}
            <ul className="list-group">
              {bids.map((bid) => (
                <li key={bid.id} className="list-group-item d-flex justify-content-between">
                  <span>{bid.user?.name || `Usuario ${bid.buyer_id}`}</span>
                  <strong>$ {bid.amount}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionRoom;
