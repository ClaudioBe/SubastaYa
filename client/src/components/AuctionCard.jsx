import { useEffect, useState } from 'react';

const formatTimeLeft = (endDate) => {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return '00:00:00';

  const totalSeconds = Math.floor(diff / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const isEndingToday = (endDate) =>
  new Date(endDate).toDateString() === new Date().toDateString();

const AuctionCard = ({ auction }) => {
  const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(auction.end_date));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeLeft(formatTimeLeft(auction.end_date));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [auction.end_date]);

  return (
    <div className="card h-100 shadow-sm">
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
        <div className="text-muted small mb-1">Desde</div>
        <span className="badge bg-secondary rounded-pill fs-6 px-3 py-2">
          $ {auction.base_price}
        </span>
      </div>
    </div>
  );
};

export default AuctionCard;
