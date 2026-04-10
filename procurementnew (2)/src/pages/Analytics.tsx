import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon, 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const COLORS = ['#141414', '#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export default function Analytics() {
  const [pos, setPos] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubPos = onSnapshot(collection(db, 'purchaseOrders'), (snapshot) => {
      setPos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'purchaseOrders'));

    const unsubVendors = onSnapshot(collection(db, 'vendors'), (snapshot) => {
      setVendors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'vendors'));

    const unsubInventory = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'inventory'));

    setLoading(false);
    return () => {
      unsubPos();
      unsubVendors();
      unsubInventory();
    };
  }, []);

  // Prepare data for charts
  const spendByMonth = [
    { name: 'Jan', amount: 45000 },
    { name: 'Feb', amount: 52000 },
    { name: 'Mar', amount: 48000 },
    { name: 'Apr', amount: 61000 },
    { name: 'May', amount: 55000 },
    { name: 'Jun', amount: 67000 },
  ];

  const vendorPerformance = vendors.map(v => ({
    name: v.name,
    score: v.trustScore || 0,
    delivery: v.deliverySuccessRate || 0,
    quality: v.qualityScore || 0
  })).slice(0, 5);

  const inventoryStatus = [
    { name: 'In Stock', value: inventory.filter(i => i.currentStock > i.reorderLevel).length },
    { name: 'Low Stock', value: inventory.filter(i => i.currentStock <= i.reorderLevel).length },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#141414]">Procurement Analytics</h1>
          <p className="text-[#141414]/60 mt-1 font-medium italic serif">Advanced data visualization and trend analysis.</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-[#141414]/10">
          <button className="px-4 py-2 bg-[#141414] text-white rounded-lg text-xs font-bold">Last 6 Months</button>
          <button className="px-4 py-2 hover:bg-[#F5F5F5] rounded-lg text-xs font-bold text-[#141414]/40 transition-all">Year to Date</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spend Trend */}
        <div className="bg-white p-8 rounded-[40px] border border-[#141414]/10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-[#141414] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" /> Monthly Spend Trend
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendByMonth}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#141414" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#141414" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#14141440'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#14141440'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="amount" stroke="#141414" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor Performance */}
        <div className="bg-white p-8 rounded-[40px] border border-[#141414]/10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-[#141414] flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" /> Top Vendor Performance
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F5F5F5" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#141414'}} width={100} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="score" fill="#141414" radius={[0, 10, 10, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Distribution */}
        <div className="bg-white p-8 rounded-[40px] border border-[#141414]/10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-[#141414] flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" /> Stock Health
            </h3>
          </div>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {inventoryStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#EF4444'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PO Status */}
        <div className="bg-white p-8 rounded-[40px] border border-[#141414]/10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-[#141414] flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-purple-600" /> Purchase Order Trends
            </h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spendByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#14141440'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#14141440'}} />
                <Tooltip />
                <Line type="stepAfter" dataKey="amount" stroke="#4F46E5" strokeWidth={3} dot={{ r: 6, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
