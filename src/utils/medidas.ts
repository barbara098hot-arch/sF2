import { getStorage, setStorage } from './localStorage';
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

// Bandas de 2 em 2 (34 a 48) x aros de A a E — gera a lista de opções prontas
// pro dropdown de "tamanho de sutiã" do Profile, sem repetir a combinatória na UI.
const BANDAS = ['34', '36', '38', '40', '42', '44', '46', '48'];
const AROS = ['A', 'B', 'C', 'D', 'DD', 'E'];

export const TAMANHO_SUTIA_OPCOES: string[] = BANDAS.flatMap(banda =>
  AROS.map(aro => `${banda}${aro}`)
);
