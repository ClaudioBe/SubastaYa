import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatTimeLeft, isEndingToday } from '../utils/time';

const AuctionCard = ({ auction }) => {
  const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(auction.end_date));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft(formatTimeLeft(auction.end_date));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [auction.end_date]);

  return (
    <Link to={`/subastas/${auction.id}`} className="card h-100 shadow-sm text-decoration-none text-reset">
      <div className="position-relative">
        <img
          src={auction.url_image}
          className="card-img-top"
          alt={auction.title}
          style={{ height: 200, objectFit: 'cover' }}
        />

        {isEndingToday(auction.end_date) && (
          <span className="badge bg-danger position-absolute top-0 end-0 m-2">
            TERMINA HOY
          </span>
        )}

        <span className="badge bg-dark position-absolute bottom-0 end-0 m-2">
          {timeLeft}
        </span>
      </div>

      <div className="card-body text-center">
        <h5 className="card-title text-uppercase">{auction.title}</h5>
        <div className="text-muted small mb-1">{auction.bids?.length ? 'Puja actual' : 'Desde'}</div>
        <span className="badge bg-secondary rounded-pill fs-6 px-3 py-2">
          $ {auction.currentPrice ?? auction.base_price}
        </span>
      </div>
    </Link>
  );
};

export default AuctionCard;
