import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUsuarioPerfil, setUsuarioPerfil } from '../services/firebaseService';

const MENSAGENS_ERRO: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/user-not-found': 'E-mail ou senha incorretos.',
  'auth/wrong-password': 'E-mail ou senha incorretos.',
  'auth/email-already-in-use': 'E-mail já cadastrado.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/invalid-email': 'E-mail inválido.',
};

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const credential = await signInWithEmailAndPassword(auth, email, senha);
        const perfil = await getUsuarioPerfil(credential.user.uid);
        navigate(perfil?.role === 'adm' ? '/admin' : '/perfil');
      } else {
        const credential = await createUserWithEmailAndPassword(auth, email, senha);
        await setUsuarioPerfil(credential.user.uid, { nome, email, role: 'customer' });
        navigate('/perfil');
      }
    } catch (err: any) {
      setError(MENSAGENS_ERRO[err?.code] || 'Erro ao processar. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-fiorella-black-lightest border border-[#333] p-8 rounded-sm shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="font-cormorant text-3xl text-fiorella-gold">
            {isLogin ? 'Bem-vinda de volta' : 'Crie sua conta'}
          </h2>
          <p className="text-sm text-[#aaa] mt-2">
            {isLogin ? 'Acesse sua conta para continuar' : 'Junte-se a nós para uma experiência exclusiva'}
          </p>
        </div>

        {error && <div className="bg-red-900/50 border border-red-900 text-red-200 p-3 rounded-sm text-sm mb-6 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm text-[#aaa] mb-1">Nome Completo</label>
              <input required type="text" value={nome} onChange={e => setNome(e.target.value)} className="input-field" />
            </div>
          )}
          <div>
            <label className="block text-sm text-[#aaa] mb-1">E-mail</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-[#aaa] mb-1">Senha</label>
            <input required type="password" value={senha} onChange={e => setSenha(e.target.value)} className="input-field" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-fiorella-gold text-sm hover:text-white transition-colors">
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
          </button>
        </div>
      </div>
    </div>
  );
};
