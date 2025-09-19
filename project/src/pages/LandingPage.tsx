import React from "react";
import { Link } from "react-router-dom";
import {
  Leaf,
  Wallet,
  BookOpen,
  BarChart2,
  Heart,
  Target,
  Shield,
  Menu,
  X,
} from "lucide-react";

const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Leaf className="h-8 w-8 text-olive-600" />
              <span className="ml-2 text-2xl font-montserrat font-bold text-gray-800">
                ZoePlanner
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <a
                href="#features"
                className="text-gray-700 hover:text-olive-600 px-3 py-2 transition-colors duration-200"
              >
                Recursos
              </a>
              <Link
                to="/login"
                className="text-gray-700 hover:text-olive-600 font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gray-50"
              >
                Entrar
              </Link>
              <Link
                to="/signup"
                className="bg-olive-600 hover:bg-olive-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Começar Agora
              </Link>
            </div>

            <div className="flex md:hidden items-center">
              <button onClick={toggleMobileMenu} className="text-gray-700">
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${mobileMenuOpen ? "block" : "hidden"}`}>
          <div className="pt-2 pb-4 space-y-1 px-4">
            <a
              href="#features"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              Recursos
            </a>
            <Link
              to="/login"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 mt-2 text-center font-medium"
            >
              Entrar
            </Link>
            <Link
              to="/signup"
              className="block px-3 py-2 rounded-md text-white bg-olive-600 hover:bg-olive-700 mt-2 text-center font-medium"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="bg-gradient-to-b from-olive-50 to-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 fade-in">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Planeje suas finanças com{" "}
                <span className="text-olive-600">propósito cristão</span>
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                ZoePlanner une tecnologia moderna com princípios bíblicos para
                transformar sua relação com o dinheiro e ajudá-lo a ser um bom
                mordomo dos recursos que Deus confiou a você.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-olive-600 to-olive-700 hover:from-olive-700 hover:to-olive-800 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-olive-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl text-center text-lg"
                >
                  Vamos Começar
                </Link>
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-azure-600 to-azure-700 hover:from-azure-700 hover:to-azure-800 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-azure-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl text-center text-lg"
                >
                  Já Tenho Conta
                </Link>
              </div>
              {/* PWA Install Section */}
              <div className="mt-8 flex flex-col items-start">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Instale o ZoePlanner no seu dispositivo
                </h2>
                <p className="text-gray-600 mb-2">
                  Para uma experiência completa, instale o app ZoePlanner como
                  PWA e acesse rapidamente pelo seu celular ou computador.
                </p>
                <button
                  id="pwa-install-btn"
                  className="bg-olive-600 hover:bg-olive-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 shadow-md mb-2"
                  style={{ display: "none" }}
                >
                  Instalar App
                </button>
                
              </div>
              <div className="mt-6 scripture">
                "Foste fiel no pouco, sobre o muito te colocarei" (Mateus 25:23)
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Organização Financeira com Propósito
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              O ZoePlanner oferece ferramentas poderosas para gerenciar suas
              finanças de acordo com princípios bíblicos de mordomia e
              generosidade.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-olive-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-olive-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dashboard Completo</h3>
              <p className="text-gray-600">
                Visualize suas finanças com clareza através de gráficos
                intuitivos e relatórios detalhados que ajudam a entender seus
                hábitos financeiros.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-azure-100 rounded-lg flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-azure-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Gestão de Transações
              </h3>
              <p className="text-gray-600">
                Registre e categorize suas receitas e despesas de forma simples,
                mantendo o controle completo do seu fluxo financeiro.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-gold-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dízimos e Ofertas</h3>
              <p className="text-gray-600">
                Acompanhe seus dízimos, ofertas e votos com ferramentas
                especiais para promover a fidelidade na mordomia cristã.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-olive-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-olive-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Metas com Propósito
              </h3>
              <p className="text-gray-600">
                Estabeleça e acompanhe metas financeiras alinhadas com seus
                valores cristãos, sejam viagens missionárias ou projetos
                pessoais.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-azure-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-azure-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Princípios Bíblicos
              </h3>
              <p className="text-gray-600">
                Receba orientações baseadas na Bíblia para cada aspecto da sua
                jornada financeira, ajudando a alinhar suas decisões com a
                Palavra.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-gold-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Planejamento Seguro
              </h3>
              <p className="text-gray-600">
                Proteja seu futuro financeiro com ferramentas de planejamento
                que incentivam decisões sábias e equilibradas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scripture Banner */}
      <section className="bg-olive-600 py-12 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xl md:text-2xl font-montserrat italic">
            "O que você faz com o que Deus te dá, define o que Ele pode confiar
            a você."
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-olive-600 to-olive-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Comece sua jornada de mordomia hoje
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Junte-se a milhares de cristãos que estão transformando sua relação
            com as finanças através do ZoePlanner.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/signup"
              className="bg-white text-olive-700 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-white focus:ring-opacity-50 shadow-lg hover:shadow-xl text-lg"
            >
              Vamos Começar
            </Link>
            <Link
              to="/login"
              className="bg-azure-600 hover:bg-azure-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-azure-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl text-lg border-2 border-azure-600 hover:border-azure-700"
            >
              Já Tenho Conta
            </Link>
          </div>
          <p className="mt-6 text-white text-opacity-80">
            "Ser fiel no pouco é o primeiro passo para o muito."
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center">
                <Leaf className="h-8 w-8 text-olive-400" />
                <span className="ml-2 text-2xl font-montserrat font-bold">
                  ZoePlanner
                </span>
              </div>
              <p className="mt-2 text-gray-400 max-w-md">
                Transformando a maneira como cristãos administram seus recursos,
                promovendo fidelidade, sabedoria e propósito.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Produto</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#features"
                      className="text-gray-400 hover:text-white"
                    >
                      Recursos
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Planos
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Segurança
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Empresa</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Sobre nós
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Contato
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Termos
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Privacidade
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2025 ZoePlanner. Todos os direitos reservados.
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-400 text-sm">
                "Planeje com propósito. Administre com fé."
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
