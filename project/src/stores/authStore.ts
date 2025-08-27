import { create } from 'zustand';
import { supabase, type DbUser } from '../lib/supabase';

interface User extends DbUser {}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  initializeAuth: () => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (userData: { email: string; password: string; name: string; difficulty?: string; tithingPractice?: boolean; mainGoal?: string }) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  
  initializeAuth: async () => {
    // Evita múltiplas inicializações
    if (get().isInitialized) return;
    
    try {
      console.log('🔄 Inicializando autenticação...');
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session error:', error);
        set({ user: null, isAuthenticated: false, isInitialized: true });
        return;
      }

      console.log('📋 Sessão atual:', session ? 'Ativa' : 'Inativa');

      if (session?.user) {
        try {
          console.log('👤 Buscando perfil do usuário:', session.user.id);
          
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .limit(1);
          
          if (userError) {
            console.error('❌ Erro ao buscar usuário:', userError);
            throw userError;
          }

          console.log('📊 Dados do usuário encontrados:', userData?.length || 0);

          // If no user profile exists, create one
          if (!userData || userData.length === 0) {
            console.log('➕ Criando perfil de usuário...');
            
            const newUser = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.email?.split('@')[0] || 'User',
            };

            const { data: insertedUser, error: insertError } = await supabase
              .from('users')
              .insert([newUser])
              .select()
              .single();

            if (insertError) {
              console.error('❌ Erro ao criar usuário:', insertError);
              throw insertError;
            }
            
            console.log('✅ Usuário criado com sucesso');
            set({ user: insertedUser, isAuthenticated: true, isInitialized: true });
          } else {
            console.log('✅ Usuário autenticado com sucesso');
            set({ user: userData[0], isAuthenticated: true, isInitialized: true });
          }
        } catch (error) {
          console.error('❌ Error fetching user profile:', error);
          set({ user: null, isAuthenticated: false, isInitialized: true });
        }
      } else {
        console.log('ℹ️ Nenhuma sessão ativa');
        set({ user: null, isAuthenticated: false, isInitialized: true });
      }

      // Set up auth state listener apenas uma vez
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .limit(1);
            
            if (userError) throw userError;

            if (!userData || userData.length === 0) {
              const newUser = {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.email?.split('@')[0] || 'User',
              };

              const { data: insertedUser, error: insertError } = await supabase
                .from('users')
                .insert([newUser])
                .select()
                .single();

              if (insertError) throw insertError;
              
              set({ user: insertedUser, isAuthenticated: true });
            } else {
              set({ user: userData[0], isAuthenticated: true });
            }
          } catch (error) {
            console.error('Error in auth state change:', error);
            set({ user: null, isAuthenticated: false });
          }
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, isAuthenticated: false });
        }
      });
      
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      set({ user: null, isAuthenticated: false, isInitialized: true });
    }
  },
  
  login: async (credentials) => {
    try {
      console.log('🔐 Tentando fazer login...');
      
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) {
        console.error('❌ Erro no login:', error);
        throw error;
      }
      
      console.log('✅ Login realizado com sucesso');
      // State will be updated by onAuthStateChange listener
    } catch (error) {
      throw error;
    }
  },
  
  signup: async (userData) => {
    try {
      console.log('📝 Tentando criar conta...');
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });
      
      if (authError) {
        console.error('❌ Erro no signup:', authError);
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error('No user returned from signup');
      }
      
      console.log('👤 Criando perfil do usuário...');
      
      const newUser = {
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        difficulty: userData.difficulty,
        tithing_practice: userData.tithingPractice,
        main_goal: userData.mainGoal,
      };
      
      const { error: userError } = await supabase
        .from('users')
        .insert([newUser]);
      
      if (userError) {
        console.error('❌ Erro ao criar perfil:', userError);
        throw userError;
      }
      
      console.log('✅ Conta criada com sucesso');
      // State will be updated by onAuthStateChange listener
    } catch (error) {
      throw error;
    }
  },
  
  logout: async () => {
    try {
      console.log('🚪 Fazendo logout...');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('✅ Logout realizado com sucesso');
      // State will be updated by onAuthStateChange listener
    } catch (error) {
      throw error;
    }
  },
  
  resetPassword: async (email: string) => {
    console.log('Enviando email de recuperação para:', email);
    console.log('URL de redirecionamento:', getResetPasswordUrl());
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getResetPasswordUrl(),
    });
    
    if (error) {
      console.error('Erro no resetPassword:', error);
      throw error;
    }
    
    console.log('Email de recuperação enviado com sucesso');
  },
  
  updatePassword: async (newPassword: string) => {
    try {
      // Get current session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Sessão inválida. Solicite um novo link de recuperação.');
      }
      
      if (!session) {
        throw new Error('Nenhuma sessão ativa encontrada. Solicite um novo link de recuperação.');
      }
      
      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('Password update error:', error);
        throw error;
      }
      
      // Clear any URL parameters after successful password update
      if (window.location.hash) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  },
  
  updateUserProfile: async (data) => {
    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('id', data.id);
    
    if (error) throw error;
    
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null
    }));
  }
}));