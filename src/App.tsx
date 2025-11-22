import { useState } from "react";
import { InventoryItem } from "./types/inventory.ts";
import { Supplier } from "./types/supplier.ts";
import { useInventory } from "./hooks/useInventory.ts";
import { useSuppliers } from "./hooks/useSuppliers.ts";
import { useAuth } from "./hooks/useAuth.ts";
import { LoginForm } from "./components/LoginForm.tsx";
import { Header } from "./components/Header.tsx";
import { StatsCards } from "./components/StatsCards.tsx";
import { FilterBar } from "./components/FilterBar.tsx";
import { InventoryTable } from "./components/InventoryTable.tsx";
import { Dashboard } from "./components/Dashboard.tsx";
import { Analytics } from "./components/Analytics.tsx";
import { AlertsSection } from "./components/AlertsSection.tsx";
import { SuppliersSection } from "./components/SuppliersSection.tsx";
import { ItemModal } from "./components/ItemModal.tsx";
import { SupplierModal } from "./components/SupplierModal.tsx";
import { useFilters } from "./hooks/useFilters.ts";
import { Sidebar } from "./components/Sidebar.tsx";
import { ThemeProvider } from "./ThemeProvider.tsx";
import { SignUpForm } from "./components/SignUpForm.tsx";

function App() {
  const { user, isAuthenticated, isLoading: authLoading, login, logout, signup } = useAuth();
  const [activeTab, setActiveTab] = useState("inventory");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>();
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>();
  const [showSignup, setShowSignup] = useState(false);

  const { items, addItem, deleteItem, editItem } = useInventory();
  const { suppliers, addSupplier, deleteSupplier, editSupplier } = useSuppliers();
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    stockFilter,
    setStockFilter,
    filteredItems,
  } = useFilters(items);

  const accessibleTabs: string[] = (() => {
    if (!user) return [];
    switch (user.group) {
      case "Admin":
        return ["inventory", "dashboard", "analytics", "alerts", "suppliers", "settings"];
      case "Manager":
        return ["inventory", "suppliers", "alerts"];
      case "Employee":
        return ["dashboard", "analytics"];
      default:
        return [];
    }
  })();

  if (!accessibleTabs.includes(activeTab) && accessibleTabs.length > 0) {
    setActiveTab(accessibleTabs[0]);
  }

  const handleAddItem = () => setIsModalOpen(true);
  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };
  const handleSaveItem = (itemData: Omit<InventoryItem, "id" | "lastUpdated">) => {
    if (editingItem) editItem(itemData, editingItem.id);
    else addItem(itemData);
  };
  const handleDeleteItem = (id: string) => window.confirm("Are you sure?") && deleteItem(id);

  const handleAddSupplier = () => setIsSupplierModalOpen(true);
  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsSupplierModalOpen(true);
  };
  const handleSaveSupplier = (supplierData: Omit<Supplier, "id" | "createdAt" | "lastUpdated">) => {
    if (editingSupplier) editSupplier(editingSupplier.id, supplierData);
    else addSupplier(supplierData);
  };
  const handleDeleteSupplier = (id: string) => deleteSupplier(id);

  if (authLoading)
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
    );

  if (!isAuthenticated || !user) {
    return showSignup ? (
        <SignUpForm
            onSignUp={signup}
            isLoading={authLoading}
            onSwitchToLogin={() => setShowSignup(false)}
        />
    ) : (
        <LoginForm
            onLogin={login}
            isLoading={authLoading}
            onSwitchToSignup={() => setShowSignup(true)}
        />
    );
  }

  return (
      <ThemeProvider>
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          {/* Sidebar */}
          <Sidebar
              activeTab={activeTab}
              onTabChange={(tab) => accessibleTabs.includes(tab) && setActiveTab(tab)}
              user={user}
          />

          <div className="flex-1 flex flex-col">
            {/* Header now includes the ThemeSwitcher */}
            <Header
                onAddItem={handleAddItem}
                searchTerm={activeTab === "inventory" ? searchTerm : undefined}
                onSearchChange={activeTab === "inventory" ? setSearchTerm : undefined}
                user={user}
                onLogout={logout}
                // Put your ThemeSwitcher inside the Header component JSX
            />

            <main className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              {activeTab === "inventory" && accessibleTabs.includes("inventory") && (
                  <>
                    <StatsCards items={items} />
                    <FilterBar
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        stockFilter={stockFilter}
                        onStockFilterChange={setStockFilter}
                    />
                    <InventoryTable
                        items={filteredItems}
                        onEditItem={handleEditItem}
                        onDeleteItem={handleDeleteItem}
                    />
                  </>
              )}

              {activeTab === "dashboard" && accessibleTabs.includes("dashboard") && (
                  <Dashboard items={items} />
              )}

              {activeTab === "analytics" && accessibleTabs.includes("analytics") && (
                  <Analytics items={items} />
              )}

              {activeTab === "alerts" && accessibleTabs.includes("alerts") && (
                  <AlertsSection items={items} />
              )}

              {activeTab === "suppliers" && accessibleTabs.includes("suppliers") && (
                  <SuppliersSection
                      suppliers={suppliers}
                      onAddSupplier={handleAddSupplier}
                      onEditSupplier={handleEditSupplier}
                      onDeleteSupplier={handleDeleteSupplier}
                  />
              )}

              {activeTab === "settings" && accessibleTabs.includes("settings") && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center transition-colors duration-300">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 capitalize">
                      Settings
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      This section is under development and will be available soon.
                    </p>
                  </div>
              )}
            </main>
          </div>

          {/* Modals */}
          <ItemModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSave={handleSaveItem}
              item={editingItem}
          />

          <SupplierModal
              isOpen={isSupplierModalOpen}
              onClose={() => setIsSupplierModalOpen(false)}
              onSave={handleSaveSupplier}
              supplier={editingSupplier}
          />
        </div>
      </ThemeProvider>
  );
}

export default App;
