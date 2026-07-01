import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStorage, setStorage } from '../utils/localStorage';
import { getUsuarios, addUsuario, getUserByEmail } from '../services/firebaseService';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        const users = await getUsuarios();
        const hashSenha = btoa(senha + 'fiorella_salt');
        const user = users.find((u: any) => u.email === email && u.senha === hashSenha);
        
        if (user) {
          login({ email: user.email, nome: user.nome, role: user.role, loggedIn: true, id: user.id });
          if (user.role === 'adm') {
            navigate('/admin');
          } else {
            navigate('/perfil');
          }
        } else {
          setError('E-mail ou senha incorretos.');
        }
      } else {
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
          setError('E-mail já cadastrado.');
          setLoading(false);
          return;
        }
        
        const newUserId = await addUsuario({
          nome,
          email,
          senha: btoa(senha + 'fiorella_salt'),
          role: 'customer'
        });
        
        if (newUserId) {
          login({ email, nome, role: 'customer', loggedIn: true, id: newUserId });
          navigate('/perfil');
        } else {
          setError('Erro ao criar conta. Tente novamente.');
        }
      }
    } catch (err) {
      setError('Erro ao processar. Tente novamente.');
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

          <button type="submit" className="btn-primary w-full">
            {isLogin ? 'Entrar' : 'Cadastrar'}
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
