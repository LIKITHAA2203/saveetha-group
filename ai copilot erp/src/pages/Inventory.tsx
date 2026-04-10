import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  ArrowRight,
  RefreshCw,
  Search,
  Plus,
  CheckSquare,
  Square,
  Send
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';

export default function Inventory() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    currentStock: 0,
    reorderLevel: 0,
    dailyUsage: 0,
    leadTime: 0
  });
  const [bulkRfqData, setBulkRfqData] = useState({
    requiredDate: '',
    priority: 'medium',
    assignedVendors: [] as string[]
  });

  useEffect(() => {
    const unsubInventory = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      const items = snapshot.docs.map(doc => {
        const item = { id: doc.id, ...doc.data() } as any;
        const daysLeft = item.currentStock / (item.dailyUsage || 0.1);
        const isLow = item.currentStock <= (item.reorderLevel || 0) || daysLeft <= (item.leadTime || 0);
        return { ...item, daysLeft, isLow };
      });
      setInventory(items);
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'inventory'));

    const unsubVendors = onSnapshot(collection(db, 'vendors'), (snapshot) => {
      setVendors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'vendors'));

    return () => {
      unsubInventory();
      unsubVendors();
    };
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === inventory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(inventory.map(i => i.id));
    }
  };

  const handleBulkRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedInventoryItems = inventory.filter(i => selectedItems.includes(i.id));
      
      const promises = selectedInventoryItems.map(item => 
        addDoc(collection(db, 'rfqs'), {
          itemName: item.name,
          quantity: item.reorderLevel || 1,
          requiredDate: bulkRfqData.requiredDate,
          priority: bulkRfqData.priority,
          assignedVendors: bulkRfqData.assignedVendors,
          status: 'open',
          createdAt: new Date().toISOString()
        })
      );

      await Promise.all(promises);
      setShowBulkModal(false);
      setSelectedItems([]);
      setBulkRfqData({ requiredDate: '', priority: 'medium', assignedVendors: [] });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'rfqs');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'inventory'), {
        ...newItem,
        createdAt: new Date().toISOString()
      });
      setShowAddModal(false);
      setNewItem({ name: '', currentStock: 0, reorderLevel: 0, dailyUsage: 0, leadTime: 0 });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'inventory');
    }
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#141414]">Inventory Control</h1>
          <p className="text-[#141414]/60 mt-1 font-medium italic serif">Stock tracking and AI-driven reorder predictions.</p>
        </div>
        <div className="flex gap-3">
          {selectedItems.length > 0 && (
            <button 
              onClick={() => setShowBulkModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-lg animate-in slide-in-from-right-4"
            >
              <Send className="w-4 h-4" /> Create Bulk RFQ ({selectedItems.length})
            </button>
          )}
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="bg-white text-[#141414] px-6 py-3 rounded-xl font-bold border border-[#141414]/10 flex items-center gap-2 hover:bg-[#F5F5F5] transition-all disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} /> 
            {isSyncing ? 'Syncing...' : 'Sync ERP'}
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-[#141414] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#141414]/90 transition-all"
          >
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
              <button 
                onClick={() => {
                  setSelectedItems([item.id]);
                  setShowBulkModal(true);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition-all flex items-center gap-2"
              >
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
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleSelectAll}
              className="text-xs font-bold text-[#141414]/60 hover:text-[#141414] flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#F5F5F5] transition-all"
            >
              {selectedItems.length === inventory.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              {selectedItems.length === inventory.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F5F5F5] text-[10px] uppercase tracking-widest font-bold text-[#141414]/40">
                <th className="px-8 py-6 w-16"></th>
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
                <tr 
                  key={item.id} 
                  className={cn(
                    "hover:bg-[#F5F5F5]/50 transition-all group cursor-pointer",
                    selectedItems.includes(item.id) && "bg-blue-50/30"
                  )}
                  onClick={() => toggleSelect(item.id)}
                >
                  <td className="px-8 py-8">
                    <div className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                      selectedItems.includes(item.id) ? "bg-[#141414] border-[#141414]" : "border-[#141414]/10 bg-white"
                    )}>
                      {selectedItems.includes(item.id) && <CheckSquare className="w-3 h-3 text-white" />}
                    </div>
                  </td>
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
                            item.isLow ? "bg-red-500" : "bg-green-500"
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

      {/* Bulk RFQ Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-[#141414]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-[#141414] mb-2">Create Bulk RFQ</h2>
            <p className="text-[#141414]/40 text-sm mb-8 font-medium">Creating RFQs for {selectedItems.length} selected items.</p>
            
            <form onSubmit={handleBulkRfq} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Required Date</label>
                  <input 
                    type="date" 
                    required
                    value={bulkRfqData.requiredDate}
                    onChange={e => setBulkRfqData({...bulkRfqData, requiredDate: e.target.value})}
                    className="w-full px-5 py-3 bg-[#F5F5F5] border border-transparent focus:border-[#141414] rounded-xl outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Priority</label>
                  <select 
                    value={bulkRfqData.priority}
                    onChange={e => setBulkRfqData({...bulkRfqData, priority: e.target.value})}
                    className="w-full px-5 py-3 bg-[#F5F5F5] border border-transparent focus:border-[#141414] rounded-xl outline-none transition-all font-medium"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Assign Vendors</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-[#F5F5F5] rounded-xl">
                    {vendors.map(v => (
                      <label key={v.id} className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                        <input 
                          type="checkbox" 
                          checked={bulkRfqData.assignedVendors.includes(v.id)}
                          onChange={(e) => {
                            if (e.target.checked) setBulkRfqData({...bulkRfqData, assignedVendors: [...bulkRfqData.assignedVendors, v.id]});
                            else setBulkRfqData({...bulkRfqData, assignedVendors: bulkRfqData.assignedVendors.filter(id => id !== v.id)});
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-[#141414] focus:ring-[#141414]"
                        />
                        <span className="text-sm font-bold">{v.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 px-6 py-4 border border-[#141414]/10 rounded-xl font-bold hover:bg-[#F5F5F5] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all"
                >
                  Generate {selectedItems.length} RFQs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#141414]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-[#141414] mb-8">Add Inventory Item</h2>
            <form onSubmit={handleAddItem} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Item Name</label>
                  <input 
                    type="text" 
                    required
                    value={newItem.name}
                    onChange={e => setNewItem({...newItem, name: e.target.value})}
                    className="w-full px-5 py-3 bg-[#F5F5F5] border border-transparent focus:border-[#141414] rounded-xl outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Current Stock</label>
                  <input 
                    type="number" 
                    required
                    value={newItem.currentStock}
                    onChange={e => setNewItem({...newItem, currentStock: parseInt(e.target.value)})}
                    className="w-full px-5 py-3 bg-[#F5F5F5] border border-transparent focus:border-[#141414] rounded-xl outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Reorder Level</label>
                  <input 
                    type="number" 
                    required
                    value={newItem.reorderLevel}
                    onChange={e => setNewItem({...newItem, reorderLevel: parseInt(e.target.value)})}
                    className="w-full px-5 py-3 bg-[#F5F5F5] border border-transparent focus:border-[#141414] rounded-xl outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Daily Usage</label>
                  <input 
                    type="number" 
                    required
                    value={newItem.dailyUsage}
                    onChange={e => setNewItem({...newItem, dailyUsage: parseFloat(e.target.value)})}
                    className="w-full px-5 py-3 bg-[#F5F5F5] border border-transparent focus:border-[#141414] rounded-xl outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Lead Time (Days)</label>
                  <input 
                    type="number" 
                    required
                    value={newItem.leadTime}
                    onChange={e => setNewItem({...newItem, leadTime: parseInt(e.target.value)})}
                    className="w-full px-5 py-3 bg-[#F5F5F5] border border-transparent focus:border-[#141414] rounded-xl outline-none transition-all font-medium"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-4 border border-[#141414]/10 rounded-xl font-bold hover:bg-[#F5F5F5] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-4 bg-[#141414] text-white rounded-xl font-bold hover:bg-[#141414]/90 transition-all"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
