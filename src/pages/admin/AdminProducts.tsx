import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { getProdutos, addProduto, updateProduto, deleteProduto } from '../../services/firebaseService';
import { uploadFileToStorage } from '../../services/storageService';


const CATEGORIAS = ['Lingerie', 'Roupa', 'Produto Erótico', 'Acessório'];
const SUB_CATEGORIAS: Record<string, string[]> = {
  'Lingerie': ['Conjunto', 'Calcinha', 'Sutiã', 'Body', 'Camisola', 'Corselet', 'Meia-calça'],
  'Roupa': ['Vestido', 'Blusa', 'Short', 'Calça', 'Pijama', 'Kimono'],
  'Produto Erótico': ['Vibrador', 'Plug', 'Gel/Lubrificante', 'Óleo Sensual', 'Fantasia', 'Acessório Íntimo'],
  'Acessório': ['Perfume', 'Vela', 'Cinto', 'Máscara', 'Outro']
};
const CORES = ['Preto', 'Vermelho', 'Branco', 'Rosa', 'Nude', 'Verde', 'Azul', 'Lilás', 'Outros'];
const SABORES = ['Morango', 'Baunilha', 'Chocolate', 'Cereja', 'Menta', 'Sem sabor'];
const TAMANHOS = ['PP', 'P', 'M', 'G', 'GG', 'EGG', 'Único'];

const DEFAULT_UPLOAD_TIMEOUT_MS = 60000;

export const AdminProducts = () => {

  const [produtos, setProdutos] = useState<any[]>([]);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form State
  const [form, setForm] = useState<any>({
    id: '',
    nome: '',
    categoria: '',
    subCategoria: '',
    preco: '',
    precoPromocional: '',
    cores: [],
    sabores: [],
    tamanhos: [],
    estoque: 0,
    descricaoCurta: '',
    descricaoLonga: '',

    // URLs finais (Firestore)
    imagemPrincipal: '',
    imagensAdicionais: [],

    // Prévias locais (Base64) apenas para exibir no navegador
    imagemPrincipalPreview: '',
    imagensAdicionaisPreview: [],

    destaque: false,
    ativo: true
  });


  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProdutosFromFirebase();
  }, []);

  const loadProdutosFromFirebase = async () => {
    try {
      const data = await getProdutos();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setProdutos([]);
    }
  };

  const handleEdit = (p: any) => {
    setForm(p);
    setView('form');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProduto(id);
        await loadProdutosFromFirebase();
      } catch (error) {
        console.error('Erro ao deletar produto:', error);
      }
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações ANTES de setar loading para evitar ficar travado sem dados
    if (!form.nome.trim()) {
      setMessage({ type: 'error', text: '❌ Nome do produto é obrigatório' });
      return;
    }
    if (!form.categoria) {
      setMessage({ type: 'error', text: '❌ Categoria é obrigatória' });
      return;
    }
    if (!form.preco || Number(form.preco) <= 0) {
      setMessage({ type: 'error', text: '❌ Preço deve ser maior que 0' });
      return;
    }
    if (!form.estoque || Number(form.estoque) < 0) {
      setMessage({ type: 'error', text: '❌ Estoque inválido' });
      return;
    }

    if (!form.imagemPrincipalPreview && !form.imagemPrincipal) {
      setMessage({ type: 'error', text: '❌ Imagem principal é obrigatória' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const base64ToBlob = (base64: string) => {
      const parts = base64.split(',');
      const contentType = parts[0].match(/:(.*?);/)?.[1] || '';
      const byteString = atob(parts[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      return new Blob([ab], { type: contentType });
    };

    try {
      const withTimeout = async <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
        let timer: any;
        try {
          return await Promise.race([
            promise,
            new Promise<T>((_, reject) => {
              timer = setTimeout(() => reject(new Error(`Timeout ao fazer upload (${label}) após ${ms}ms`)), ms);
            })
          ]);
        } finally {
          if (timer) clearTimeout(timer);
        }
      };

      let imagemPrincipalUrl = form.imagemPrincipal;
      let imagensAdicionaisUrls = form.imagensAdicionais || [];

      // imagemPrincipalPreview vem do FileReader (Base64). Vamos apenas verificar se há preview.
      // Depois fazemos upload convertendo Base64 -> Blob para o Storage.

      if (form.imagemPrincipalPreview) {
        const blob = base64ToBlob(form.imagemPrincipalPreview);
        const storagePath = `produtos/${form.id || 'novo'}/imagemPrincipal-${Date.now()}.jpg`;
        // uploadFileToStorage aceita Blob/File
        imagemPrincipalUrl = await withTimeout(
          uploadFileToStorage(blob as Blob, storagePath),
          DEFAULT_UPLOAD_TIMEOUT_MS,
          'imagem principal'
        );
      }

      if (form.imagensAdicionaisPreview && form.imagensAdicionaisPreview.length > 0) {
        imagensAdicionaisUrls = await Promise.all(
          form.imagensAdicionaisPreview.map(async (imgBase64: string, i: number) => {
            const blob = base64ToBlob(imgBase64);
            const storagePath = `produtos/${form.id || 'novo'}/imagemAdicional-${i + 1}-${Date.now()}.jpg`;
            return withTimeout(
              uploadFileToStorage(blob as Blob, storagePath),
              DEFAULT_UPLOAD_TIMEOUT_MS,
              `imagem adicional ${i + 1}`
            );
          })
        );
      }




      // Validação básica
      if (!form.nome.trim()) {
        setMessage({ type: 'error', text: '❌ Nome do produto é obrigatório' });
        return;
      }
      if (!form.imagemPrincipalPreview && !imagemPrincipalUrl) {
        setMessage({ type: 'error', text: '❌ Imagem principal é obrigatória' });
        return;
      }
      if (!form.categoria) {
        setMessage({ type: 'error', text: '❌ Categoria é obrigatória' });
        return;
      }
      if (!form.preco || Number(form.preco) <= 0) {
        setMessage({ type: 'error', text: '❌ Preço deve ser maior que 0' });
        return;
      }
      if (!form.estoque || Number(form.estoque) < 0) {
        setMessage({ type: 'error', text: '❌ Estoque inválido' });
        return;
      }

      const saveObj = {
        nome: form.nome,
        categoria: form.categoria,
        subCategoria: form.subCategoria,
        preco: Number(form.preco),
        precoPromocional: form.precoPromocional ? Number(form.precoPromocional) : null,
        cores: form.cores || [],
        sabores: form.sabores || [],
        tamanhos: form.tamanhos || [],
        estoque: Number(form.estoque),
        descricaoCurta: form.descricaoCurta,
        descricaoLonga: form.descricaoLonga,

        imagemPrincipal: imagemPrincipalUrl,
        imagensAdicionais: imagensAdicionaisUrls || [],

        destaque: form.destaque,
        ativo: form.ativo
      };

      if (form.id) {
        await updateProduto(form.id, saveObj);
        setMessage({ type: 'success', text: '✅ Produto atualizado com sucesso!' });
      } else {
        await addProduto(saveObj);
        setMessage({ type: 'success', text: '✅ Produto criado com sucesso!' });
      }

      setTimeout(() => {
        setForm({
          id: '', nome: '', categoria: '', subCategoria: '',
          preco: '', precoPromocional: '',
          cores: [], sabores: [], tamanhos: [],
          estoque: 0, descricaoCurta: '', descricaoLonga: '',
          imagemPrincipal: '', imagensAdicionais: [],
          imagemPrincipalPreview: '',
          imagensAdicionaisPreview: [],
          destaque: false, ativo: true
        });
        setView('list');
        loadProdutosFromFirebase();
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
      setMessage({ type: 'error', text: `❌ Erro: ${error?.message || 'Não foi possível salvar o produto'}` });
    } finally {
      setLoading(false);
    }

    return;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({
        ...form,
        imagemPrincipalPreview: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleAdditionalImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);

    fileList.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev: any) => ({
          ...prev,
          imagensAdicionaisPreview: [...(prev.imagensAdicionaisPreview || []), reader.result as string],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAdditionalImage = (index: number) => {
    setForm((prev: any) => ({
      ...prev,
      imagensAdicionaisPreview: (prev.imagensAdicionaisPreview || []).filter((_: any, i: number) => i !== index),
    }));
  };


  const toggleArrayItem = (field: 'cores' | 'sabores' | 'tamanhos', value: string) => {
    const current = form[field] || [];
    if (current.includes(value)) {
      setForm({ ...form, [field]: current.filter((v: string) => v !== value) });
    } else {
      setForm({ ...form, [field]: [...current, value] });
    }
  };

  const filtered = produtos.filter(p => 
    p.nome.toLowerCase().includes(search.toLowerCase()) && 
    (catFilter ? p.categoria === catFilter : true)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-cormorant text-3xl text-fiorella-gold">Produtos</h1>
        {view === 'list' ? (
          <button onClick={() => {
            setForm({ id: '', nome: '', categoria: CATEGORIAS[0], subCategoria: '', preco: '', precoPromocional: '', cores: [], sabores: [], tamanhos: [], estoque: 0, descricaoCurta: '', descricaoLonga: '', imagemPrincipal: '', imagensAdicionais: [], destaque: false, ativo: true });
            setView('form');
          }} className="btn-primary"><Plus size={18} /> Novo Produto</button>
        ) : (
          <button onClick={() => setView('list')} className="btn-secondary"><X size={18} /> Voltar</button>
        )}
      </div>

      {view === 'list' && (
        <div className="bg-fiorella-black-lightest border border-[#333] rounded-sm p-4">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-[#666]" size={18} />
              <input type="text" placeholder="Buscar por nome..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
            </div>
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="input-field w-48">
              <option value="">Todas Categorias</option>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#333] text-fiorella-gold text-sm uppercase tracking-wide">
                  <th className="p-3">Img</th>
                  <th className="p-3">Nome</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Preço</th>
                  <th className="p-3">Estoque</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-[#222] hover:bg-[#1a1a1a]">
                    <td className="p-3"><img src={p.imagemPrincipal || 'https://via.placeholder.com/50'} alt={p.nome} className="w-10 h-10 object-cover rounded-sm" /></td>
                    <td className="p-3 text-white truncate max-w-[200px]">{p.nome}</td>
                    <td className="p-3 text-[#aaa]">{p.categoria}</td>
                    <td className="p-3 text-[#aaa]">R$ {Number(p.preco).toFixed(2)}</td>
                    <td className="p-3 text-[#aaa]">{p.estoque}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-sm ${p.ativo ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleEdit(p)} className="text-fiorella-gold hover:text-white mr-3"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(p.id)} className="text-fiorella-red hover:text-red-400"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-[#666]">Nenhum produto encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'form' && (
        <form onSubmit={saveProduct} className="bg-fiorella-black-lightest border border-[#333] rounded-sm p-6 space-y-6">
          {message && (
            <div className={`p-4 rounded-sm text-center font-bold text-lg ${
              message.type === 'success' 
                ? 'bg-green-900/50 border border-green-900 text-green-300' 
                : 'bg-red-900/50 border border-red-900 text-red-300'
            }`}>
              {message.text}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-fiorella-gold mb-1">Nome do Produto *</label>
              <input required type="text" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-fiorella-gold mb-1">Imagem Principal *</label>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="input-field" />
              {form.imagemPrincipalPreview && <img src={form.imagemPrincipalPreview} alt="Preview" className="mt-2 h-20 object-cover rounded-sm" />}
            </div>

          </div>

          <div>
            <label className="block text-sm text-fiorella-gold mb-2">Imagens Adicionais (múltiplas)</label>
            <input type="file" onChange={handleAdditionalImagesUpload} accept="image/*" multiple className="input-field" />
            {form.imagensAdicionaisPreview && form.imagensAdicionaisPreview.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-[#aaa] mb-3">{form.imagensAdicionaisPreview.length} imagem(ns) adicionada(s):</p>
                <div className="flex flex-wrap gap-3">
                  {form.imagensAdicionaisPreview.map((img: string, idx: number) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt={`Adicional ${idx + 1}`} className="h-20 w-20 object-cover rounded-sm" />

                      <button 
                        type="button" 
                        onClick={() => removeAdditionalImage(idx)} 
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-fiorella-gold mb-1">Categoria *</label>
              <select required value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value, subCategoria: ''})} className="input-field">
                <option value="">Selecione...</option>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-fiorella-gold mb-1">Sub-categoria</label>
              <select value={form.subCategoria} onChange={e => setForm({...form, subCategoria: e.target.value})} className="input-field">
                <option value="">Selecione...</option>
                {form.categoria && SUB_CATEGORIAS[form.categoria]?.map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-fiorella-gold mb-1">Preço (R$) *</label>
              <input required type="number" step="0.01" value={form.preco} onChange={e => setForm({...form, preco: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-fiorella-gold mb-1">Preço Promo (R$)</label>
              <input type="number" step="0.01" value={form.precoPromocional || ''} onChange={e => setForm({...form, precoPromocional: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-fiorella-gold mb-1">Estoque *</label>
              <input required type="number" value={form.estoque} onChange={e => setForm({...form, estoque: e.target.value})} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-fiorella-gold mb-2">Cores</label>
            <div className="flex flex-wrap gap-2">
              {CORES.map(c => (
                <label key={c} className="flex items-center gap-1 text-sm text-[#aaa]">
                  <input type="checkbox" checked={(form.cores||[]).includes(c)} onChange={() => toggleArrayItem('cores', c)} /> {c}
                </label>
              ))}
            </div>
          </div>

          {(form.categoria === 'Lingerie' || form.categoria === 'Roupa') && (
            <div>
              <label className="block text-sm text-fiorella-gold mb-2">Tamanhos</label>
              <div className="flex flex-wrap gap-2">
                {TAMANHOS.map(c => (
                  <label key={c} className="flex items-center gap-1 text-sm text-[#aaa]">
                    <input type="checkbox" checked={(form.tamanhos||[]).includes(c)} onChange={() => toggleArrayItem('tamanhos', c)} /> {c}
                  </label>
                ))}
              </div>
            </div>
          )}

          {form.categoria === 'Produto Erótico' && (
            <div>
              <label className="block text-sm text-fiorella-gold mb-2">Sabores</label>
              <div className="flex flex-wrap gap-2">
                {SABORES.map(c => (
                  <label key={c} className="flex items-center gap-1 text-sm text-[#aaa]">
                    <input type="checkbox" checked={(form.sabores||[]).includes(c)} onChange={() => toggleArrayItem('sabores', c)} /> {c}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-fiorella-gold mb-1">Descrição Curta (Vitrine)</label>
            <textarea maxLength={150} value={form.descricaoCurta} onChange={e => setForm({...form, descricaoCurta: e.target.value})} className="input-field h-20"></textarea>
          </div>

          <div>
            <label className="block text-sm text-fiorella-gold mb-1">Descrição Longa (Página Produto)</label>
            <textarea value={form.descricaoLonga} onChange={e => setForm({...form, descricaoLonga: e.target.value})} className="input-field h-32"></textarea>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-white">
              <input type="checkbox" checked={form.destaque} onChange={e => setForm({...form, destaque: e.target.checked})} className="w-4 h-4 accent-fiorella-gold" />
              Destaque na Home
            </label>
            <label className="flex items-center gap-2 text-sm text-white">
              <input type="checkbox" checked={form.ativo} onChange={e => setForm({...form, ativo: e.target.checked})} className="w-4 h-4 accent-fiorella-gold" />
              Produto Ativo
            </label>
          </div>

          <div className="pt-4 border-t border-[#333]">
            <button type="submit" disabled={loading} className={`btn-primary w-full md:w-auto ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {loading ? 'Salvando...' : 'Salvar Produto'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
