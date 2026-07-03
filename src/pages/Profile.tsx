import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStorage } from '../utils/localStorage';
import { getMedidas, saveMedidas, TAMANHO_SUTIA_OPCOES } from '../utils/medidas';
import { GuiaDeMedidas } from '../components/GuiaDeMedidas';
import { LogOut, Package, Ruler } from 'lucide-react';

const TAMANHO_CALCINHA_OPCOES = ['P', 'M', 'G', 'GG'];
const TAMANHO_ROUPA_OPCOES = ['PP', 'P', 'M', 'G', 'GG', 'XG'];

export const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<any[]>([]);

  const [tamanhoSutia, setTamanhoSutia] = useState('');
  const [tamanhoCalcinha, setTamanhoCalcinha] = useState('');
  const [tamanhoRoupa, setTamanhoRoupa] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [medidasSalvas, setMedidasSalvas] = useState(false);
  const [guiaAberto, setGuiaAberto] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const allPedidos = getStorage<any[]>('fiorella_pedidos', []);
    setPedidos(allPedidos.filter(p => p.cliente?.email === user.email));

    if (user.id) {
      const medidas = getMedidas(user.id);
      if (medidas) {
        setTamanhoSutia(medidas.tamanhoSutia || '');
        setTamanhoCalcinha(medidas.tamanhoCalcinha || '');
        setTamanhoRoupa(medidas.tamanhoRoupa || '');
        setObservacoes(medidas.observacoes || '');
      }
    }
  }, [user, navigate]);

  if (!user) return null;

  const salvarMedidas = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.id) return;
    saveMedidas(user.id, {
      tamanhoSutia,
      tamanhoCalcinha: tamanhoCalcinha as any,
      tamanhoRoupa: tamanhoRoupa as any,
      observacoes: observacoes || undefined,
    });
    setMedidasSalvas(true);
    setTimeout(() => setMedidasSalvas(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-[#333] pb-6">
        <div>
          <h1 className="font-cormorant text-4xl text-fiorella-gold mb-2">Minha Conta</h1>
          <p className="text-[#aaa]">Olá, {user.nome}</p>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} className="mt-4 md:mt-0 flex items-center gap-2 text-fiorella-red hover:text-fiorella-red-hover transition-colors">
          <LogOut size={20} /> Sair
        </button>
      </div>

      <div className="mb-12">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-cormorant text-2xl text-white flex items-center gap-2">
            <Ruler className="text-fiorella-gold" /> Minhas Medidas
          </h2>
          <button type="button" onClick={() => setGuiaAberto(true)} className="text-xs text-fiorella-gold hover:text-white underline underline-offset-2">
            Não sabe seu tamanho? Veja como medir
          </button>
        </div>
        <p className="text-sm text-[#aaa] mb-6">
          Usamos essas medidas só para mostrar se uma peça deve servir em você — nada de provador virtual, é comparação com o que cadastramos de cada produto.
        </p>

        <form onSubmit={salvarMedidas} className="bg-fiorella-black-lightest border border-[#333] rounded-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-fiorella-gold mb-1">Tamanho de Sutiã</label>
            <select value={tamanhoSutia} onChange={e => setTamanhoSutia(e.target.value)} className="input-field">
              <option value="">Selecione...</option>
              {TAMANHO_SUTIA_OPCOES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-fiorella-gold mb-1">Tamanho de Calcinha</label>
            <select value={tamanhoCalcinha} onChange={e => setTamanhoCalcinha(e.target.value)} className="input-field">
              <option value="">Selecione...</option>
              {TAMANHO_CALCINHA_OPCOES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-fiorella-gold mb-1">Tamanho de Roupa</label>
            <select value={tamanhoRoupa} onChange={e => setTamanhoRoupa(e.target.value)} className="input-field">
              <option value="">Selecione...</option>
              {TAMANHO_ROUPA_OPCOES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-fiorella-gold mb-1">Observações (opcional)</label>
            <input
              type="text"
              placeholder='Ex: "prefiro peças mais soltas"'
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-4">
            <button type="submit" className="btn-primary">Salvar Medidas</button>
            {medidasSalvas && <span className="text-sm text-fiorella-gold">✓ Medidas salvas neste dispositivo.</span>}
          </div>
        </form>
      </div>

      <GuiaDeMedidas aberto={guiaAberto} onFechar={() => setGuiaAberto(false)} />

      <div>
        <h2 className="font-cormorant text-2xl text-white mb-6 flex items-center gap-2">
          <Package className="text-fiorella-gold" /> Meus Pedidos
        </h2>

        {pedidos.length === 0 ? (
          <div className="bg-fiorella-black-light border border-[#333] p-8 text-center rounded-sm">
            <p className="text-[#aaa] mb-4">Você ainda não fez nenhum pedido.</p>
            <button onClick={() => navigate('/catalogo')} className="btn-primary inline-flex">Ir para o Catálogo</button>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map(p => (
              <div key={p.id} className="bg-fiorella-black-lightest border border-[#333] p-6 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-white font-medium mb-1">Pedido #{p.numero}</p>
                  <p className="text-sm text-[#aaa]">{new Date(p.dataHora).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-fiorella-gold font-medium">R$ {Number(p.total).toFixed(2)}</p>
                  <p className="text-sm text-[#aaa]">{p.itens?.length} item(ns)</p>
                </div>
                <div>
                  <span className="bg-[#111] border border-fiorella-gold/30 text-fiorella-gold px-3 py-1 text-xs rounded-full uppercase tracking-wider">
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
