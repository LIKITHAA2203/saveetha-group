import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  ArrowRight,
  RefreshCw,
  Search,
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Inventory() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      const items = snapshot.docs.map(doc => {
        const item = { id: doc.id, ...doc.data() } as any;
        const daysLeft = item.currentStock / (item.dailyUsage || 0.1);
        const isLow = daysLeft <= item.leadTime;
        return { ...item, daysLeft, isLow };
      });
      setInventory(items);
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'inventory'));

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#141414]">Inventory Control</h1>
          <p className="text-[#141414]/60 mt-1 font-medium italic serif">Stock tracking and AI-driven reorder predictions.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white text-[#141414] px-6 py-3 rounded-xl font-bold border border-[#141414]/10 flex items-center gap-2 hover:bg-[#F5F5F5] transition-all">
            <RefreshCw className="w-4 h-4" /> Sync ERP
          </button>
          <button className="bg-[#141414] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#141414]/90 transition-all">
            <Plus className="w-5 h-5" /> Add Item
          </button>
        </div>
      </div>

      {/* Prediction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {inventory.filter(i => i.isLow).map((item, idx) => (
          <div key={idx} className="bg-red-50 border border-red-100 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-all">
              <AlertTriangle className="w-20 h-20 text-red-600" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-red-600 mb-4">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Critical Reorder Alert</span>
              </div>
              <h3 className="text-xl font-bold text-[#141414] mb-1">{item.name}</h3>
              <p className="text-sm text-[#141414]/60 mb-6 font-medium">
                Current stock will be exhausted in <span className="text-red-600 font-bold">{item.daysLeft.toFixed(1)} days</span>.
              </p>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition-all flex items-center gap-2">
                Create Emergency RFQ <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-[40px] border border-[#141414]/10 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-[#141414]/10 flex items-center justify-between">
          <div className="flex items-center gap-4 bg-[#F5F5F5] px-4 py-2 rounded-full w-80">
            <Search className="w-4 h-4 text-[#141414]/40" />
            <input type="text" placeholder="Search inventory..." className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F5F5F5] text-[10px] uppercase tracking-widest font-bold text-[#141414]/40">
                <th className="px-8 py-6">Item Details</th>
                <th className="px-8 py-6">Stock Level</th>
                <th className="px-8 py-6">Daily Usage</th>
                <th className="px-8 py-6">Lead Time</th>
                <th className="px-8 py-6">Prediction</th>
                <th className="px-8 py-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/5">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-[#F5F5F5]/50 transition-all group">
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#F5F5F5] rounded-2xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-[#141414]/40" />
                      </div>
                      <div>
                        <p className="font-bold text-[#141414]">{item.name}</p>
                        <p className="text-[10px] text-[#141414]/40 font-bold uppercase tracking-widest">ID: {item.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex flex-col gap-1">
                      <p className="text-lg font-bold text-[#141414]">{item.currentStock}</p>
                      <div className="w-24 h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            item.currentStock > item.reorderLevel ? "bg-green-500" : "bg-red-500"
                          )}
                          style={{ width: `${Math.min(100, (item.currentStock / ((item.reorderLevel || 1) * 2)) * 100) || 0}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-2 font-bold text-[#141414]">
                      {item.dailyUsage > 1 ? <TrendingUp className="w-4 h-4 text-red-500" /> : <TrendingDown className="w-4 h-4 text-green-500" />}
                      {item.dailyUsage} / day
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <p className="font-bold text-[#141414]">{item.leadTime} Days</p>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex flex-col">
                      <p className={cn("font-bold", item.isLow ? "text-red-600" : "text-[#141414]")}>
                        {item.daysLeft.toFixed(1)} Days Left
                      </p>
                      <p className="text-[10px] text-[#141414]/40 font-bold uppercase tracking-widest">Estimated Exhaustion</p>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      item.isLow ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                    )}>
                      {item.isLow ? 'Critical' : 'Stable'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
