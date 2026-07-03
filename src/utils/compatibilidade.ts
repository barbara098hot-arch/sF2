import { getStorage } from './localStorage';
import { NUMERACOES_SUTIA } from '../constants/catalogo';
import type { Avaliacao, MedidasCliente, ResultadoCompatibilidade, ResultadoParcial, StatusCompatibilidade } from '../types/compatibilidade';

/**
 * MOTOR DE COMPATIBILIDADE DE TAMANHOS
 * ------------------------------------
 * Não é um provador 3D: é uma comparação baseada em regras entre o que a
 * cliente informou (`MedidasCliente`) e o que o ADM cadastrou por produto
 * (numeração, elasticidade, caimento, características). Tudo aqui é
 * determinístico e comentado propositalmente, para dar pra ajustar as
 * regras (as escalas, os pesos dos modificadores) sem reescrever a engine.
 *
 * IDEIA GERAL: cada dimensão de tamanho (numeração de sutiã, tamanho de
 * calcinha, tamanho de roupa em geral) é uma escala ordinal (um array
 * ordenado). Calculamos a "distância" entre o tamanho da cliente e o(s)
 * tamanho(s) que o produto tem disponível nessa escala:
 *   distância 0       -> tamanho bate exato          -> "serve"
 *   0 < distância <= tolerância -> tamanho é vizinho  -> "ajustado"
 *   distância > tolerância      -> tamanho está longe -> "nao_serve"
 * A "tolerância" começa em 0 e sobe/desce conforme elasticidade do tecido,
 * caimento da peça e características (bojo, renda, fio etc.) — uma peça
 * mais elástica/solta tolera mais diferença de tamanho que uma peça
 * estruturada/justa.
 */

// ----- Escalas ordinais -----------------------------------------------

const SUTIA_ORDEM = NUMERACOES_SUTIA; // numeração brasileira (38 a 54)
const CALCINHA_ORDEM = ['P', 'M', 'G', 'GG'];
const ROUPA_ORDEM = ['PP', 'P', 'M', 'G', 'GG', 'XG'];

// ----- Helper de distância -----------------------------------------------

function distanciaMinima(indiceCliente: number, indicesProduto: number[]): number | null {
  if (indiceCliente < 0 || indicesProduto.length === 0) return null;
  return Math.min(...indicesProduto.map(i => Math.abs(i - indiceCliente)));
}

// ----- Modificadores de tolerância --------------------------------------

interface OpcoesCompatibilidade {
  jaComprou?: boolean;
  avaliacoesAprovadas?: Avaliacao[];
}

function calcularTolerancia(produto: any, opts?: OpcoesCompatibilidade): number {
  let tolerancia = 0;

  const elasticidade = produto?.elasticidade || 'media';
  if (elasticidade === 'alta') tolerancia += 1;

  const caimento = produto?.caimento || 'regular';
  if (caimento === 'solto') tolerancia += 1;
  if (caimento === 'justo') tolerancia -= 1;

  const caracteristicas: string[] = produto?.caracteristicas || [];
  const temAlguma = (tags: string[]) => tags.some(t => caracteristicas.includes(t));
  if (temAlguma(['Sem bojo', 'Sem alça'])) tolerancia += 1; // peça mais flexível, sem estrutura rígida
  if (temAlguma(['Push-up', 'Com bojo'])) tolerancia -= 1; // peça estruturada, modelagem mais rígida
  if (temAlguma(['Fio', 'Tanga'])) tolerancia -= 1; // pouca cobertura, erro de tamanho aparece mais
  if (temAlguma(['Boyshort', 'Hotpant'])) tolerancia += 1; // corte mais coberto/folgado por natureza
  if (temAlguma(['Robe'])) tolerancia += 1; // peça de caimento solto por definição

  // Sinal de confiança silencioso (item 5 do pedido): se a cliente já
  // comprou este mesmo produto antes e não há registro de troca, isso é
  // um indício de que o tamanho dela funciona nessa peça específica.
  // Nunca aparece na mensagem — só relaxa a tolerância.
  if (opts?.jaComprou) tolerancia += 1;

  return Math.max(0, Math.min(2, tolerancia));
}

function classificar(distancia: number, tolerancia: number): StatusCompatibilidade {
  if (distancia === 0) return 'serve';
  if (distancia <= tolerancia) return 'ajustado';
  return 'nao_serve';
}

// ----- Avaliação por peça ------------------------------------------------

function avaliarSutia(medidas: MedidasCliente, produto: any, opts?: OpcoesCompatibilidade): ResultadoParcial {
  return avaliarEscalaSimples(medidas.tamanhoSutia, SUTIA_ORDEM, produto?.numeracaoSutia || [], produto, opts, {
    serve: 'O sutiã deve servir bem na sua numeração.',
    ajustado: 'O sutiã pode ficar um pouco justo ou folgado nessa numeração.',
    nao_serve: 'Essa numeração de sutiã provavelmente não é a ideal para você.',
    parcial: 'Este produto ainda não tem numeração de sutiã cadastrada para comparar.',
  });
}

function avaliarEscalaSimples(
  tamanhoCliente: string,
  escala: string[],
  tamanhosProduto: string[],
  produto: any,
  opts: OpcoesCompatibilidade | undefined,
  mensagens: Record<StatusCompatibilidade, string>
): ResultadoParcial {
  if (!tamanhosProduto || tamanhosProduto.length === 0) {
    return { status: 'parcial', mensagem: mensagens.parcial };
  }
  const idxCliente = escala.indexOf(tamanhoCliente);
  const indicesProduto = tamanhosProduto.map(t => escala.indexOf(t)).filter(i => i >= 0);
  const distancia = distanciaMinima(idxCliente, indicesProduto);
  if (distancia === null) {
    return { status: 'parcial', mensagem: mensagens.parcial };
  }
  const tolerancia = calcularTolerancia(produto, opts);
  const status = classificar(distancia, tolerancia);
  return { status, mensagem: mensagens[status] };
}

function avaliarCalcinha(medidas: MedidasCliente, produto: any, opts?: OpcoesCompatibilidade): ResultadoParcial {
  return avaliarEscalaSimples(medidas.tamanhoCalcinha, CALCINHA_ORDEM, produto?.tamanhos || [], produto, opts, {
    serve: 'A calcinha deve servir bem no seu tamanho.',
    ajustado: 'A calcinha pode ficar um pouco justa ou folgada nesse tamanho.',
    nao_serve: 'Esse tamanho de calcinha provavelmente não é o ideal para você.',
    parcial: 'Este produto ainda não tem tamanhos cadastrados para comparar.',
  });
}

function avaliarRoupaGenerica(medidas: MedidasCliente, produto: any, opts?: OpcoesCompatibilidade): ResultadoParcial {
  return avaliarEscalaSimples(medidas.tamanhoRoupa, ROUPA_ORDEM, produto?.tamanhos || [], produto, opts, {
    serve: 'Essa peça deve servir bem no seu tamanho.',
    ajustado: 'Essa peça pode ficar um pouco justa ou folgada nesse tamanho.',
    nao_serve: 'Esse tamanho provavelmente não é o ideal para você nessa peça.',
    parcial: 'Este produto ainda não tem tamanhos cadastrados para comparar.',
  });
}

// ----- Combinação para "Conjunto" (sutiã + calcinha) --------------------

const DESCRICAO_STATUS: Record<StatusCompatibilidade, string> = {
  serve: 'deve servir bem',
  ajustado: 'pode ajustar (ficar justo ou folgado)',
  nao_serve: 'provavelmente não serve bem',
  parcial: 'não tem dados suficientes para avaliar',
};

function avaliarConjunto(medidas: MedidasCliente, produto: any, opts?: OpcoesCompatibilidade): ResultadoCompatibilidade {
  const sutia = avaliarSutia(medidas, produto, opts);
  const calcinha = avaliarCalcinha(medidas, produto, opts);

  if (sutia.status === calcinha.status) {
    const mensagensUnificadas: Record<StatusCompatibilidade, string> = {
      serve: 'Esse conjunto deve servir bem no seu tamanho.',
      ajustado: 'Esse conjunto pode ajustar um pouco, mas deve servir.',
      nao_serve: 'Esse conjunto provavelmente não serve bem no seu tamanho.',
      parcial: 'Não temos dados suficientes para avaliar esse conjunto.',
    };
    return { status: sutia.status, mensagem: mensagensUnificadas[sutia.status], detalhes: { sutia, calcinha } };
  }

  // As duas peças do conjunto deram resultados diferentes — tratamento
  // explícito pedido para conjuntos: mensagem separada por peça, status
  // final "parcial" (nem "serve" redondo, nem "não serve" redondo).
  return {
    status: 'parcial',
    mensagem: `A calcinha ${DESCRICAO_STATUS[calcinha.status]}, e o sutiã ${DESCRICAO_STATUS[sutia.status]} nessa numeração.`,
    detalhes: { sutia, calcinha },
  };
}

// ----- Reforço por avaliações de outras clientes (item 8) ---------------

/**
 * Nunca muda o status calculado pela engine — só acrescenta uma frase de
 * confiança quando o resultado já é favorável ("serve"/"ajustado") e há
 * avaliações suficientes concordando. Uma incompatibilidade real nunca é
 * escondida por opiniões de terceiros.
 */
function reforcarComAvaliacoes(resultado: ResultadoCompatibilidade, avaliacoes?: Avaliacao[]): ResultadoCompatibilidade {
  if (!avaliacoes || avaliacoes.length === 0) return resultado;
  if (resultado.status !== 'serve' && resultado.status !== 'ajustado') return resultado;

  const comOpiniao = avaliacoes.filter(a => !!a.recomendaTamanho);
  if (comOpiniao.length < 3) return resultado;

  const normais = comOpiniao.filter(a => a.recomendaTamanho === 'normal').length;
  const percentual = normais / comOpiniao.length;
  if (percentual < 0.7) return resultado;

  const percentualTexto = Math.round(percentual * 100);
  return {
    ...resultado,
    mensagem: `${resultado.mensagem} ${percentualTexto}% das clientes que avaliaram disseram que o tamanho veio como esperado.`,
  };
}

// ----- Entrada pública ----------------------------------------------------

/** Só Lingerie e Roupa têm numeração/tamanho comparável; Produto Erótico e Acessório ficam de fora. */
export function produtoTemCompatibilidadeDeTamanho(produto: any): boolean {
  return produto?.categoria === 'Lingerie' || produto?.categoria === 'Roupa';
}

export function verificarCompatibilidade(
  medidas: MedidasCliente | null,
  produto: any,
  opts?: OpcoesCompatibilidade
): ResultadoCompatibilidade {
  if (!medidas) {
    return { status: 'parcial', mensagem: 'Cadastre suas medidas no seu perfil para ver se essa peça serve em você.' };
  }

  const subCategoria = produto?.subCategoria;
  let resultado: ResultadoCompatibilidade;

  if (subCategoria === 'Conjunto') {
    resultado = avaliarConjunto(medidas, produto, opts);
  } else if (subCategoria === 'Sutiã') {
    resultado = avaliarSutia(medidas, produto, opts);
  } else if (subCategoria === 'Calcinha') {
    resultado = avaliarCalcinha(medidas, produto, opts);
  } else {
    // Fallback genérico: Camisola, Body, Corselet, Meia-calça e toda a
    // categoria "Roupa" usam a escala de tamanho de roupa (PP..XG).
    resultado = avaliarRoupaGenerica(medidas, produto, opts);
  }

  return reforcarComAvaliacoes(resultado, opts?.avaliacoesAprovadas);
}

/**
 * Verifica no histórico local de pedidos (`fiorella_pedidos`) se a cliente
 * já comprou este produto antes — usado como sinal silencioso de confiança
 * (ver `calcularTolerancia`). Não existe controle de troca/devolução no
 * projeto, então a simples presença do pedido já conta como sinal positivo.
 */
export function jaComprouProduto(emailCliente: string | undefined, produtoId: string): boolean {
  if (!emailCliente || !produtoId) return false;
  const pedidos = getStorage<any[]>('fiorella_pedidos', []);
  return pedidos.some(
    pedido => pedido?.cliente?.email === emailCliente && (pedido.itens || []).some((item: any) => item.produtoId === produtoId)
  );
}
