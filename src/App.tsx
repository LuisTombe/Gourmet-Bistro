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

const AppContent: React.FC = () => {
  const { currentUser, activeView } = useRestaurant();

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
      default:
        return <TablesFloorView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col font-sans">
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
