import { useState, useEffect } from 'react';
import { getStorage, setStorage } from '../../utils/localStorage';

export const AdminPayments = () => {
  const [pagamentos, setPagamentos] = useState<any>({
    pix: { ativo: false, chave: '', titular: '', banco: '', instrucoes: '' },
    dinheiro: { ativo: false, mensagem: '' },
    cartao: { ativo: false, maquininha: '', parcelamento: '' },
    linkPagamento: { ativo: false, url: '', instrucoes: '' }
  });

  useEffect(() => {
    setPagamentos(getStorage('fiorella_pagamentos', pagamentos));
  }, []);

  const handleChange = (metodo: string, campo: string, valor: any) => {
    setPagamentos((prev: any) => ({
      ...prev,
      [metodo]: { ...prev[metodo], [campo]: valor }
    }));
  };

  const salvar = () => {
    setStorage('fiorella_pagamentos', pagamentos);
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div>
      <h1 className="font-cormorant text-3xl text-fiorella-gold mb-8">Formas de Pagamento</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PIX */}
        <div className="bg-fiorella-black-lightest border border-[#333] p-6 rounded-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#333] pb-4">
            <h2 className="text-xl text-white font-medium">PIX</h2>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={pagamentos.pix?.ativo || false} onChange={e => handleChange('pix', 'ativo', e.target.checked)} className="accent-fiorella-gold" />
              Ativo
            </label>
          </div>
          <div>
            <label className="block text-sm text-[#aaa] mb-1">Chave PIX</label>
            <input type="text" value={pagamentos.pix?.chave || ''} onChange={e => handleChange('pix', 'chave', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-[#aaa] mb-1">Nome do Titular</label>
            <input type="text" value={pagamentos.pix?.titular || ''} onChange={e => handleChange('pix', 'titular', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-[#aaa] mb-1">Instruções</label>
            <textarea value={pagamentos.pix?.instrucoes || ''} onChange={e => handleChange('pix', 'instrucoes', e.target.value)} className="input-field h-20"></textarea>
          </div>
        </div>

        {/* CARTÃO */}
        <div className="bg-fiorella-black-lightest border border-[#333] p-6 rounded-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#333] pb-4">
            <h2 className="text-xl text-white font-medium">Cartão (Débito/Crédito)</h2>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={pagamentos.cartao?.ativo || false} onChange={e => handleChange('cartao', 'ativo', e.target.checked)} className="accent-fiorella-gold" />
              Ativo
            </label>
          </div>
          <div>
            <label className="block text-sm text-[#aaa] mb-1">Maquininha Aceita</label>
            <input type="text" value={pagamentos.cartao?.maquininha || ''} onChange={e => handleChange('cartao', 'maquininha', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-[#aaa] mb-1">Opções de Parcelamento</label>
            <input type="text" value={pagamentos.cartao?.parcelamento || ''} onChange={e => handleChange('cartao', 'parcelamento', e.target.value)} className="input-field" />
          </div>
        </div>

        {/* DINHEIRO */}
        <div className="bg-fiorella-black-lightest border border-[#333] p-6 rounded-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#333] pb-4">
            <h2 className="text-xl text-white font-medium">Dinheiro</h2>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={pagamentos.dinheiro?.ativo || false} onChange={e => handleChange('dinheiro', 'ativo', e.target.checked)} className="accent-fiorella-gold" />
              Ativo
            </label>
          </div>
          <div>
            <label className="block text-sm text-[#aaa] mb-1">Mensagem Personalizada</label>
            <textarea value={pagamentos.dinheiro?.mensagem || ''} onChange={e => handleChange('dinheiro', 'mensagem', e.target.value)} className="input-field h-20"></textarea>
          </div>
        </div>

        {/* LINK */}
        <div className="bg-fiorella-black-lightest border border-[#333] p-6 rounded-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#333] pb-4">
            <h2 className="text-xl text-white font-medium">Link de Pagamento</h2>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={pagamentos.linkPagamento?.ativo || false} onChange={e => handleChange('linkPagamento', 'ativo', e.target.checked)} className="accent-fiorella-gold" />
              Ativo
            </label>
          </div>
          <div>
            <label className="block text-sm text-[#aaa] mb-1">URL do Link</label>
            <input type="url" value={pagamentos.linkPagamento?.url || ''} onChange={e => handleChange('linkPagamento', 'url', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-[#aaa] mb-1">Instruções</label>
            <textarea value={pagamentos.linkPagamento?.instrucoes || ''} onChange={e => handleChange('linkPagamento', 'instrucoes', e.target.value)} className="input-field h-20"></textarea>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={salvar} className="btn-primary">Salvar Configurações</button>
      </div>
    </div>
  );
};
