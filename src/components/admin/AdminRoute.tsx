import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, LogOut, ArrowLeft, Loader2 } from 'lucide-react';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin, loading, logout, designatedAdminEmail } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5EF] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-[#234737] animate-spin mb-3" />
        <p className="font-serif text-lg text-[#234737]">Verifying DripNest Credentials...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#EFE6D7] rounded-lg p-8 shadow-sm text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-[#252A24]">
              Access Restricted
            </h2>
            <p className="text-sm text-[#252A24]/70 mt-2 leading-relaxed">
              This area is restricted to authorized DripNest store administrators only.
            </p>
          </div>

          <div className="bg-[#F8F5EF] p-4 rounded-md text-left text-xs space-y-1.5 font-mono text-[#252A24]/80">
            <div><strong>Authenticated:</strong> {currentUser.email}</div>
            <div><strong>UID:</strong> <span className="truncate block">{currentUser.uid}</span></div>
            <div><strong>Designated Admin:</strong> {designatedAdminEmail}</div>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-600 text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-[#EFE6D7] text-[#252A24] text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-[#F8F5EF] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
