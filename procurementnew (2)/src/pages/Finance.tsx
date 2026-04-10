import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Finance() {
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'purchaseOrders'), (snapshot) => {
      setPos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'purchaseOrders'));

    return () => unsubscribe();
  }, []);

  const totalSpend = pos.reduce((acc, po) => acc + (po.totalAmount || 0), 0);
  const pendingPayments = pos.filter(po => po.paymentStatus === 'unpaid').reduce((acc, po) => acc + (po.totalAmount || 0), 0);
  const paidPayments = pos.filter(po => po.paymentStatus === 'paid').reduce((acc, po) => acc + (po.totalAmount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#141414]">Finance Linkage</h1>
          <p className="text-[#141414]/60 mt-1 font-medium italic serif">Procurement spend tracking and payment reconciliation.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-[#141414]/10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" /> +12%
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-1">Total Procurement Spend</p>
          <h3 className="text-3xl font-bold text-[#141414]">${totalSpend.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-[#141414]/10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-1">Pending Payments</p>
          <h3 className="text-3xl font-bold text-[#141414]">${pendingPayments.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-[#141414]/10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-1">Paid Invoices</p>
          <h3 className="text-3xl font-bold text-[#141414]">${paidPayments.toLocaleString()}</h3>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[40px] border border-[#141414]/10 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-[#141414]/10 flex items-center justify-between">
          <div className="flex items-center gap-4 bg-[#F5F5F5] px-4 py-2 rounded-full w-80">
            <Search className="w-4 h-4 text-[#141414]/40" />
            <input type="text" placeholder="Search transactions..." className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-[#F5F5F5] rounded-lg transition-all">
              <Filter className="w-4 h-4 text-[#141414]/40" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F5F5F5] text-[10px] uppercase tracking-widest font-bold text-[#141414]/40">
                <th className="px-8 py-6">PO Reference</th>
                <th className="px-8 py-6">Vendor</th>
                <th className="px-8 py-6">Amount</th>
                <th className="px-8 py-6">Date</th>
                <th className="px-8 py-6">Payment Status</th>
                <th className="px-8 py-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/5">
              {pos.map((po) => (
                <tr key={po.id} className="hover:bg-[#F5F5F5]/50 transition-all">
                  <td className="px-8 py-8 font-bold text-[#141414]">PO-{po.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#141414] text-white rounded-lg flex items-center justify-center text-xs font-bold">
                        {po.vendorName?.charAt(0)}
                      </div>
                      <span className="font-medium text-[#141414]">{po.vendorName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-8 font-bold text-[#141414]">${po.totalAmount?.toLocaleString()}</td>
                  <td className="px-8 py-8 text-sm text-[#141414]/60">{new Date(po.createdAt).toLocaleDateString()}</td>
                  <td className="px-8 py-8">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      po.paymentStatus === 'paid' ? "bg-green-50 text-green-600" : 
                      po.paymentStatus === 'partially paid' ? "bg-orange-50 text-orange-600" : 
                      "bg-red-50 text-red-600"
                    )}>
                      {po.paymentStatus || 'unpaid'}
                    </span>
                  </td>
                  <td className="px-8 py-8">
                    <button className="text-xs font-bold text-[#141414] hover:underline">View Details</button>
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
