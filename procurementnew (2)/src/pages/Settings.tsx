import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Database, 
  Cpu,
  Save,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'integrations', name: 'Integrations', icon: Globe },
    { id: 'ai-config', name: 'AI Engine', icon: Cpu },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#141414]">System Settings</h1>
          <p className="text-[#141414]/60 mt-1 font-medium italic serif">Configure your procurement workspace and AI preferences.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                activeTab === tab.id 
                  ? "bg-[#141414] text-white" 
                  : "bg-white text-[#141414]/60 hover:bg-[#F5F5F5]"
              )}
            >
              <div className="flex items-center gap-3">
                <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-white" : "text-[#141414]/40 group-hover:text-[#141414]")} />
                <span className="font-bold text-sm">{tab.name}</span>
              </div>
              <ChevronRight className={cn("w-4 h-4 opacity-0 transition-all", activeTab === tab.id && "opacity-100")} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white p-10 rounded-[40px] border border-[#141414]/10 shadow-sm">
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div className="flex items-center gap-6 pb-8 border-b border-[#141414]/5">
                <div className="w-24 h-24 bg-[#141414] rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  JD
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#141414]">John Doe</h3>
                  <p className="text-sm text-[#141414]/40 font-medium">Head of Procurement • Admin</p>
                  <button className="mt-4 px-4 py-2 bg-[#F5F5F5] rounded-lg text-xs font-bold hover:bg-[#141414]/5 transition-all">Change Avatar</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Full Name</label>
                  <input type="text" defaultValue="John Doe" className="w-full px-5 py-3 bg-[#F5F5F5] rounded-xl outline-none font-bold text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-2">Email Address</label>
                  <input type="email" defaultValue="john.doe@procuremind.ai" className="w-full px-5 py-3 bg-[#F5F5F5] rounded-xl outline-none font-bold text-sm" />
                </div>
              </div>

              <div className="pt-8">
                <button className="bg-[#141414] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-[#141414]/90 transition-all">
                  <Save className="w-5 h-5" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ai-config' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-[#141414] mb-2">AI Recommendation Engine</h3>
                <p className="text-sm text-[#141414]/40 font-medium">Adjust the weights used by the AI to score vendor quotations.</p>
              </div>

              <div className="space-y-6">
                {[
                  { name: 'Cost Weight', value: 40 },
                  { name: 'Delivery Speed', value: 25 },
                  { name: 'Quality Score', value: 20 },
                  { name: 'Vendor Trust', value: 15 },
                ].map((weight) => (
                  <div key={weight.name}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-[#141414]">{weight.name}</span>
                      <span className="text-sm font-bold text-[#141414]">{weight.value}%</span>
                    </div>
                    <div className="h-2 bg-[#F5F5F5] rounded-full overflow-hidden">
                      <div className="h-full bg-[#141414] rounded-full" style={{ width: `${weight.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100">
                <div className="flex items-center gap-3 mb-2 text-purple-600">
                  <Cpu className="w-5 h-5" />
                  <span className="font-bold text-sm uppercase tracking-widest">Smart Context Mode</span>
                </div>
                <p className="text-sm text-purple-600/80 font-medium">
                  When enabled, the AI will automatically increase "Delivery Speed" weight for RFQs marked as "High Priority".
                </p>
              </div>

              <div className="pt-8">
                <button className="bg-[#141414] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-[#141414]/90 transition-all">
                  <Save className="w-5 h-5" /> Update Weights
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
