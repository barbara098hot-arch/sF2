// Tipos compartilhados pelo Sistema de Compatibilidade de Tamanhos.
// Primeiro arquivo de tipos central do projeto: o produto em si continua
// tratado como `any` no restante do código (não é o foco desta feature),
// mas a engine de compatibilidade e os componentes de UI que ela alimenta
// precisam de contratos estáveis.

export type TamanhoRoupa = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XG';
export type TamanhoCalcinha = 'P' | 'M' | 'G' | 'GG';

export interface MedidasCliente {
  tamanhoSutia: string; // formato "42B": banda (34-48, de 2 em 2) + aro (A-E)
  tamanhoCalcinha: TamanhoCalcinha;
  tamanhoRoupa: TamanhoRoupa;
  observacoes?: string;
  atualizadoEm: string; // ISO date
}

export type StatusCompatibilidade = 'serve' | 'ajustado' | 'nao_serve' | 'parcial';

export interface ResultadoParcial {
  status: StatusCompatibilidade;
  mensagem: string;
}

export interface ResultadoCompatibilidade {
  status: StatusCompatibilidade;
  mensagem: string;
  detalhes?: {
    sutia?: ResultadoParcial;
    calcinha?: ResultadoParcial;
  };
}

export type RecomendaTamanho = 'normal' | 'acima' | 'abaixo';
export type StatusAvaliacao = 'pendente' | 'aprovada' | 'rejeitada';

export interface Avaliacao {
  id?: string;
  produtoId: string;
  usuarioId?: string;
  nomeCliente: string;
  nota: 1 | 2 | 3 | 4 | 5;
  comentario: string;
  tamanhoComprado: string;
  recomendaTamanho: RecomendaTamanho;
  fotoCliente?: string;
  consentimentoFoto: boolean;
  status: StatusAvaliacao;
  dataCriacao?: string;
}
