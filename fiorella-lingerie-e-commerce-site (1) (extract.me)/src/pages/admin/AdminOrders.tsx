import { useState, useEffect } from 'react';
import { getStorage, setStorage } from '../../utils/localStorage';

export const AdminOrders = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = () => {
    setPedidos(getStorage('fiorella_pedidos', []));
  };

  const updateStatus = (id: string, newStatus: string) => {
    const novos = pedidos.map(p => p.id === id ? { ...p, status: newStatus } : p);
    setStorage('fiorella_pedidos', novos);
    loadPedidos();
  };

  return (
    <div>
      <h1 className="font-cormorant text-3xl text-fiorella-gold mb-8">Pedidos Recebidos</h1>
      
      <div className="bg-fiorella-black-lightest border border-[#333] rounded-sm p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-[#333] text-fiorella-gold text-sm uppercase tracking-wide">
              <th className="p-3">Pedido</th>
              <th className="p-3">Data</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Total</th>
              <th className="p-3">Pagamento</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map(p => (
              <tr key={p.id} className="border-b border-[#222] hover:bg-[#1a1a1a]">
                <td className="p-3 text-white font-medium">#{p.numero}</td>
                <td className="p-3 text-[#aaa]">{new Date(p.dataHora).toLocaleString('pt-BR')}</td>
                <td className="p-3 text-[#aaa]">{p.cliente?.nome}</td>
                <td className="p-3 text-fiorella-gold">R$ {Number(p.total).toFixed(2)}</td>
                <td className="p-3 text-[#aaa] uppercase text-xs">{p.formaPagamento}</td>
                <td className="p-3">
                  <select 
                    value={p.status} 
                    onChange={e => updateStatus(p.id, e.target.value)}
                    className="bg-[#111] text-white border border-[#333] text-sm px-2 py-1 rounded focus:border-fiorella-gold outline-none"
                  >
                    <option value="Aguardando confirmação">Aguardando</option>
                    <option value="Pago">Pago</option>
                    <option value="Em separação">Em separação</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Entregue">Entregue</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </td>
              </tr>
            ))}
            {pedidos.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-[#666]">Nenhum pedido encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
