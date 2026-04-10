import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  UserPlus,
  Quote as QuoteIcon,
  BrainCircuit,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { getRecommendationExplanation } from '../services/aiService';

export default function RFQs() {
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState<any>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);

  const [newRfq, setNewRfq] = useState({
    itemName: '',
    quantity: 1,
    requiredDate: '',
    priority: 'medium',
    assignedVendors: [] as string[]
  });

  useEffect(() => {
    const unsubRfqs = onSnapshot(collection(db, 'rfqs'), (snapshot) => {
      setRfqs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'rfqs'));

    const unsubVendors = onSnapshot(collection(db, 'vendors'), (snapshot) => {
      setVendors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'vendors'));

    const unsubQuotes = onSnapshot(collection(db, 'quotes'), (snapshot) => {
      setQuotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'quotes'));

    setLoading(false);
    return () => {
      unsubRfqs();
      unsubVendors();
      unsubQuotes();
    };
  }, []);

  useEffect(() => {
    if (showComparison && selectedRfq) {
      const generateExplanation = async () => {
        setIsGeneratingExplanation(true);
        const rfqQuotes = getQuotesForRfq(selectedRfq.id);
        const explanation = await getRecommendationExplanation(selectedRfq, rfqQuotes);
        setAiExplanation(explanation);
        setIsGeneratingExplanation(false);
      };
      generateExplanation();
    } else {
      setAiExplanation('');
    }
  }, [showComparison, selectedRfq]);

  const handleAddRfq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'rfqs'), {
        ...newRfq,
        status: 'open',
        createdAt: new Date().toISOString()
      });
      setShowAddModal(false);
      setNewRfq({ itemName: '', quantity: 1, requiredDate: '', priority: 'medium', assignedVendors: [] });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'rfqs');
    }
  };

  const getQuotesForRfq = (rfqId: string) => quotes.filter(q => q.rfqId === rfqId);

  const handleAward = async (quote: any) => {
    try {
      // Create PO
      await addDoc(collection(db, 'purchaseOrders'), {
        quoteId: quote.id,
        vendorId: quote.vendorId,
        vendorName: quote.vendorName,
        itemName: selectedRfq.itemName,
        quantity: selectedRfq.quantity,
        unitPrice: quote.price,
        totalAmount: quote.price * selectedRfq.quantity,
        status: 'pending',
        createdAt: new Date().toISOString(),
        deliveryDays: quote.deliveryDays
      });

      // Update RFQ status
      await updateDoc(doc(db, 'rfqs', quote.rfqId), {
        status: 'awarded'
      });

      setShowComparison(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'purchaseOrders');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#141414]">RFQ Management</h1>
          <p className="text-[#141414]/60 mt-1 font-medium italic serif">Request for Quotations lifecycle and vendor selection.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#141414] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#141414]/90 transition-all"
        >
          <Plus className="w-5 h-5" /> Create New RFQ
        </button>
      </div>

      {/* RFQ List */}
      <div className="grid grid-cols-1 gap-6">
        {rfqs.map((rfq) => {
          const rfqQuotes = getQuotesForRfq(rfq.id);
          return (
            <div key={rfq.id} className="bg-white rounded-3xl border border-[#141414]/10 overflow-hidden hover:shadow-lg transition-all group">
              <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center",
                    rfq.status === 'awarded' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                  )}>
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-[#141414]">{rfq.itemName}</h3>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        rfq.priority === 'high' ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-600"
                      )}>
                        {rfq.priority} Priority
                      </span>
                    </div>
                    <p className="text-sm text-[#141414]/40 font-medium">
                      Quantity: <span className="text-[#141414] font-bold">{rfq.quantity}</span> • Required by: <span className="text-[#141414] font-bold">{new Date(rfq.requiredDate).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      {rfq.status === 'awarded' ? (
                        <span className="flex items-center gap-1 text-green-600 font-bold text-sm">
                          <CheckCircle2 className="w-4 h-4" /> Awarded
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-blue-600 font-bold text-sm">
                          <Clock className="w-4 h-4" /> {rfq.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-1">Quotes</p>
                    <p className="text-lg font-bold text-[#141414]">{rfqQuotes.length} / {rfq.assignedVendors.length}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {rfq.status !== 'awarded' && (
                      <button 
                        onClick={() => {
                          setSelectedRfq(rfq);
                          setShowComparison(true);
                        }}
                        disabled={rfqQuotes.length === 0}
                        className="bg-[#141414] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#141414]/90 transition-all disabled:opacity-50"
                      >
                        <BrainCircuit className="w-4 h-4" /> AI Compare
                      </button>
                    )}
                    <button className="p-3 bg-[#F5F5F5] rounded-xl hover:bg-[#141414]/5 transition-all">
                      <ChevronRight className="w-5 h-5 text-[#141414]/40" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add RFQ Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#141414]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-[#141414] mb-8">Create New RFQ</h2>
            <form onSubmit={handleAddRfq} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Item Name</label>
                  <input 
                    type="text" 
                    required
                    value={newRfq.itemName}
                    onChange={e => setNewRfq({...newRfq, itemName: e.target.value})}
                    className="w-full px-5 py-3 bg-[#F5F5F5] border border-transparent focus:border-[#141414] rounded-xl outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Quantity</label>
                  <input 
                    type="number" 
                    required
                    value={newRfq.quantity}
                    onChange={e => setNewRfq({...newRfq, quantity: parseInt(e.target.value)})}
                    className="w-full px-5 py-3 bg-[#F5F5F5] border border-transparent focus:border-[#141414] rounded-xl outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Required Date</label>
                  <input 
                    type="date" 
                    required
                    value={newRfq.requiredDate}
                    onChange={e => setNewRfq({...newRfq, requiredDate: e.target.value})}
                    className="w-full px-5 py-3 bg-[#F5F5F5] border border-transparent focus:border-[#141414] rounded-xl outline-none transition-all font-medium"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Assign Vendors</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-[#F5F5F5] rounded-xl">
                    {vendors.map(v => (
                      <label key={v.id} className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                        <input 
                          type="checkbox" 
                          checked={newRfq.assignedVendors.includes(v.id)}
                          onChange={(e) => {
                            if (e.target.checked) setNewRfq({...newRfq, assignedVendors: [...newRfq.assignedVendors, v.id]});
                            else setNewRfq({...newRfq, assignedVendors: newRfq.assignedVendors.filter(id => id !== v.id)});
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
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-4 border border-[#141414]/10 rounded-xl font-bold hover:bg-[#F5F5F5] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-4 bg-[#141414] text-white rounded-xl font-bold hover:bg-[#141414]/90 transition-all"
                >
                  Create RFQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Comparison Modal */}
      {showComparison && selectedRfq && (
        <div className="fixed inset-0 bg-[#141414]/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F5F5F5] rounded-[40px] w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 duration-500 flex flex-col">
            <div className="p-10 bg-white border-b border-[#141414]/10 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-3xl font-bold text-[#141414]">AI Vendor Comparison</h2>
                  <div className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <BrainCircuit className="w-3 h-3" /> AI Powered
                  </div>
                </div>
                <p className="text-[#141414]/40 font-medium italic serif">Intelligent weighted scoring for {selectedRfq.itemName}</p>
              </div>
              <button 
                onClick={() => setShowComparison(false)}
                className="p-4 hover:bg-[#F5F5F5] rounded-full transition-all"
              >
                <ChevronRight className="w-6 h-6 rotate-90" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              {/* Comparison Table */}
              <div className="bg-white rounded-3xl border border-[#141414]/10 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F5F5F5] text-[10px] uppercase tracking-widest font-bold text-[#141414]/40">
                      <th className="px-8 py-6">Vendor</th>
                      <th className="px-8 py-6">Price / Unit</th>
                      <th className="px-8 py-6">Delivery</th>
                      <th className="px-8 py-6">Risk Score</th>
                      <th className="px-8 py-6">AI Score</th>
                      <th className="px-8 py-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#141414]/5">
                    {getQuotesForRfq(selectedRfq.id).sort((a, b) => b.recommendationScore - a.recommendationScore).map((quote, idx) => (
                      <tr key={quote.id} className={cn("group transition-all", idx === 0 ? "bg-green-50/30" : "hover:bg-[#F5F5F5]/50")}>
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#141414] text-white rounded-xl flex items-center justify-center font-bold">
                              {quote.vendorName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-[#141414]">{quote.vendorName}</p>
                              {idx === 0 && <span className="text-[9px] text-green-600 font-bold uppercase tracking-widest">Top Recommended</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <p className="text-lg font-bold text-[#141414]">${quote.price}</p>
                          <p className="text-[10px] text-[#141414]/40 font-bold uppercase tracking-widest">Total: ${quote.price * quote.quantity}</p>
                        </td>
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-2 text-[#141414] font-bold">
                            <Clock className="w-4 h-4 text-[#141414]/40" /> {quote.deliveryDays} Days
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <div className={cn(
                            "flex items-center gap-2 font-bold",
                            quote.riskScore > 50 ? "text-red-600" : "text-green-600"
                          )}>
                            {quote.riskScore > 50 ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            {quote.riskScore}/100
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full border-4 border-[#141414]/5 flex items-center justify-center relative">
                              <svg className="w-full h-full -rotate-90 absolute">
                                <circle 
                                  cx="24" cy="24" r="20" 
                                  fill="none" stroke="currentColor" strokeWidth="4" 
                                  className="text-[#141414]"
                                  strokeDasharray={125.6}
                                  strokeDashoffset={125.6 * (1 - (quote.recommendationScore || 0) / 100)}
                                />
                              </svg>
                              <span className="text-xs font-bold">{Math.round(quote.recommendationScore)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <button 
                            onClick={() => handleAward(quote)}
                            className={cn(
                              "px-6 py-3 rounded-xl font-bold transition-all",
                              idx === 0 ? "bg-[#141414] text-white hover:bg-[#141414]/90" : "bg-[#F5F5F5] text-[#141414] hover:bg-[#141414]/5"
                            )}
                          >
                            Award PO
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* AI Explanation Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#141414] text-white p-10 rounded-[40px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-10">
                    <BrainCircuit className="w-40 h-40" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <TrendingUp className="text-green-400" /> Why this selection?
                    </h3>
                    <div className="space-y-6">
                      {isGeneratingExplanation ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Generating Explanation...</p>
                        </div>
                      ) : (
                        <p className="text-white/80 leading-relaxed italic serif text-lg">
                          {aiExplanation || "The AI is analyzing the quotes to provide a recommendation..."}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-1">Cost Efficiency</p>
                          <p className="text-xl font-bold">Optimal</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-1">Supply Risk</p>
                          <p className="text-xl font-bold text-green-400">Minimal</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[40px] border border-[#141414]/10">
                  <h3 className="text-2xl font-bold text-[#141414] mb-6 flex items-center gap-3">
                    <ShieldAlert className="text-orange-500" /> Risk Assessment
                  </h3>
                  <div className="space-y-6">
                    {getQuotesForRfq(selectedRfq.id).map((quote) => (
                      <div key={quote.id} className="flex items-center justify-between p-4 bg-[#F5F5F5] rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold shadow-sm">
                            {quote.vendorName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#141414]">{quote.vendorName}</p>
                            <p className="text-[10px] text-[#141414]/40 font-bold uppercase tracking-widest">Risk Level: {quote.riskScore > 50 ? 'High' : 'Low'}</p>
                          </div>
                        </div>
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          quote.riskScore > 50 ? "bg-red-500 animate-pulse" : "bg-green-500"
                        )} />
                      </div>
                    ))}
                    <p className="text-xs text-[#141414]/40 font-medium italic serif">
                      * Risk scores are calculated based on past delivery delays, abnormal pricing, and vendor trust metrics.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
