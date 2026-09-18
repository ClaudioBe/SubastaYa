import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatTimeLeft, isEndingToday } from '../utils/time';

const AuctionCard = ({ auction }) => {
  const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(auction.end_date));
  const isUpcoming = auction.state === 'PRÓXIMA';
  const isFinished = !isUpcoming && (auction.state !== 'ACTIVA' || new Date() > new Date(auction.end_date));

  useEffect(() => {
    if (isUpcoming || isFinished) return;
    const intervalId = setInterval(() => {
      setTimeLeft(formatTimeLeft(auction.end_date));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [auction.end_date, isUpcoming, isFinished]);

  return (
    <Link
      to={`/subastas/${auction.id}`}
      className="card h-100 shadow-sm text-decoration-none text-reset auction-card"
    >
      <div className="position-relative">
        <img
          src={auction.url_image}
          className="card-img-top"
          alt={auction.title}
          style={{ height: 200, objectFit: 'cover', background: '#f1f0ee' }}
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300?text=SubastaYa'; }}
        />

        {!isUpcoming && !isFinished && isEndingToday(auction.end_date) && (
          <span className="badge bg-danger position-absolute top-0 end-0 m-2">
            TERMINA HOY
          </span>
        )}

        {isUpcoming ? (
          <span className="badge position-absolute bottom-0 end-0 m-2 bg-info text-dark">
            PRÓXIMA
          </span>
        ) : isFinished ? (
          <span className="badge position-absolute bottom-0 end-0 m-2 bg-secondary">
            TERMINADA
          </span>
        ) : (
          <span className="badge position-absolute bottom-0 end-0 m-2" style={{ background: 'var(--brand-dark)' }}>
            {timeLeft}
          </span>
        )}
      </div>

      <div className="card-body text-center">
        <h5 className="card-title text-uppercase fs-6">{auction.title}</h5>
        <div className="text-muted small mb-1">{auction.bids?.length ? 'Puja actual' : 'Desde'}</div>
        <span
          className="badge rounded-pill fs-6 px-3 py-2 fw-semibold"
          style={{ background: 'var(--accent-soft)', color: 'var(--accent-hover)' }}
        >
          $ {auction.currentPrice ?? auction.base_price}
        </span>
      </div>
    </Link>
  );
};

export default AuctionCard;
