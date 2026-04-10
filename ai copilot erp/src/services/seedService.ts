import { db } from '../firebase';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';

export async function seedInitialData() {
  const collections = ['vendors', 'inventory', 'rfqs', 'quotes', 'purchaseOrders'];
  
  // Check if already seeded
  const vendorSnap = await getDocs(query(collection(db, 'vendors'), limit(1)));
  if (!vendorSnap.empty) {
    console.log('Database already has data. Skipping seed.');
    return;
  }

  console.log('Seeding initial data...');

  // 1. Seed Vendors
  const vendorData = [
    { name: 'Global Tech Solutions', category: 'Electronics', email: 'sales@globaltech.com', rating: 4.8, trustScore: 95, qualityScore: 92, responseSpeed: 88, createdAt: new Date().toISOString() },
    { name: 'Industrial Prime Corp', category: 'Raw Materials', email: 'info@industrialprime.in', rating: 4.2, trustScore: 85, qualityScore: 88, responseSpeed: 75, createdAt: new Date().toISOString() },
    { name: 'Swift Logistics & Parts', category: 'Automotive', email: 'orders@swiftparts.com', rating: 4.5, trustScore: 90, qualityScore: 85, responseSpeed: 95, createdAt: new Date().toISOString() }
  ];

  const vendorIds: string[] = [];
  for (const v of vendorData) {
    const docRef = await addDoc(collection(db, 'vendors'), v);
    vendorIds.push(docRef.id);
  }

  // 2. Seed Inventory
  const inventoryData = [
    { name: 'Microprocessor X1', currentStock: 45, reorderLevel: 100, dailyUsage: 5, leadTime: 7 },
    { name: 'Steel Sheets (Grade A)', currentStock: 1200, reorderLevel: 500, dailyUsage: 50, leadTime: 14 },
    { name: 'Lithium Battery Pack', currentStock: 15, reorderLevel: 50, dailyUsage: 2, leadTime: 21 }
  ];

  for (const i of inventoryData) {
    await addDoc(collection(db, 'inventory'), i);
  }

  // 3. Seed RFQs
  const rfqData = [
    { itemName: 'Microprocessor X1', quantity: 200, requiredDate: '2026-05-01', priority: 'high', status: 'open', assignedVendors: [vendorIds[0]], createdAt: new Date().toISOString() },
    { itemName: 'Lithium Battery Pack', quantity: 100, requiredDate: '2026-05-15', priority: 'medium', status: 'open', assignedVendors: [vendorIds[0], vendorIds[2]], createdAt: new Date().toISOString() }
  ];

  for (const r of rfqData) {
    await addDoc(collection(db, 'rfqs'), r);
  }

  console.log('Seeding complete!');
}
