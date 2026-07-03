import { getStorage, setStorage } from './localStorage';
import { NUMERACOES_SUTIA } from '../constants/catalogo';
import type { MedidasCliente } from '../types/compatibilidade';

// Medidas da cliente ficam só em localStorage (por decisão explícita do
// produto: é dado pessoal do navegador dela, não precisa ir pro Firestore
// junto com o resto do perfil). A chave é vinculada ao id do usuário
// (mesmo id do documento em Firestore, atribuído no cadastro/login) para
// não misturar medidas entre contas diferentes no mesmo navegador.
export const getMedidasKey = (userId: string) => `medidas_${userId}`;

export const getMedidas = (userId: string): MedidasCliente | null => {
  if (!userId) return null;
  return getStorage<MedidasCliente | null>(getMedidasKey(userId), null);
};

export const saveMedidas = (userId: string, medidas: Omit<MedidasCliente, 'atualizadoEm'>): void => {
  if (!userId) return;
  setStorage<MedidasCliente>(getMedidasKey(userId), {
    ...medidas,
    atualizadoEm: new Date().toISOString(),
  });
};

// Opções do dropdown de "tamanho de sutiã" do Profile — numeração
// brasileira (38 a 54), a mesma escala usada no cadastro de produto.
export const TAMANHO_SUTIA_OPCOES: string[] = NUMERACOES_SUTIA;
