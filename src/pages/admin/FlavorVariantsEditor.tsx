import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export type VarianteSabor = {
  id: string;
  sabor: string;
  estoque: number;
};

type Props = {
  variantes: VarianteSabor[];
  saboresDisponiveis: string[];
  onChange: (v: VarianteSabor[]) => void;
};

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const FlavorVariantsEditor = ({ variantes, saboresDisponiveis, onChange }: Props) => {
  const [novoSabor, setNovoSabor] = useState('');
  const [novoSaborInput, setNovoSaborInput] = useState('');
  const [saboresExtras, setSaboresExtras] = useState<string[]>([]);

  const todosSabores = [...saboresDisponiveis, ...saboresExtras];

  const adicionarVariante = () => {
    if (!novoSabor) return;
    onChange([
      ...variantes,
      { id: uid(), sabor: novoSabor, estoque: 0 },
    ]);
    setNovoSabor('');
  };

  const removerVariante = (id: string) => {
    onChange(variantes.filter(v => v.id !== id));
  };

  const atualizarVariante = (id: string, campo: keyof VarianteSabor, valor: any) => {
    onChange(
      variantes.map(v => (v.id === id ? { ...v, [campo]: valor } : v))
    );
  };

  const adicionarSabor = () => {
    const v = novoSaborInput.trim();
    if (!v) return;
    if (todosSabores.some(s => s.toLowerCase() === v.toLowerCase())) {
      setNovoSabor(v);
      setNovoSaborInput('');
      return;
    }
    setSaboresExtras([...saboresExtras, v]);
    setNovoSabor(v);
    setNovoSaborInput('');
  };

  return (
    <div className="space-y-4 border border-[#333] rounded-sm p-4 bg-[#0d0d0d]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-fiorella-gold font-bold uppercase tracking-wider">
          Variantes de Sabor (Sabor + Estoque)
        </h3>
        <span className="text-xs text-[#888]">
          {variantes.length} variante{variantes.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-xs text-[#aaa] mb-1">Sabor</label>
          <select
            value={novoSabor}
            onChange={e => setNovoSabor(e.target.value)}
            className="input-field"
          >
            <option value="">Selecione...</option>
            {todosSabores.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex gap-1 mt-1">
            <input
              type="text"
              placeholder="Novo sabor..."
              value={novoSaborInput}
              onChange={e => setNovoSaborInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); adicionarSabor(); } }}
              className="input-field text-xs py-1"
            />
            <button
              type="button"
              onClick={adicionarSabor}
              className="px-2 bg-fiorella-gold text-black rounded-sm hover:bg-yellow-500"
              title="Adicionar novo sabor"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="text-xs text-[#666] italic">
          Estoque será definido após adicionar.
        </div>

        <button
          type="button"
          onClick={adicionarVariante}
          disabled={!novoSabor}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={16} /> Adicionar Variante
        </button>
      </div>

      {variantes.length > 0 ? (
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs text-[#888] uppercase tracking-wider px-1">
            <div className="col-span-1">#</div>
            <div className="col-span-6">Sabor</div>
            <div className="col-span-4">Estoque</div>
            <div className="col-span-1 text-right">Remover</div>
          </div>
          {variantes.map((v, idx) => (
            <div key={v.id} className="grid grid-cols-12 gap-2 items-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-sm p-2">
              <div className="col-span-1 text-[#888] text-sm">{idx + 1}</div>
              <div className="col-span-6">
                <select
                  value={v.sabor}
                  onChange={e => atualizarVariante(v.id, 'sabor', e.target.value)}
                  className="input-field text-sm py-1"
                >
                  <option value="">Sem sabor</option>
                  {todosSabores.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-4">
                <input
                  type="number"
                  min="0"
                  value={v.estoque}
                  onChange={e => atualizarVariante(v.id, 'estoque', Number(e.target.value))}
                  className="input-field text-sm py-1"
                />
              </div>
              <div className="col-span-1 text-right">
                <button
                  type="button"
                  onClick={() => removerVariante(v.id)}
                  className="text-red-500 hover:text-red-300 p-1"
                  title="Remover variante"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[#666] italic text-center py-3">
          Nenhuma variante adicionada. Selecione um sabor e clique em "Adicionar Variante".
        </p>
      )}
    </div>
  );
};
