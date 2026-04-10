import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle2, 
  Truck, 
  PackageCheck,
  Search,
  Download,
  MoreVertical,
  IndianRupee,
  CreditCard,
  Sparkles,
  Send,
  X,
  Bot,
  User as UserIcon,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";

export default function PurchaseOrders() {
  const [pos, setPos] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: 'Hello! I am your ProcureMind AI assistant. I can help you analyze quotes, track inventory, and draft purchase orders. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const qPos = query(collection(db, 'purchaseOrders'), orderBy('createdAt', 'desc'));
    const unsubscribePos = onSnapshot(qPos, (snapshot) => {
      setPos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'purchaseOrders'));

    const unsubscribeVendors = onSnapshot(collection(db, 'vendors'), (snapshot) => {
      setVendors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'vendors'));

    const unsubscribeQuotes = onSnapshot(collection(db, 'quotes'), (snapshot) => {
      setQuotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'quotes'));

    return () => {
      unsubscribePos();
      unsubscribeVendors();
      unsubscribeQuotes();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages]);

  const getVendorName = (vendorId: string) => vendors.find(v => v.id === vendorId)?.name || 'Unknown Vendor';
  const getQuoteDetails = (quoteId: string) => quotes.find(q => q.id === quoteId);

  const updatePoStatus = async (poId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'purchaseOrders', poId), {
        status: newStatus
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'purchaseOrders');
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput('');
    setAiMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is not configured. Please add it in the Settings menu.');
      }
      const ai = new GoogleGenAI({ apiKey });
      const context = `
        You are ProcureMind AI, an expert procurement assistant.
        Current Data Context:
        - Vendors: ${JSON.stringify(vendors.map(v => ({ name: v.name, category: v.category, rating: v.rating })))}
        - Recent Quotes: ${JSON.stringify(quotes.slice(0, 5).map(q => ({ item: q.itemName, price: q.price, vendor: q.vendorName })))}
        - Active POs: ${pos.length}
        
        Help the user with procurement tasks. Be professional, concise, and data-driven.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: context }] },
          ...aiMessages.map(m => ({ role: m.role === 'ai' ? 'model' : 'user', parts: [{ text: m.content }] })),
          { role: 'user', parts: [{ text: userMsg }] }
        ]
      });

      setAiMessages(prev => [...prev, { role: 'ai', content: response.text || "I'm sorry, I couldn't process that request." }]);
    } catch (error) {
      console.error('AI Error:', error);
      setAiMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble connecting to my brain right now. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* AI Assistant Toggle */}
      <button 
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-8 right-8 bg-[#141414] text-white p-4 rounded-2xl shadow-2xl hover:scale-110 transition-all z-50 flex items-center gap-2 group"
      >
        <Sparkles className="w-6 h-6 text-orange-400 group-hover:animate-pulse" />
        <span className="font-bold pr-2">AI Assistant</span>
      </button>

      {/* AI Side Panel */}
      {isAiOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.1)] z-[60] flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-6 border-b border-[#141414]/10 flex items-center justify-between bg-[#141414] text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-[#141414]" />
              </div>
              <div>
                <h3 className="font-bold">ProcureMind AI</h3>
                <p className="text-[10px] uppercase tracking-widest opacity-60">Procurement Expert</p>
              </div>
            </div>
            <button onClick={() => setIsAiOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {aiMessages.map((msg, i) => (
              <div key={i} className={cn(
                "flex gap-3",
                msg.role === 'user' ? "flex-row-reverse" : ""
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  msg.role === 'ai' ? "bg-orange-100 text-orange-600" : "bg-[#F5F5F5] text-[#141414]/40"
                )}>
                  {msg.role === 'ai' ? <Bot className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'ai' ? "bg-orange-50 text-[#141414]" : "bg-[#F5F5F5] text-[#141414]"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 rounded-2xl bg-orange-50 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                  <span className="text-xs font-medium text-orange-600">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 border-t border-[#141414]/10">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask AI anything..."
                className="w-full bg-[#F5F5F5] border-none rounded-xl py-4 pl-5 pr-14 outline-none focus:ring-2 focus:ring-[#141414]/5 transition-all font-medium"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-2 p-2 bg-[#141414] text-white rounded-lg hover:bg-[#141414]/90 transition-all disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#141414]">Purchase Orders</h1>
          <p className="text-[#141414]/60 mt-1 font-medium italic serif">Track procurement fulfillment and financial settlements.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-[#141414] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#141414]/90 transition-all">
            <Download className="w-5 h-5" /> Export All POs
          </button>
        </div>
      </div>

      {/* PO List */}
      <div className="bg-white rounded-[40px] border border-[#141414]/10 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-[#141414]/10 flex items-center justify-between">
          <div className="flex items-center gap-4 bg-[#F5F5F5] px-4 py-2 rounded-full w-80">
            <Search className="w-4 h-4 text-[#141414]/40" />
            <input type="text" placeholder="Search POs..." className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F5F5F5] text-[10px] uppercase tracking-widest font-bold text-[#141414]/40">
                <th className="px-8 py-6">PO Details</th>
                <th className="px-8 py-6">Vendor</th>
                <th className="px-8 py-6">Amount</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Finance</th>
                <th className="px-8 py-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]/5">
              {pos.map((po) => {
                const quote = getQuoteDetails(po.quoteId);
                return (
                  <tr key={po.id} className="hover:bg-[#F5F5F5]/50 transition-all group">
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#F5F5F5] rounded-2xl flex items-center justify-center">
                          <ShoppingCart className="w-6 h-6 text-[#141414]/40" />
                        </div>
                        <div>
                          <p className="font-bold text-[#141414]">PO-{po.id.substring(0, 8).toUpperCase()}</p>
                          <p className="text-[10px] text-[#141414]/40 font-bold uppercase tracking-widest">Item: {po.itemName || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <p className="font-bold text-[#141414]">{getVendorName(po.vendorId)}</p>
                      <p className="text-[10px] text-[#141414]/40 font-bold uppercase tracking-widest">Created: {new Date(po.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-1 text-lg font-bold text-[#141414]">
                        <IndianRupee className="w-4 h-4 text-[#141414]/40" />
                        {po.totalAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="space-y-3 min-w-[160px]">
                        <div className={cn(
                          "flex items-center gap-2 font-bold text-sm",
                          po.status === 'pending' ? "text-orange-600" : 
                          po.status === 'delivered' ? "text-green-600" : "text-blue-600"
                        )}>
                          {po.status === 'pending' && <Clock className="w-4 h-4" />}
                          {po.status === 'confirmed' && <CheckCircle2 className="w-4 h-4" />}
                          {po.status === 'shipped' && <Truck className="w-4 h-4" />}
                          {po.status === 'delivered' && <PackageCheck className="w-4 h-4" />}
                          {po.status.toUpperCase()}
                        </div>
                        <div className="h-1.5 w-full bg-[#F5F5F5] rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full transition-all duration-500 rounded-full",
                              po.status === 'pending' ? "bg-orange-500" : 
                              po.status === 'delivered' ? "bg-green-500" : "bg-blue-500"
                            )}
                            style={{ 
                              width: `${
                                po.status === 'pending' ? 25 : 
                                po.status === 'confirmed' ? 50 : 
                                po.status === 'shipped' ? 75 : 
                                po.status === 'delivered' ? 100 : 10
                              }%` 
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 w-fit",
                        po.paymentStatus === 'paid' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                      )}>
                        <CreditCard className="w-3 h-3" /> {po.paymentStatus || 'unpaid'}
                      </span>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-2">
                        <div className="relative group/actions">
                          <button className="p-2 hover:bg-white rounded-lg transition-all border border-transparent hover:border-[#141414]/10">
                            <MoreVertical className="w-4 h-4 text-[#141414]/40" />
                          </button>
                          <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-2xl shadow-2xl border border-[#141414]/10 opacity-0 invisible group-hover/actions:opacity-100 group-hover/actions:visible transition-all z-10 overflow-hidden">
                            <div className="p-2 space-y-1">
                              {['pending', 'confirmed', 'shipped', 'delivered'].map((status) => (
                                <button
                                  key={status}
                                  onClick={() => updatePoStatus(po.id, status)}
                                  className={cn(
                                    "w-full text-left px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                                    po.status === status ? "bg-[#141414] text-white" : "hover:bg-[#F5F5F5] text-[#141414]/60"
                                  )}
                                >
                                  Mark as {status}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-white rounded-lg transition-all border border-transparent hover:border-[#141414]/10">
                          <Download className="w-4 h-4 text-[#141414]/40" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
