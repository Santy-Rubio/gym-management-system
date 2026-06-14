import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout({ children }: any) {
  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido */}
      <div className="flex-1 flex flex-col">
        
        {/* Header */}
        <Header />

        {/* Main */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
}