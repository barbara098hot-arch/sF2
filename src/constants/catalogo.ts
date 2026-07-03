// Constantes centrais de categorização de produtos.
// Antes, CATEGORIAS/SUB_CATEGORIAS/CORES/SABORES/TAMANHOS viviam duplicadas
// dentro de AdminProducts.tsx (e Catalog.tsx tinha sua própria cópia hardcoded
// da lista de categorias). Centralizar aqui evita as duas listas saírem de sincronia.

export const CATEGORIAS = ['Lingerie', 'Roupa', 'Produto Erótico', 'Acessório'];

// Subcategorias de "Lingerie" reorganizadas para refletir o tipo de peça
// (Sutiã/Calcinha/Camisola/Conjunto), que por sua vez orienta o motor de
// compatibilidade de tamanhos (ver src/utils/compatibilidade.ts).
export const SUB_CATEGORIAS: Record<string, string[]> = {
  'Lingerie': ['Sutiã', 'Calcinha', 'Camisola', 'Conjunto', 'Body', 'Corselet', 'Meia-calça'],
  'Roupa': ['Vestido', 'Blusa', 'Short', 'Calça', 'Pijama', 'Kimono'],
  'Produto Erótico': ['Vibrador', 'Plug', 'Gel/Lubrificante', 'Óleo Sensual', 'Fantasia', 'Acessório Íntimo'],
  'Acessório': ['Perfume', 'Vela', 'Cinto', 'Máscara', 'Outro']
};

// Características (tags) específicas de cada subcategoria de Lingerie.
// Não são exclusivas entre si — um produto pode ter várias ao mesmo tempo
// (ex: "Com bojo" + "Renda") e o Catálogo filtra por elas em modo E (AND).
// Também são usadas como modificador de tolerância no motor de compatibilidade.
export const CARACTERISTICAS_POR_SUBCATEGORIA: Record<string, string[]> = {
  'Sutiã': ['Com bojo', 'Sem bojo', 'Push-up', 'Renda', 'Sem alça'],
  'Calcinha': ['Fio', 'Boyshort', 'Hotpant', 'Tanga'],
  'Camisola': ['Curta', 'Longa', 'Robe'],
  'Conjunto': [],
};

export const CORES = ['Preto', 'Vermelho', 'Branco', 'Rosa', 'Nude', 'Verde', 'Azul', 'Lilás', 'Outros'];
export const SABORES = ['Morango', 'Baunilha', 'Chocolate', 'Cereja', 'Menta', 'Sem sabor'];
export const TAMANHOS = ['PP', 'P', 'M', 'G', 'GG', 'EGG', 'Único'];

// Numerações de banda de sutiã que o ADM pode marcar por produto.
export const NUMERACOES_SUTIA = ['34', '36', '38', '40', '42', '44', '46', '48'];

export const ELASTICIDADE_OPCOES = [
  { value: 'nenhuma', label: 'Nenhuma' },
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
] as const;

export const CAIMENTO_OPCOES = [
  { value: 'justo', label: 'Justo' },
  { value: 'regular', label: 'Regular' },
  { value: 'solto', label: 'Solto' },
] as const;
