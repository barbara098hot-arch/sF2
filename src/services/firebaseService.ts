import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, doc, setDoc } from 'firebase/firestore';

// ===== PRODUTOS =====
export const getProdutos = async (): Promise<any[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'produtos'));
    return querySnapshot.docs.map(doc => ({ ...(doc.data() || {}), id: doc.id }));
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
};

export const addProduto = async (produto: any) => {
  try {
    const docRef = await addDoc(collection(db, 'produtos'), {
      ...produto,
      dataCriacao: new Date().toISOString()
    });
    return docRef.id;
  } catch (error: any) {
    console.error('Erro ao adicionar produto:', error);
    throw new Error(error?.message || 'Não foi possível salvar o produto no banco de dados');
  }
};

export const updateProduto = async (id: string, produto: any) => {
  try {
    await updateDoc(doc(db, 'produtos', id), produto);
    return true;
  } catch (error: any) {
    console.error('Erro ao atualizar produto:', error);
    throw new Error(error?.message || 'Não foi possível atualizar o produto no banco de dados');
  }
};

export const deleteProduto = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'produtos', id));
    return true;
  } catch (error: any) {
    console.error('Erro ao deletar produto:', error);
    throw new Error(error?.message || 'Não foi possível deletar o produto');
  }
};

// ===== USUÁRIOS =====
// Perfil (nome/role) fica em usuarios/{uid}, onde uid é o UID do Firebase
// Authentication — a senha em si nunca passa pelo Firestore.
export const getUsuarioPerfil = async (uid: string): Promise<any> => {
  try {
    const snap = await getDoc(doc(db, 'usuarios', uid));
    return snap.exists() ? { ...snap.data(), id: snap.id } : null;
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    return null;
  }
};

export const setUsuarioPerfil = async (uid: string, perfil: any) => {
  try {
    await setDoc(doc(db, 'usuarios', uid), perfil);
    return true;
  } catch (error) {
    console.error('Erro ao salvar perfil do usuário:', error);
    return false;
  }
};

// ===== PEDIDOS =====
export const getPedidos = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'pedidos'));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return [];
  }
};

export const addPedido = async (pedido: any) => {
  try {
    const docRef = await addDoc(collection(db, 'pedidos'), {
      ...pedido,
      dataPedido: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar pedido:', error);
    return null;
  }
};

export const updatePedido = async (id: string, pedido: any) => {
  try {
    await updateDoc(doc(db, 'pedidos', id), pedido);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return false;
  }
};

// ===== CONFIGURAÇÕES =====
export const getConfig = async (): Promise<any> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'config'));
    if (querySnapshot.empty) return null;
    return { ...querySnapshot.docs[0].data(), id: querySnapshot.docs[0].id };
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    return null;
  }
};

export const updateConfig = async (config: any) => {
  try {
    const q = query(collection(db, 'config'));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      await addDoc(collection(db, 'config'), config);
    } else {
      await updateDoc(doc(db, 'config', querySnapshot.docs[0].id), config);
    }
    return true;
  } catch (error) {
    console.error('Erro ao atualizar configuração:', error);
    return false;
  }
};

// ===== PAGAMENTOS =====
export const getPagamentos = async (): Promise<any> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'pagamentos'));
    if (querySnapshot.empty) return null;
    return { ...querySnapshot.docs[0].data(), id: querySnapshot.docs[0].id };
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    return null;
  }
};

export const updatePagamentos = async (pagamentos: any) => {
  try {
    const q = query(collection(db, 'pagamentos'));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      await addDoc(collection(db, 'pagamentos'), pagamentos);
    } else {
      await updateDoc(doc(db, 'pagamentos', querySnapshot.docs[0].id), pagamentos);
    }
    return true;
  } catch (error) {
    console.error('Erro ao atualizar pagamentos:', error);
    return false;
  }
};

// ===== AVALIAÇÕES =====
export const getAvaliacoes = async (): Promise<any[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'avaliacoes'));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  } catch (error) {
    console.error('Erro ao buscar avaliações:', error);
    return [];
  }
};

// Filtra por produtoId no servidor (evita trazer a coleção inteira);
// filtro por status é feito no client, igual ao resto do projeto, pra
// não exigir índice composto no Firestore.
export const getAvaliacoesPorProduto = async (produtoId: string): Promise<any[]> => {
  try {
    const q = query(collection(db, 'avaliacoes'), where('produtoId', '==', produtoId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  } catch (error) {
    console.error('Erro ao buscar avaliações do produto:', error);
    return [];
  }
};

export const addAvaliacao = async (avaliacao: any) => {
  try {
    const docRef = await addDoc(collection(db, 'avaliacoes'), {
      ...avaliacao,
      dataCriacao: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar avaliação:', error);
    return null;
  }
};

export const updateAvaliacao = async (id: string, avaliacao: any) => {
  try {
    await updateDoc(doc(db, 'avaliacoes', id), avaliacao);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error);
    return false;
  }
};
