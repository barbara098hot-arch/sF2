import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStorage, setStorage } from '../utils/localStorage';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const users = getStorage<any[]>('fiorella_usuarios', []);
    
    if (isLogin) {
      const hashSenha = btoa(senha + 'fiorella_salt');
      const user = users.find(u => u.email === email && u.senha === hashSenha);
      
      if (user) {
        login({ email: user.email, nome: user.nome, role: user.role, loggedIn: true });
        if (user.role === 'adm') {
          navigate('/admin');
        } else {
          navigate('/perfil');
        }
      } else {
        setError('E-mail ou senha incorretos.');
      }
    } else {
      if (users.find(u => u.email === email)) {
        setError('E-mail já cadastrado.');
        return;
      }
      
      const newUser = {
        id: Math.random().toString(36).substring(7),
        nome,
        email,
        senha: btoa(senha + 'fiorella_salt'),
        role: 'customer',
        dataCadastro: new Date().toISOString()
      };
      
      setStorage('fiorella_usuarios', [...users, newUser]);
      login({ email: newUser.email, nome: newUser.nome, role: newUser.role, loggedIn: true });
      navigate('/perfil');
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
