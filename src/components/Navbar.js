const Navbar = () => {
  return (
    <header className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex flex-col gap-1">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Dashboard Commentaires</h1>
            <p className="text-xs text-gray-500 mt-0.5">Analyse en temps réel</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;