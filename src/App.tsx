import React from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { LoginView } from './components/LoginView.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { TablesFloorView } from './views/TablesFloorView.tsx';
import { NewOrderView } from './views/NewOrderView.tsx';
import { KitchenKDSView } from './views/KitchenKDSView.tsx';
import { OrdersListView } from './views/OrdersListView.tsx';
import { MenuAdminView } from './views/MenuAdminView.tsx';
import { TablesAdminView } from './views/TablesAdminView.tsx';
import { UsersAdminView } from './views/UsersAdminView.tsx';
import { VersionControlAdminView } from './views/VersionControlAdminView.tsx';

const AppContent: React.FC = () => {
  const { currentUser, isAuthLoading, activeView } = useRestaurant();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#f73b20] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#360802] font-medium tracking-[0.04em] uppercase">
            Cargando Jeton Bistro POS...
          </span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  const renderCurrentView = () => {
    switch (activeView) {
      case 'mesas':
        return <TablesFloorView />;
      case 'nuevo-pedido':
        return <NewOrderView />;
      case 'cocina':
        return <KitchenKDSView />;
      case 'pedidos':
        return <OrdersListView />;
      case 'menu':
        return <MenuAdminView />;
      case 'gestion-mesas':
        return <TablesAdminView />;
      case 'usuarios':
        return <UsersAdminView />;
      case 'versionamiento':
        return <VersionControlAdminView />;
      default:
        return <TablesFloorView />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#360802] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        {renderCurrentView()}
      </main>
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <RestaurantProvider>
      <AppContent />
    </RestaurantProvider>
  );
}
