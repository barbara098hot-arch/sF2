import { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';

/**
 * Estrutura de cada variante do produto:
 *  - id: identificador local (gerado na hora)
 *  - cor: cor selecionada (ou vazia)
 *  - tamanho: tamanho selecionado (ou vazio)
 *  - estoque: quantidade em estoque para essa combinacao
 */
export type Variante = {
  id: string;
  cor: string;
  tamanho: string;
  estoque: number;
};

type Props = {
  variantes: Variante[];
  coresDisponiveis: string[];
  tamanhosDisponiveis: string[];
  onChange: (v: Variante[]) => void;
};

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const VariantsEditor = ({ variantes, coresDisponiveis, tamanhosDisponiveis, onChange }: Props) => {
  const [novaCor, setNovaCor] = useState('');
  const [novoTamanho, setNovoTamanho] = useState('');

  const [corNovaInput, setCorNovaInput] = useState('');
  const [tamNovoInput, setTamNovoInput] = useState('');

  // Listas que serao usadas nos selects (merge entre as pre-definidas e as
  // personalizadas adicionadas pelo admin nesta sessao)
  const [coresExtras, setCoresExtras] = useState<string[]>([]);
  const [tamanhosExtras, setTamanhosExtras] = useState<string[]>([]);

  const todasCores = [...coresDisponiveis, ...coresExtras];
  const todosTamanhos = [...tamanhosDisponiveis, ...tamanhosExtras];

  const adicionarVariante = () => {
    onChange([
      ...variantes,
      { id: uid(), cor: novaCor, tamanho: novoTamanho, estoque: 0 },
    ]);
    setNovaCor('');
    setNovoTamanho('');
  };

  const removerVariante = (id: string) => {
    onChange(variantes.filter(v => v.id !== id));
  };

  const atualizarVariante = (id: string, campo: keyof Variante, valor: any) => {
    onChange(
      variantes.map(v => (v.id === id ? { ...v, [campo]: valor } : v))
    );
  };

  const adicionarCor = () => {
    const v = corNovaInput.trim();
    if (!v) return;
    if (todasCores.some(c => c.toLowerCase() === v.toLowerCase())) {
      setNovaCor(v);
      setCorNovaInput('');
      return;
    }
    setCoresExtras([...coresExtras, v]);
    setNovaCor(v);
    setCorNovaInput('');
  };

  const adicionarTamanho = () => {
    const v = tamNovoInput.trim();
    if (!v) return;
    if (todosTamanhos.some(t => t.toLowerCase() === v.toLowerCase())) {
      setNovoTamanho(v);
      setTamNovoInput('');
      return;
    }
    setTamanhosExtras([...tamanhosExtras, v]);
    setNovoTamanho(v);
    setTamNovoInput('');
  };

  return (
    <div className="space-y-4 border border-[#333] rounded-sm p-4 bg-[#0d0d0d]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-fiorella-gold font-bold uppercase tracking-wider">
          Variantes (Cor + Tamanho + Estoque)
        </h3>
        <span className="text-xs text-[#888]">
          {variantes.length} variante{variantes.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Adicionar nova variante */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs text-[#aaa] mb-1">Cor</label>
          <select
            value={novaCor}
            onChange={e => setNovaCor(e.target.value)}
            className="input-field"
          >
            <option value="">Selecione...</option>
            {todasCores.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-1 mt-1">
            <input
              type="text"
              placeholder="Nova cor..."
              value={corNovaInput}
              onChange={e => setCorNovaInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); adicionarCor(); } }}
              className="input-field text-xs py-1"
            />
            <button
              type="button"
              onClick={adicionarCor}
              className="px-2 bg-fiorella-gold text-black rounded-sm hover:bg-yellow-500"
              title="Adicionar nova cor"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#aaa] mb-1">Tamanho</label>
          <select
            value={novoTamanho}
            onChange={e => setNovoTamanho(e.target.value)}
            className="input-field"
          >
            <option value="">Selecione...</option>
            {todosTamanhos.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="flex gap-1 mt-1">
            <input
              type="text"
              placeholder="Novo tamanho..."
              value={tamNovoInput}
              onChange={e => setTamNovoInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); adicionarTamanho(); } }}
              className="input-field text-xs py-1"
            />
            <button
              type="button"
              onClick={adicionarTamanho}
              className="px-2 bg-fiorella-gold text-black rounded-sm hover:bg-yellow-500"
              title="Adicionar novo tamanho"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs text-[#aaa] mb-1">Estoque</label>
          <input
            type="number"
            min="0"
            value={0}
            disabled
            placeholder="(definido na lista)"
            className="input-field opacity-60 cursor-not-allowed"
          />
        </div>

        <button
          type="button"
          onClick={adicionarVariante}
          disabled={!novaCor}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={16} /> Adicionar Variante
        </button>
      </div>

      {/* Lista de variantes adicionadas */}
      {variantes.length > 0 ? (
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs text-[#888] uppercase tracking-wider px-1">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Cor</div>
            <div className="col-span-3">Tamanho</div>
            <div className="col-span-3">Estoque</div>
            <div className="col-span-1 text-right">Remover</div>
          </div>
          {variantes.map((v, idx) => (
            <div key={v.id} className="grid grid-cols-12 gap-2 items-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-sm p-2">
              <div className="col-span-1 text-[#888] text-sm">{idx + 1}</div>

              <div className="col-span-4">
                <select
                  value={v.cor}
                  onChange={e => atualizarVariante(v.id, 'cor', e.target.value)}
                  className="input-field text-sm py-1"
                >
                  <option value="">Sem cor</option>
                  {todasCores.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="col-span-3">
                <select
                  value={v.tamanho}
                  onChange={e => atualizarVariante(v.id, 'tamanho', e.target.value)}
                  className="input-field text-sm py-1"
                >
                  <option value="">Sem tamanho</option>
                  {todosTamanhos.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="col-span-3">
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
          Nenhuma variante adicionada. Use os campos acima para criar uma combinacao de cor + tamanho + estoque.
        </p>
      )}
    </div>
  );
};
