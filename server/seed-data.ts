import { db } from "./db";
import { animals, healthRecords, breedingRecords, transactions, inventory, equipment, documents, maintenanceRecords } from "@shared/schema";

export async function seedDatabase(userId: string) {
  try {
    // Seed Animals
    const animalData = [
      {
        userId,
        tagId: "COW001",
        name: "Bessie",
        species: "Cattle",
        breed: "Holstein",
        gender: "female",
        birthDate: "2020-03-15",
        dateAcquired: "2020-03-20",
        status: "healthy",
        location: "North Pasture",
        weight: 1200,
        description: "Prime breeding cow, excellent milk production"
      },
      {
        userId,
        tagId: "COW002",
        name: "Thunder",
        species: "Cattle",
        breed: "Angus",
        gender: "male",
        birthDate: "2019-05-10",
        dateAcquired: "2019-05-15",
        status: "healthy",
        location: "South Pasture",
        weight: 1800,
        description: "Breeding bull, strong genetics"
      },
      {
        userId,
        tagId: "SH001",
        name: "Woolly",
        species: "Sheep",
        breed: "Merino",
        gender: "female",
        birthDate: "2021-02-08",
        dateAcquired: "2021-02-10",
        status: "healthy",
        location: "Sheep Pen",
        weight: 180,
        description: "High-quality wool producer"
      },
      {
        userId,
        tagId: "PIG001",
        name: "Porky",
        species: "Pigs",
        breed: "Yorkshire",
        gender: "male",
        birthDate: "2023-01-12",
        dateAcquired: "2023-01-15",
        status: "healthy",
        location: "Pig Pen",
        weight: 250,
        description: "Fast-growing pig for meat production"
      },
      {
        userId,
        tagId: "CH001",
        name: "Henrietta",
        species: "Chickens",
        breed: "Rhode Island Red",
        gender: "female",
        birthDate: "2023-03-20",
        dateAcquired: "2023-03-22",
        status: "healthy",
        location: "Chicken Coop",
        weight: 6,
        description: "Excellent egg layer"
      }
    ];

    const createdAnimals = await db.insert(animals).values(animalData).returning();

    // Seed Health Records
    const healthData = [
      {
        userId,
        animalId: createdAnimals[0].id,
        type: "vaccination",
        description: "Annual vaccination - BVDV, IBR, PI3",
        treatmentDate: "2024-01-15",
        veterinarian: "Dr. Sarah Johnson",
        cost: 45.00,
        notes: "No adverse reactions observed"
      },
      {
        userId,
        animalId: createdAnimals[1].id,
        type: "checkup",
        description: "Routine health examination",
        treatmentDate: "2024-02-10",
        veterinarian: "Dr. Sarah Johnson",
        cost: 85.00,
        notes: "Excellent overall health"
      },
      {
        userId,
        animalId: createdAnimals[2].id,
        type: "treatment",
        description: "Hoof trimming and care",
        treatmentDate: "2024-03-05",
        veterinarian: "Dr. Mike Wilson",
        cost: 35.00,
        notes: "Preventive care completed"
      }
    ];

    await db.insert(healthRecords).values(healthData);

    // Seed Breeding Records
    const breedingData = [
      {
        userId,
        maleId: createdAnimals[1].id,
        femaleId: createdAnimals[0].id,
        breedingDate: "2024-01-20",
        expectedDueDate: "2024-10-15",
        status: "pregnant",
        notes: "First breeding for this pair"
      }
    ];

    await db.insert(breedingRecords).values(breedingData);

    // Seed Transactions
    const transactionData = [
      {
        userId,
        type: "income",
        category: "Livestock Sales",
        amount: 2500.00,
        description: "Sold 2 calves at local market",
        date: "2024-01-10"
      },
      {
        userId,
        type: "income",
        category: "Dairy Products",
        amount: 850.00,
        description: "Monthly milk sales to local dairy",
        date: "2024-01-31"
      },
      {
        userId,
        type: "expense",
        category: "Feed & Nutrition",
        amount: 1200.00,
        description: "Hay and grain purchase for winter",
        date: "2024-01-05"
      },
      {
        userId,
        type: "expense",
        category: "Veterinary & Health",
        amount: 165.00,
        description: "Vaccination and health check costs",
        date: "2024-01-15"
      },
      {
        userId,
        type: "expense",
        category: "Equipment & Machinery",
        amount: 450.00,
        description: "Tractor maintenance and repairs",
        date: "2024-01-20"
      },
      {
        userId,
        type: "income",
        category: "Crop Sales",
        amount: 3200.00,
        description: "Corn harvest sales",
        date: "2024-02-01"
      },
      {
        userId,
        type: "expense",
        category: "Utilities & Fuel",
        amount: 380.00,
        description: "Electricity and fuel costs",
        date: "2024-02-05"
      }
    ];

    await db.insert(transactions).values(transactionData);

    // Seed Inventory
    const inventoryData = [
      {
        userId,
        name: "Alfalfa Hay",
        category: "Feed & Nutrition",
        quantity: 45,
        unit: "bales",
        lowStockThreshold: 10,
        costPerUnit: 12.50,
        supplier: "Green Valley Farm Supply",
        location: "Hay Barn",
        description: "High-quality alfalfa hay for cattle"
      },
      {
        userId,
        name: "Corn Feed",
        category: "Feed & Nutrition",
        quantity: 2000,
        unit: "lbs",
        lowStockThreshold: 500,
        costPerUnit: 0.18,
        supplier: "Midwest Grain Co",
        location: "Feed Storage",
        description: "Cracked corn for livestock feeding"
      },
      {
        userId,
        name: "Cattle Vaccine (BVDV)",
        category: "Veterinary Supplies",
        quantity: 8,
        unit: "doses",
        lowStockThreshold: 3,
        costPerUnit: 5.25,
        supplier: "VetMed Supply",
        location: "Medical Cabinet",
        expirationDate: "2025-06-30",
        description: "BVDV vaccination for cattle"
      },
      {
        userId,
        name: "Barbed Wire",
        category: "Equipment & Tools",
        quantity: 500,
        unit: "feet",
        lowStockThreshold: 100,
        costPerUnit: 0.45,
        supplier: "Ranch Supply Co",
        location: "Equipment Shed",
        description: "Heavy-duty barbed wire for fencing"
      },
      {
        userId,
        name: "Mineral Supplements",
        category: "Feed & Nutrition",
        quantity: 12,
        unit: "bags",
        lowStockThreshold: 3,
        costPerUnit: 28.75,
        supplier: "Livestock Nutrition Inc",
        location: "Feed Storage",
        description: "Essential mineral supplements for cattle"
      },
      {
        userId,
        name: "Bedding Straw",
        category: "Bedding & Supplies",
        quantity: 20,
        unit: "bales",
        lowStockThreshold: 5,
        costPerUnit: 8.00,
        supplier: "Local Straw Supply",
        location: "Barn Storage",
        description: "Clean straw for animal bedding"
      }
    ];

    await db.insert(inventory).values(inventoryData);

    // Seed Equipment
    const equipmentData = [
      {
        userId,
        name: "John Deere 5075E",
        type: "Tractors",
        model: "5075E",
        manufacturer: "John Deere",
        serialNumber: "JD5075E2020001",
        status: "operational",
        location: "Equipment Shed",
        purchaseDate: "2020-04-15",
        purchasePrice: 45000.00,
        currentValue: 38000.00,
        description: "75HP utility tractor for general farm work"
      },
      {
        userId,
        name: "Bush Hog Rotary Cutter",
        type: "Mowers",
        model: "RDH2084",
        manufacturer: "Bush Hog",
        serialNumber: "BH2084-2019-456",
        status: "operational",
        location: "Implement Barn",
        purchaseDate: "2019-06-20",
        purchasePrice: 8500.00,
        currentValue: 6800.00,
        description: "84-inch rotary cutter for pasture maintenance"
      },
      {
        userId,
        name: "Kubota Hay Baler",
        type: "Balers",
        model: "BV5160",
        manufacturer: "Kubota",
        serialNumber: "KB5160-2021-789",
        status: "maintenance",
        location: "Equipment Shed",
        purchaseDate: "2021-05-10",
        purchasePrice: 28000.00,
        currentValue: 24000.00,
        description: "Round baler for hay production"
      },
      {
        userId,
        name: "Fertilizer Spreader",
        type: "Sprayers",
        model: "FS2000",
        manufacturer: "Ag-Pro",
        serialNumber: "AP2000-2022-123",
        status: "operational",
        location: "Implement Barn",
        purchaseDate: "2022-03-08",
        purchasePrice: 12000.00,
        currentValue: 10500.00,
        description: "Pull-type fertilizer spreader"
      },
      {
        userId,
        name: "Livestock Trailer",
        type: "Trailers",
        model: "LT2450",
        manufacturer: "Titan",
        serialNumber: "TT2450-2023-001",
        status: "operational",
        location: "Equipment Yard",
        purchaseDate: "2023-01-15",
        purchasePrice: 15000.00,
        currentValue: 14200.00,
        description: "24-foot livestock trailer for animal transport"
      }
    ];

    const createdEquipment = await db.insert(equipment).values(equipmentData).returning();

    // Seed Maintenance Records
    const maintenanceData = [
      {
        userId,
        equipmentId: createdEquipment[0].id,
        type: "routine",
        description: "Oil change and filter replacement",
        date: "2024-01-20",
        cost: 85.00,
        performedBy: "Ranch Maintenance Team",
        nextDueDate: "2024-04-20",
        notes: "Used synthetic oil, changed hydraulic filter"
      },
      {
        userId,
        equipmentId: createdEquipment[2].id,
        type: "repair",
        description: "Belt replacement and tension adjustment",
        date: "2024-02-15",
        cost: 150.00,
        performedBy: "Kubota Service Center",
        nextDueDate: "2024-08-15",
        notes: "Replaced main drive belt, adjusted tension"
      },
      {
        userId,
        equipmentId: createdEquipment[1].id,
        type: "routine",
        description: "Blade sharpening and deck cleaning",
        date: "2024-03-01",
        cost: 75.00,
        performedBy: "Local Implement Shop",
        nextDueDate: "2024-09-01",
        notes: "Sharpened all blades, cleaned cutting deck"
      }
    ];

    await db.insert(maintenanceRecords).values(maintenanceData);

    // Seed Documents
    const documentData = [
      {
        userId,
        title: "Cattle Health Certificates",
        type: "health",
        category: "Animal Health",
        description: "Official health certificates for cattle herd",
        filePath: "/documents/cattle-health-cert-2024.pdf",
        fileSize: 1250000,
        uploadDate: "2024-01-10",
        expiryDate: "2025-01-10",
        tags: ["cattle", "health", "certificates", "official"]
      },
      {
        userId,
        title: "Feed Purchase Receipts",
        type: "receipt",
        category: "Financial",
        description: "Receipts for feed and nutrition purchases",
        filePath: "/documents/feed-receipts-jan-2024.pdf",
        fileSize: 850000,
        uploadDate: "2024-01-25",
        tags: ["feed", "receipts", "financial", "purchases"]
      },
      {
        userId,
        title: "Equipment Warranty - Tractor",
        type: "warranty",
        category: "Equipment",
        description: "Warranty documentation for John Deere tractor",
        filePath: "/documents/jd-tractor-warranty.pdf",
        fileSize: 650000,
        uploadDate: "2020-04-20",
        expiryDate: "2025-04-20",
        tags: ["tractor", "warranty", "john deere", "equipment"]
      },
      {
        userId,
        title: "Pasture Rotation Plan",
        type: "plan",
        category: "Operations",
        description: "Seasonal pasture rotation schedule and plan",
        filePath: "/documents/pasture-rotation-2024.pdf",
        fileSize: 1150000,
        uploadDate: "2024-02-01",
        tags: ["pasture", "rotation", "plan", "grazing"]
      },
      {
        userId,
        title: "Insurance Policy - Livestock",
        type: "insurance",
        category: "Legal",
        description: "Livestock insurance policy documentation",
        filePath: "/documents/livestock-insurance-2024.pdf",
        fileSize: 980000,
        uploadDate: "2024-01-05",
        expiryDate: "2025-01-05",
        tags: ["insurance", "livestock", "policy", "legal"]
      }
    ];

    await db.insert(documents).values(documentData);

    console.log("Database seeded successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    return false;
  }
}