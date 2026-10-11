'use client';
import { useState } from 'react';
import { useApp, post } from './Providers';
import { fmtPrice, Msg } from './ui';

export default function Cart() {
  const { t, tr, cart, setQty, clearCart, cartOpen, setCartOpen, s } = useApp();
  const [f, setF] = useState({ name: '', phone: '', note: '' });
  const [m, setM] = useState(null);
  const [busy, setBusy] = useState(false);
  const total = cart.reduce((a, b) => a + (b.price || 0) * b.qty, 0);
  async function send(e) {
    e.preventDefault();
    setBusy(true);
    const r = await post('/api/submit/orders', { ...f, items: cart.map((c) => ({ id: c.id, qty: c.qty })) });
    setBusy(false);
    if (r.ok) { clearCart(); setM({ text: t('Commande envoyée. Nous vous contactons bientôt.', 'Order sent. We will contact you soon.') }); }
    else setM({ err: 1, text: t('Échec de l\'envoi. Vérifiez vos informations.', 'Could not send. Check your details.') });
  }
  return (
    <aside className={'drawer' + (cartOpen ? ' open' : '')} aria-hidden={!cartOpen}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 style={{ fontSize: '1.7rem' }}>{t('Panier', 'Cart')}</h2><button className="ic" onClick={() => setCartOpen(false)} aria-label="Fermer">×</button></div>
      {!cart.length && <p className="mute" style={{ marginTop: '1rem' }}>{t('Votre panier est vide. Choisissez un livre dans la boutique.', 'Your cart is empty. Pick a book from the shop.')}</p>}
      {cart.map((c) => (
        <div className="row" key={c.id}>
          <div><b>{tr(c, 'title')}</b><small>{fmtPrice(c.price)}</small></div>
          <button className="ic" onClick={() => setQty(c.id, c.qty - 1)}>−</button><span>{c.qty}</span><button className="ic" onClick={() => setQty(c.id, c.qty + 1)}>+</button>
        </div>
      ))}
      {cart.length > 0 && (
        <form onSubmit={send}>
          <p style={{ margin: '1rem 0' }}><b>Total : <span className="price">{fmtPrice(total)}</span></b></p>
          <p className="mute" style={{ fontSize: '.92rem' }}>{s('payment_info')}</p>
          <label className="f">{t('Nom', 'Name')}<input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
          <label className="f">{t('Téléphone / WhatsApp', 'Phone / WhatsApp')}<input required value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
          <label className="f">{t('Précision (retrait, livraison…)', 'Note (pickup, delivery…)')}<textarea value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} style={{ minHeight: 70 }} /></label>
          <button className="btn" style={{ marginTop: '1rem' }} disabled={busy}>{t('Envoyer la commande', 'Send order')}</button>
        </form>
      )}
      <Msg m={m} />
    </aside>
  );
}
