import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Star, 
  ShieldCheck, 
  AlertCircle,
  Phone,
  Mail,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Vendors() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newVendor, setNewVendor] = useState({
    name: '',
    category: '',
    contactPerson: '',
    email: '',
    phone: '',
    rating: 4.0
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'vendors'), (snapshot) => {
      setVendors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'vendors'));

    return () => unsubscribe();
  }, []);

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const vendorData = {
        ...newVendor,
        trustScore: 70 + Math.floor(Math.random() * 20),
        pastPerformance: 70 + Math.floor(Math.random() * 20),
        deliverySuccessRate: 70 + Math.floor(Math.random() * 20),
        qualityScore: 70 + Math.floor(Math.random() * 20),
        responseSpeed: 70 + Math.floor(Math.random() * 20),
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'vendors'), vendorData);
      setShowAddModal(false);
      setNewVendor({ name: '', category: '', contactPerson: '', email: '', phone: '', rating: 4.0 });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'vendors');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#141414]">Vendor Directory</h1>
          <p className="text-[#141414]/60 mt-1 font-medium italic serif">Manage your supplier relationships and performance metrics.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#141414] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#141414]/90 transition-all"
        >
          <Plus className="w-5 h-5" /> Add New Vendor
        </button>
      </div>

      {/* Vendor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="bg-white rounded-3xl border border-[#141414]/10 overflow-hidden hover:shadow-xl transition-all group">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-[#F5F5F5] rounded-2xl flex items-center justify-center text-2xl font-bold text-[#141414]">
                  {vendor.name.charAt(0)}
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-yellow-500 mb-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-bold text-[#141414]">{vendor.rating}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40">{vendor.category}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-[#141414] mb-2">{vendor.name}</h3>
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm text-[#141414]/60">
                  <Phone className="w-4 h-4" /> {vendor.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#141414]/60">
                  <Mail className="w-4 h-4" /> {vendor.email}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-[#F5F5F5] rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40">Trust Score</span>
                  <div className="flex items-center gap-1 text-green-600 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4" /> {vendor.trustScore}%
                  </div>
                </div>
                <div className="w-full bg-white/50 h-2 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      vendor.trustScore > 80 ? "bg-green-500" : vendor.trustScore > 60 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ width: `${vendor.trustScore || 0}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-1">Delivery</p>
                    <p className="text-sm font-bold text-[#141414]">{vendor.deliverySuccessRate}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-1">Quality</p>
                    <p className="text-sm font-bold text-[#141414]">{vendor.qualityScore}%</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-8 py-4 bg-[#F5F5F5]/50 border-t border-[#141414]/5 flex justify-between items-center">
              <button className="text-xs font-bold text-[#141414]/60 hover:text-[#141414] transition-all flex items-center gap-1">
                View History <ExternalLink className="w-3 h-3" />
              </button>
              <button className="p-2 hover:bg-white rounded-lg transition-all">
                <MoreVertical className="w-4 h-4 text-[#141414]/40" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#141414]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-[#141414] mb-8">Add New Vendor</h2>
            <form onSubmit={handleAddVendor} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Vendor Name</label>
                  <input 
                    type="text" 
                    required
                    value={newVendor.name}
                    onChange={e => setNewVendor({...newVendor, name: e.target.value})}
                    className="w-full px-5 py-3 bg-[#F5F5F5] border border-transparent focus:border-[#141414] rounded-xl outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Category</label>
                  <input 
                    type="text" 
                    required
                    value={newVendor.category}
                    onChange={e => setNewVendor({...newVendor, category: e.target.value})}
                    className="w-full px-5 py-3 bg-[#F5F5F5] border border-transparent focus:border-[#141414] rounded-xl outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Contact Person</label>
                  <input 
                    type="text" 
                    required
                    value={newVendor.contactPerson}
                    onChange={e => setNewVendor({...newVendor, contactPerson: e.target.value})}
                    className="w-full px-5 py-3 bg-[#F5F5F5] border border-transparent focus:border-[#141414] rounded-xl outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Email</label>
                  <input 
                    type="email" 
                    required
                    value={newVendor.email}
                    onChange={e => setNewVendor({...newVendor, email: e.target.value})}
                    className="w-full px-5 py-3 bg-[#F5F5F5] border border-transparent focus:border-[#141414] rounded-xl outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Phone</label>
                  <input 
                    type="text" 
                    required
                    value={newVendor.phone}
                    onChange={e => setNewVendor({...newVendor, phone: e.target.value})}
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
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
