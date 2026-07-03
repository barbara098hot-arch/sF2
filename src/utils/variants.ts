// Helpers para trabalhar com variantes de produto (cor + tamanho + estoque)
import type { Variante } from '../pages/admin/VariantsEditor';

export type VarianteResumo = {
  cor: string;
  tamanho: string;
  estoque: number;
  varianteId?: string;
};

/**
 * Dado um produto, retorna a lista de variantes disponiveis.
 * Se o produto tem `variantes` cadastradas, usa elas.
 * Caso contrario, gera uma variante unica a partir de `cor` + `tamanho`
 * (ou apenas estoque total) para manter compatibilidade.
 */
export const getVariantesDoProduto = (produto: any): VarianteResumo[] => {
  if (!produto) return [];

  // Caso 1: produto ja tem variantes cadastradas
  if (Array.isArray(produto.variantes) && produto.variantes.length > 0) {
    return produto.variantes
      .filter((v: Variante) => v && v.estoque > 0)
      .map((v: Variante) => ({
        cor: v.cor,
        tamanho: v.tamanho,
        estoque: v.estoque,
        varianteId: v.id,
      }));
  }

  // Caso 2: produto antigo (sem variantes) - gera estoque a partir de cor/tamanho
  const cores: string[] = Array.isArray(produto.cores) && produto.cores.length > 0
    ? produto.cores
    : [''];
  const tamanhos: string[] = Array.isArray(produto.tamanhos) && produto.tamanhos.length > 0
    ? produto.tamanhos
    : [''];
  const sabores: string[] = Array.isArray(produto.sabores) && produto.sabores.length > 0
    ? produto.sabores
    : [''];

  const estoqueBase = Number(produto.estoque) || 0;
  const totalCombinacoes = cores.length * tamanhos.length * sabores.length;

  // Distribui o estoque entre as combinacoes existentes
  if (totalCombinacoes === 0) return [];

  const estoquePorCombinacao = Math.floor(estoqueBase / totalCombinacoes);
  const resto = estoqueBase % totalCombinacoes;

  const resultado: VarianteResumo[] = [];
  let i = 0;
  for (const cor of cores) {
    for (const tamanho of tamanhos) {
      for (let s = 0; s < sabores.length; s++) {
        resultado.push({
          cor,
          tamanho,
          estoque: estoquePorCombinacao + (i < resto ? 1 : 0),
        });
        i += 1;
      }
    }
  }
  return resultado;
};

/**
 * Encontra a variante especifica para a combinacao cor + tamanho selecionada.
 * Retorna null se nao existir ou se o estoque for 0.
 */
export const encontrarVariante = (
  produto: any,
  cor: string,
  tamanho: string
): VarianteResumo | null => {
  const variantes = getVariantesDoProduto(produto);
  const encontrada = variantes.find(
    (v) => v.cor === cor && v.tamanho === tamanho
  );
  return encontrada || null;
};

/**
 * Retorna os tamanhos disponiveis para a cor selecionada.
 * Se o produto tem variantes, considera apenas os tamanhos com estoque > 0
 * para aquela cor. Caso contrario, retorna o array original.
 */
export const getTamanhosPorCor = (produto: any, cor: string): string[] => {
  if (!produto) return [];
  const variantes = getVariantesDoProduto(produto);
  if (Array.isArray(produto.variantes) && produto.variantes.length > 0) {
    return Array.from(
      new Set(
        variantes
          .filter((v) => v.cor === cor)
          .map((v) => v.tamanho)
      )
    );
  }
  return Array.isArray(produto.tamanhos) ? produto.tamanhos : [];
};

/**
 * Retorna o estoque disponivel para a combinacao cor + tamanho.
 * Se o produto tem variantes, busca o estoque exato.
 * Caso contrario, retorna o estoque total do produto.
 */
export const getEstoqueVariante = (
  produto: any,
  cor: string,
  tamanho: string
): number => {
  if (!produto) return 0;
  const variantes = getVariantesDoProduto(produto);
  if (Array.isArray(produto.variantes) && produto.variantes.length > 0) {
    const v = variantes.find((x) => x.cor === cor && x.tamanho === tamanho);
    return v ? v.estoque : 0;
  }
  return Number(produto.estoque) || 0;
};
