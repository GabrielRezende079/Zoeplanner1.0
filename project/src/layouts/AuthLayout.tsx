import React from 'react';
import { Outlet } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="bg-olive-600 md:w-1/2 p-8 flex flex-col justify-center items-center text-white shadow-2xl">
        <div className="max-w-md mx-auto">
          <Link to="/" className="flex items-center mb-8">
            <Leaf className="h-8 w-8 mr-2 text-gold-300" />
            <span className="text-2xl font-montserrat font-bold">ZoePlanner</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Planeje com propósito. Administre com fé.</h1>
          <p className="text-lg opacity-90 mb-6">
            Organize suas finanças com sabedoria e propósito cristão. 
            O ZoePlanner te ajuda a ser um bom mordomo dos recursos que Deus confiou a você.
          </p>
          <div className="scripture bg-olive-700 bg-opacity-30 p-4 rounded-lg border border-olive-500 shadow-lg">
            "Foste fiel no pouco, sobre o muito te colocarei" (Mateus 25:23)
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 md:w-1/2 p-6 flex items-center justify-center">
        <div className="form-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;