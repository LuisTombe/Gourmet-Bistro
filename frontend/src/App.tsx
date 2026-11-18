import React, { Suspense, lazy } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { LoginView } from './components/LoginView.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { ViewSkeleton } from './components/ui/Skeleton.tsx';

// Code-splitting por vista para minimizar el bundle inicial y acelerar FCP/LCP
const TablesFloorView = lazy(() =>
  import('./views/TablesFloorView.tsx').then((m) => ({ default: m.TablesFloorView }))
);
const NewOrderView = lazy(() =>
  import('./views/NewOrderView.tsx').then((m) => ({ default: m.NewOrderView }))
);
const KitchenKDSView = lazy(() =>
  import('./views/KitchenKDSView.tsx').then((m) => ({ default: m.KitchenKDSView }))
);
const OrdersListView = lazy(() =>
  import('./views/OrdersListView.tsx').then((m) => ({ default: m.OrdersListView }))
);
const MenuAdminView = lazy(() =>
  import('./views/MenuAdminView.tsx').then((m) => ({ default: m.MenuAdminView }))
);
const TablesAdminView = lazy(() =>
  import('./views/TablesAdminView.tsx').then((m) => ({ default: m.TablesAdminView }))
);
const UsersAdminView = lazy(() =>
  import('./views/UsersAdminView.tsx').then((m) => ({ default: m.UsersAdminView }))
);
const VersionControlAdminView = lazy(() =>
  import('./views/VersionControlAdminView.tsx').then((m) => ({
    default: m.VersionControlAdminView,
  }))
);

const AppContent: React.FC = () => {
  const { currentUser, isAuthLoading, activeView } = useRestaurant();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#ffffff]">
        <ViewSkeleton cards={8} />
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
    <div className="min-h-screen bg-[#ffffff] text-[#360802] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<ViewSkeleton cards={8} />}>{renderCurrentView()}</Suspense>
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
