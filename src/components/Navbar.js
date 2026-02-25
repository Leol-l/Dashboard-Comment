import SatisfactionGauge from './Satisfaction';

const Navbar = () => {
  return (
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Monitoring IA</p>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">ANALYSE SATISFACTION</h1>
        </div>
        
        <div className="flex items-center gap-8">
          <SatisfactionGauge />
          <div className="h-12 w-[1px] bg-gray-100" />
          <button className="px-6 py-3 bg-white border-2 border-sky-400 text-sky-500 font-bold rounded-2xl hover:bg-sky-50 transition-all shadow-sm active:scale-95">
            Boost motivation
          </button>
        </div>
      </div>
    );
};

export default Navbar;