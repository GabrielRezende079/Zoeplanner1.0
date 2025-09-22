"use client";

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  AlertCircle,
  Leaf,
  ArrowLeft,
  RefreshCw,
  Clock,
} from "lucide-react";

// Validação de senha
const validatePassword = (password: string): string | null => {
  if (password.length < 6) {
    return "A senha deve ter pelo menos 6 caracteres";
  }
  return null;
};

// Força da senha
const getPasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 8) strength++;
  if (/(?=.*[a-z])/.test(password)) strength++;
  if (/(?=.*[A-Z])/.test(password)) strength++;
  if (/(?=.*\d)/.test(password)) strength++;
  if (/(?=.*[@$!%*?&])/.test(password)) strength++;
  return strength;
};

// Label de força
const getStrengthLabel = (strength: number) => {
  if (strength <= 2)
    return { label: "Fraca", color: "text-red-600", bg: "bg-red-500" };
  if (strength <= 4)
    return { label: "Média", color: "text-yellow-600", bg: "bg-yellow-500" };
  return { label: "Forte", color: "text-green-600", bg: "bg-green-500" };
};

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValidLink, setIsValidLink] = useState(false);
  const [sessionEstablished, setSessionEstablished] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const navigate = useNavigate();

  // Quando a página abre, o Supabase injeta sessão via hash (#access_token...)
  useEffect(() => {
    const handleRecovery = async () => {
      try {
        setIsCheckingLink(true);

        // O Supabase SDK automaticamente processa o hash
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setError("Erro ao obter sessão: " + error.message);
          setIsValidLink(false);
          return;
        }

        if (!data.session) {
          setError(
            "Sessão não encontrada. Link pode estar inválido ou expirado."
          );
          setIsValidLink(false);
          return;
        }

        setIsValidLink(true);
        setSessionEstablished(true);
        setDebugInfo("Sessão válida obtida a partir do hash do Supabase.");

        // limpa o hash da URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch (err) {
        console.error("Erro inesperado:", err);
        setError("Erro inesperado ao validar o link.");
        setIsValidLink(false);
      } finally {
        setIsCheckingLink(false);
      }
    };

    handleRecovery();
  }, []);

  // Submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setIsSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      console.error("Password reset error:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 Loading inicial
  if (isCheckingLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gold-50 via-olive-50 to-azure-50">
        <div className="max-w-md w-full p-8 rounded-2xl border-2 border-gold-200 shadow-xl bg-white">
          <div className="text-center mb-6">
            <Shield className="h-10 w-10 text-green-600 mx-auto" />
            <h2 className="text-2xl font-bold mt-2">
              Verificando link de recuperação...
            </h2>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Aguarde enquanto validamos seu acesso.
          </p>
          {debugInfo && (
            <pre className="text-xs text-gray-500 mt-2">Debug: {debugInfo}</pre>
          )}
        </div>
      </div>
    );
  }

  // ❌ Link inválido
  if (!isValidLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gold-50 via-olive-50 to-azure-50">
        <div className="max-w-md w-full p-8 rounded-2xl border-2 border-red-200 shadow-xl bg-white">
          <div className="text-center mb-6">
            <AlertCircle className="h-10 w-10 text-red-600 mx-auto" />
            <h2 className="text-xl font-bold mt-2">
              Link Inválido ou Expirado
            </h2>
          </div>
          <p className="text-gray-600">{error}</p>
          <Link
            to="/login"
            className="btn btn-primary mt-4 inline-flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Solicitar Novo Link
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Sucesso
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gold-50 via-olive-50 to-azure-50">
        <div className="max-w-md w-full p-8 rounded-2xl border-2 border-green-200 shadow-xl bg-white">
          <div className="text-center mb-6">
            <CheckCircle className="h-10 w-10 text-green-600 mx-auto" />
            <h2 className="text-xl font-bold mt-2">
              Senha redefinida com sucesso!
            </h2>
          </div>
          <p className="text-gray-600">
            Você será redirecionado em instantes...
          </p>
        </div>
      </div>
    );
  }

  // 🔑 Formulário
  const passwordStrength = getPasswordStrength(password);
  const strengthInfo = getStrengthLabel(passwordStrength);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gold-50 via-olive-50 to-azure-50 py-12 px-4">
      <div className="max-w-md w-full p-8 rounded-2xl border-2 border-gold-200 shadow-xl bg-white">
        <div className="text-center mb-6">
          <Shield className="h-10 w-10 text-green-600 mx-auto" />
          <h2 className="text-2xl font-bold mt-2">Redefinir Senha</h2>
          <p className="text-gray-700">
            Escolha uma nova senha forte para proteger sua conta
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nova senha */}
          <div>
            <label className="block text-sm font-medium mb-1">Nova Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-gray-500"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {password && (
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Força da senha:</span>
                  <span className={strengthInfo.color}>
                    {strengthInfo.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${strengthInfo.bg} h-2 rounded-full`}
                    style={{ width: `${(passwordStrength / 6) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirmar senha */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Confirmar Senha
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field w-full pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-2 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="w-full btn btn-primary"
            disabled={isLoading || !sessionEstablished}
          >
            {isLoading ? "Redefinindo..." : "Redefinir Senha"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-gray-600 hover:underline">
            <ArrowLeft className="inline h-4 w-4 mr-1" />
            Voltar ao login
          </Link>
        </div>

        {/* Enhanced Scripture Inspiration Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-olive-50 via-gold-50 to-azure-50 rounded-2xl p-6 border-2 border-gold-300 shadow-xl mt-8">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-olive-500 via-gold-500 to-azure-500"></div>
          <div className="absolute top-4 right-4 opacity-10">
            <Leaf className="h-16 w-16 text-gold-500" />
          </div>
          <div className="relative z-10 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Reflexão Bíblica
            </h3>
            <p className="text-gold-800 italic text-lg mb-2">
              "Cria em mim, ó Deus, um coração puro e renova dentro de mim um
              espírito inabalável."
            </p>
            <cite className="text-sm font-semibold text-gold-700 not-italic block">
              — Salmos 51:10
            </cite>
          </div>
        </div>
      </div>
    </div>
  );
}
