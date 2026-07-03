// Tabela de referência estática para a numeração de lingerie brasileira.
// Não tem nenhuma lógica — é só dado de apoio exibido no tooltip/modal
// "Como calculamos isso?" (item 5 do pedido: mercado de lingerie varia
// entre marcas nacionais, então uma tabela de conversão rápida ajuda a
// cliente a confiar no número que ela mesma cadastrou).

export interface LinhaConversaoBanda {
  banda: string;
  cintoCm: string; // faixa aproximada de medida embaixo do busto, em cm
}

export const CONVERSAO_BANDA: LinhaConversaoBanda[] = [
  { banda: '34', cintoCm: '73–77 cm' },
  { banda: '36', cintoCm: '78–82 cm' },
  { banda: '38', cintoCm: '83–87 cm' },
  { banda: '40', cintoCm: '88–92 cm' },
  { banda: '42', cintoCm: '93–97 cm' },
  { banda: '44', cintoCm: '98–102 cm' },
  { banda: '46', cintoCm: '103–107 cm' },
  { banda: '48', cintoCm: '108–112 cm' },
];

export interface LinhaConversaoAro {
  aro: string;
  diferencaBustoCm: string; // diferença aproximada entre busto e banda, em cm
}

export const CONVERSAO_ARO: LinhaConversaoAro[] = [
  { aro: 'A', diferencaBustoCm: '10–12 cm' },
  { aro: 'B', diferencaBustoCm: '13–15 cm' },
  { aro: 'C', diferencaBustoCm: '16–18 cm' },
  { aro: 'D', diferencaBustoCm: '19–21 cm' },
  { aro: 'DD', diferencaBustoCm: '22–24 cm' },
  { aro: 'E', diferencaBustoCm: '25–27 cm' },
];

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
