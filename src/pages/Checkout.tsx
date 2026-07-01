import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getStorage, setStorage } from '../utils/localStorage';
import { getWhatsAppNumber } from '../utils/contact';
import { MessageCircle, Copy, CheckCircle } from 'lucide-react';

const formatCurrency = (value: number) => value.toFixed(2).replace('.', ',');

const crc16 = (payload: string) => {
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j += 1) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
};

const formatField = (id: string, value: string) => `${id}${String(value.length).padStart(2, '0')}${value}`;

const generatePixPayload = (pixKey: string, merchantName: string, merchantCity: string, amount: number) => {
  const normalizedAmount = amount > 0 ? amount.toFixed(2) : '';
  const merchant = merchantName.substring(0, 25);
  const city = merchantCity.substring(0, 15);

  let payload = '';
  payload += formatField('00', '01');
  payload += formatField('01', '12');

  let mai = '';
  mai += formatField('00', 'BR.GOV.BCB.PIX');
  mai += formatField('01', pixKey);
  payload += formatField('26', mai);
  payload += formatField('52', '0000');
  payload += formatField('53', '986');
  if (normalizedAmount) payload += formatField('54', normalizedAmount);
  payload += formatField('58', 'BR');
  payload += formatField('59', merchant);
  payload += formatField('60', city);
  payload += formatField('62', formatField('05', '***'));
  payload += '6304';
  payload += crc16(payload);

  return payload;
};

const getQrCodeUrl = (payload: string) => `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(payload)}`;

export const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState({ nome: '', telefone: '', endereco: '' });
  const [retirar, setRetirar] = useState(false);
  const [pagamentos, setPagamentos] = useState<any>({});
  const [formaPgto, setFormaPgto] = useState('');
  const [precisaTroco, setPrecisaTroco] = useState(false);
  const [valorTroco, setValorTroco] = useState('');
  
  const [pedidoRealizado, setPedidoRealizado] = useState<any>(null);

  useEffect(() => {
    if (cart.length === 0 && !pedidoRealizado) {
      navigate('/carrinho');
    }
    if (user) {
      setCliente(prev => ({ ...prev, nome: user.nome }));
    }
    const configPagamentos = getStorage<Record<string, any>>('fiorella_pagamentos', {});
    setPagamentos(configPagamentos);
    
    // Set default payment method
    const activeMethods = Object.keys(configPagamentos).filter(k => configPagamentos[k]?.ativo);
    if (activeMethods.length > 0) {
      setFormaPgto(activeMethods[0]);
    }
  }, [cart.length, navigate, user, pedidoRealizado]);

  const finalizarPedido = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formaPgto) return alert('Selecione uma forma de pagamento.');
    if (formaPgto === 'dinheiro' && precisaTroco) {
      const trocoValor = parseFloat(valorTroco.replace(',', '.'));
      if (!valorTroco || Number.isNaN(trocoValor) || trocoValor <= 0) {
        return alert('Informe um valor de troco válido.');
      }
    }

    const numeroPedido = Math.floor(100000 + Math.random() * 900000).toString();
    const novoPedido = {
      id: Math.random().toString(36).substring(7),
      numero: numeroPedido,
      dataHora: new Date().toISOString(),
      cliente: {
        ...cliente,
        email: user?.email || 'Visitante',
        endereco: retirar ? 'Retirar pessoalmente' : cliente.endereco
      },
      itens: cart,
      total: cartTotal,
      formaPagamento: formaPgto,
      troco: formaPgto === 'dinheiro' ? {
        precisa: precisaTroco,
        valor: precisaTroco ? parseFloat(valorTroco.replace(',', '.')) || 0 : 0
      } : undefined,
      status: 'Aguardando confirmação'
    };

    const pedidos = getStorage<any[]>('fiorella_pedidos', []);
    setStorage('fiorella_pedidos', [...pedidos, novoPedido]);

    // Reduzir estoque
    const produtos = getStorage<any[]>('fiorella_produtos', []);
    const novosProdutos = produtos.map(p => {
      const itemCart = cart.find(c => c.produtoId === p.id);
      if (itemCart) {
        return { ...p, estoque: Math.max(0, p.estoque - itemCart.quantidade) };
      }
      return p;
    });
    setStorage('fiorella_produtos', novosProdutos);

    setPedidoRealizado(novoPedido);
    clearCart();
  };

  if (pedidoRealizado) {
    const whatsapp = getWhatsAppNumber();
    const pgtoConfig = pagamentos[pedidoRealizado.formaPagamento];
    const pixPayload = pedidoRealizado.formaPagamento === 'pix' && pgtoConfig
      ? generatePixPayload(pgtoConfig.chave, pgtoConfig.titular, pgtoConfig.banco || 'SAO PAULO', pedidoRealizado.total)
      : '';

    let msgZap = `Olá, Fiorella! Meu pedido *#${pedidoRealizado.numero}* foi realizado.%0A`;
    msgZap += `Total: R$ ${pedidoRealizado.total.toFixed(2)}%0A`;
    msgZap += `Forma de pagamento: ${pedidoRealizado.formaPagamento}%0A`;
    if (pedidoRealizado.formaPagamento === 'dinheiro') {
      msgZap += `Precisa de troco: ${pedidoRealizado.troco?.precisa ? 'Sim' : 'Não'}%0A`;
      if (pedidoRealizado.troco?.precisa) {
        msgZap += `Troco para: R$ ${pedidoRealizado.troco.valor.toFixed(2)}%0A`;
      }
    }
    msgZap += `Nome: ${pedidoRealizado.cliente.nome}`;

    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <CheckCircle size={80} className="mx-auto text-[#25D366] mb-6" />
        <h1 className="font-cormorant text-4xl text-white mb-4">Pedido Realizado com Sucesso!</h1>
        <p className="text-xl text-[#aaa] mb-8">Número do pedido: <strong className="text-fiorella-gold">#{pedidoRealizado.numero}</strong></p>

        <div className="bg-fiorella-black-lightest border border-[#333] p-8 rounded-sm mb-8 text-left">
          <h3 className="text-lg text-white mb-4 border-b border-[#333] pb-2">Instruções de Pagamento</h3>
          
          {pedidoRealizado.formaPagamento === 'pix' && pgtoConfig && (
            <div>
              <p className="text-[#aaa] mb-4">{pgtoConfig.instrucoes}</p>
              <div className="grid gap-4 mb-4">
                <img src={getQrCodeUrl(pixPayload)} alt="PIX QR Code" className="mx-auto border border-[#333] rounded-sm" />
                <div className="bg-[#111] p-4 border border-[#333] rounded-sm">
                  <div className="flex items-center justify-between mb-3 gap-3">
                    <span className="text-sm text-white font-medium">PIX Copia e Cola</span>
                    <button onClick={() => navigator.clipboard.writeText(pixPayload)} className="text-[#aaa] hover:text-white flex items-center gap-1 text-sm">
                      <Copy size={16} /> Copiar
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-[#ddd] break-words">{pixPayload}</pre>
                </div>
              </div>
              <p className="text-sm text-[#aaa]">Favorecido: {pgtoConfig.titular} ({pgtoConfig.banco})</p>
              <p className="text-sm text-[#aaa]">Valor: R$ {formatCurrency(pedidoRealizado.total)}</p>
            </div>
          )}

          {pedidoRealizado.formaPagamento === 'linkPagamento' && pgtoConfig && (
            <div>
              <p className="text-[#aaa] mb-6">{pgtoConfig.instrucoes}</p>
              <a href={pgtoConfig.url} target="_blank" rel="noreferrer" className="btn-primary inline-block text-center w-full">
                Pagar Agora
              </a>
            </div>
          )}

          {pedidoRealizado.formaPagamento === 'dinheiro' && pgtoConfig && (
            <div className="space-y-2">
              <p className="text-[#aaa]">{pgtoConfig.mensagem}</p>
              <p className="text-sm text-[#aaa]">Precisa de troco: {pedidoRealizado.troco?.precisa ? 'Sim' : 'Não'}</p>
              {pedidoRealizado.troco?.precisa && (
                <p className="text-sm text-[#aaa]">Troco para: R$ {formatCurrency(pedidoRealizado.troco.valor)}</p>
              )}
            </div>
          )}

          {pedidoRealizado.formaPagamento === 'cartao' && pgtoConfig && (
            <p className="text-[#aaa]">Maquininha: {pgtoConfig.maquininha} | Parcelamento: {pgtoConfig.parcelamento}</p>
          )}

          {pedidoRealizado.cliente.endereco !== 'Retirar pessoalmente' && (
            <p className="text-sm text-[#aaa] mt-4">As entregas de SEG a SEX começam às 17h, e as de SAB começam às 13h.</p>
          )}
        </div>

        <a 
          href={`https://wa.me/${whatsapp}?text=${msgZap}`}
          target="_blank" 
          rel="noreferrer"
          className="btn-secondary w-full border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366] py-4"
        >
          <MessageCircle size={20} /> Enviar comprovante/resumo via WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-cormorant text-4xl text-fiorella-gold mb-10">Checkout</h1>

      <form onSubmit={finalizarPedido} className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1 space-y-8">
          {/* Dados do Cliente */}
          <div className="bg-fiorella-black-lightest border border-[#333] p-8 rounded-sm">
            <h2 className="font-cormorant text-2xl text-white mb-6 border-b border-[#333] pb-4">Seus Dados</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#aaa] mb-1">Nome Completo *</label>
                <input required type="text" value={cliente.nome} onChange={e => setCliente({...cliente, nome: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-[#aaa] mb-1">WhatsApp / Telefone *</label>
                <input required type="text" value={cliente.telefone} onChange={e => setCliente({...cliente, telefone: e.target.value})} className="input-field" />
              </div>
              
              <div className="pt-4 mt-4 border-t border-[#333]">
                <label className="flex items-center gap-2 text-white mb-4">
                  <input type="checkbox" checked={retirar} onChange={e => setRetirar(e.target.checked)} className="accent-fiorella-gold w-4 h-4" />
                  Retirar pessoalmente na loja
                </label>
                {!retirar && (
                  <div>
                    <label className="block text-sm text-[#aaa] mb-1">Endereço de Entrega Completo *</label>
                    <textarea required value={cliente.endereco} onChange={e => setCliente({...cliente, endereco: e.target.value})} className="input-field h-24" placeholder="Rua, Número, Bairro, Cidade, CEP, Complemento"></textarea>
                    <p className="text-sm text-[#aaa] mt-3">As entregas de SEG a SEX começam às 17h, e as de SAB começam às 13h.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pagamento */}
          <div className="bg-fiorella-black-lightest border border-[#333] p-8 rounded-sm">
            <h2 className="font-cormorant text-2xl text-white mb-6 border-b border-[#333] pb-4">Forma de Pagamento</h2>
            <div className="space-y-3">
              {Object.keys(pagamentos).map(key => {
                const pgto = pagamentos[key];
                if (!pgto || !pgto.ativo) return null;
                
                const labels: Record<string, string> = {
                  pix: 'PIX (Transferência rápida)',
                  cartao: 'Cartão (Débito/Crédito na entrega)',
                  dinheiro: 'Dinheiro (Pagamento na entrega)',
                  linkPagamento: 'Link de Pagamento (Cartão online)'
                };

                return (
                  <label key={key} className={`block p-4 border rounded-sm cursor-pointer transition-colors ${formaPgto === key ? 'border-fiorella-gold bg-fiorella-gold/5' : 'border-[#333] bg-[#111] hover:border-[#555]'}`}>
                    <div className="flex items-center gap-3 text-white">
                      <input type="radio" name="pagamento" value={key} checked={formaPgto === key} onChange={e => setFormaPgto(e.target.value)} className="accent-fiorella-gold w-4 h-4" />
                      <span className="font-medium">{labels[key]}</span>
                    </div>
                  </label>
                );
              })}
            </div>

            {formaPgto === 'dinheiro' && (
              <div className="bg-fiorella-black-lightest border border-[#333] p-6 rounded-sm mt-6">
                <h3 className="font-medium text-white mb-4">Informações de Troco</h3>
                <label className="flex items-center gap-2 text-white mb-4">
                  <input
                    type="checkbox"
                    checked={precisaTroco}
                    onChange={e => setPrecisaTroco(e.target.checked)}
                    className="accent-fiorella-gold w-4 h-4"
                  />
                  Preciso de troco
                </label>

                {precisaTroco && (
                  <div>
                    <label className="block text-sm text-[#aaa] mb-1">Troco para (R$) *</label>
                    <input
                      type="text"
                      value={valorTroco}
                      onChange={e => setValorTroco(e.target.value)}
                      placeholder="Ex: 100,00"
                      className="input-field"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-[400px]">
          <div className="bg-fiorella-black-lightest border border-[#333] p-8 rounded-sm sticky top-28">
            <h2 className="font-cormorant text-2xl text-white mb-6 border-b border-[#333] pb-4">Resumo da Compra</h2>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4">
                  <img src={item.imagem} alt={item.nome} className="w-16 h-20 object-cover border border-[#222]" />
                  <div className="flex-1 text-sm">
                    <p className="text-white truncate">{item.nome}</p>
                    <p className="text-[#aaa] text-xs">Qtd: {item.quantidade}</p>
                    <p className="text-fiorella-gold mt-1">R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-[#333] pt-6 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-white text-lg">Total</span>
                <span className="text-2xl text-fiorella-gold font-medium">R$ {formatCurrency(cartTotal)}</span>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-4 text-sm">
              Confirmar Pedido
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
