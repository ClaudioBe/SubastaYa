import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext.jsx';
import { useWallet } from '../context/WalletContext.jsx';

const movementTypeInfo = {
  DEPOSITO: { label: 'Depósito', badge: 'bg-success', sign: '+' },
  RETENCION: { label: 'Retención por oferta', badge: 'bg-warning text-dark', sign: '-' },
  LIBERACION: { label: 'Liberación (superado)', badge: 'bg-info text-dark', sign: '+' },
  DEBITO: { label: 'Débito por subasta ganada', badge: 'bg-danger', sign: '-' }
};

const Wallet = () => {
  const { user } = useAuth();
  const { balance, loading, hasWallet, deposit } = useWallet();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [movements, setMovements] = useState([]);

  const refreshMovements = useCallback(async () => {
    if (!user) return;
    const response = await axios.get('wallets/movements', { params: { userId: user.id } });
    setMovements(response.data);
  }, [user]);

  useEffect(() => {
    if (!hasWallet) return;
    refreshMovements();
  }, [hasWallet, refreshMovements]);

  if (!user) return <div className="container my-5">Iniciá sesión para ver tu billetera.</div>;

  if (!loading && !hasWallet) {
    return (
      <div className="container my-5">
        <h2 className="mb-3">Mi billetera</h2>
        <div className="alert alert-warning">
          Todavía no tenés una billetera asociada a tu cuenta. Contactá a soporte para que te habiliten una.
        </div>
      </div>
    );
  }

  const handleDeposit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await deposit(amount);
      setAmount('');
      swal.fire({ title: 'Depósito realizado!', icon: 'success', timer: 1000, showConfirmButton: false });
      refreshMovements();
    } catch (err) {
      setError(err.response?.data || 'No se pudo realizar el depósito.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: 600 }}>
      <h2 className="mb-4">Mi billetera</h2>

      {loading ? (
        <p className="text-muted">Cargando saldo...</p>
      ) : (
        <div className="row g-3 mb-4">
          <div className="col-4">
            <div className="border rounded p-3 text-center">
              <div className="text-muted small">Total</div>
              <div className="fs-5 fw-bold">$ {balance.total_balance}</div>
            </div>
          </div>
          <div className="col-4">
            <div className="border rounded p-3 text-center">
              <div className="text-muted small">Retenido</div>
              <div className="fs-5 fw-bold">$ {balance.withheld_balance}</div>
            </div>
          </div>
          <div className="col-4">
            <div className="border rounded p-3 text-center">
              <div className="text-muted small">Disponible</div>
              <div className="fs-5 fw-bold">$ {balance.available_balance}</div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleDeposit} className="border rounded p-3">
        <h6 className="mb-3">Depositar fondos</h6>
        <div className="mb-2">
          <label className="form-label">Monto</label>
          <input
            type="number"
            className="form-control"
            value={amount}
            min="0.01"
            step="0.01"
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        {error && <p className="text-danger small">{error}</p>}
        <button type="submit" className="btn btn-dark w-100" disabled={submitting}>
          {submitting ? 'Procesando...' : 'Depositar'}
        </button>
      </form>

      <h6 className="mt-4 mb-3">Historial de movimientos</h6>
      {movements.length === 0 ? (
        <p className="text-muted small">Todavía no hay movimientos.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Movimiento</th>
              <th>Subasta</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            {movements.map(m => (
              <tr key={m.id}>
                <td>{new Date(m.date).toLocaleDateString()}</td>
                <td><span className={`badge ${movementTypeInfo[m.type]?.badge ?? 'bg-secondary'}`}>{movementTypeInfo[m.type]?.label ?? m.type}</span></td>
                <td>{m.auction?.title ?? '-'}</td>
                <td>{movementTypeInfo[m.type]?.sign ?? ''} $ {m.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Wallet;
