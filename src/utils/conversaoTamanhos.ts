// Tabela de referência estática para a numeração de lingerie brasileira.
// Não tem nenhuma lógica — é só dado de apoio exibido no tooltip/modal
// "Como calculamos isso?" (item 5 do pedido: mercado de lingerie varia
// entre marcas nacionais, então uma tabela de conversão rápida ajuda a
// cliente a confiar no número que ela mesma cadastrou).

import { NUMERACOES_SUTIA, LABEL_NUMERACAO_SUTIA } from '../constants/catalogo';

export interface LinhaConversaoSutia {
  numero: string;
  equivalencia: string;
}

// Numeração brasileira de sutiã (38 a 54) com a equivalência aproximada em
// P/M/G/GG/Plus Size usada pelo varejo nacional.
export const CONVERSAO_SUTIA: LinhaConversaoSutia[] = NUMERACOES_SUTIA.map(numero => ({
  numero,
  equivalencia: LABEL_NUMERACAO_SUTIA[numero] || numero,
}));

export interface LinhaConversaoGeral {
  tamanho: string;
  equivalencia: string;
}

// Conversão aproximada de P/M/G/GG para calcinha/roupa em geral — varia
// bastante entre marcas, por isso a coluna já nasce como texto "aproximado".
export const CONVERSAO_GERAL: LinhaConversaoGeral[] = [
  { tamanho: 'PP', equivalencia: '34–36 (aprox.)' },
  { tamanho: 'P', equivalencia: '38–40 (aprox.)' },
  { tamanho: 'M', equivalencia: '42–44 (aprox.)' },
  { tamanho: 'G', equivalencia: '46–48 (aprox.)' },
  { tamanho: 'GG', equivalencia: '50–52 (aprox.)' },
  { tamanho: 'XG', equivalencia: '54+ (aprox.)' },
];
