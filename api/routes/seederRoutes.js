const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { Employee, ShopConfig, Category, Menu, Ingredient, ShiftSchedule } = require('../models');

/**
 * Core seeding logic exported for conditional use on startup
 */
const seedDatabase = async () => {
    console.log("Seeding database...");

    // 1. Employees: Find or Create the 5 core roles
    const requiredRoles = ['Manager', 'Barista', 'Cashier', 'Kitchen Staff', 'Waiter'];
    const staffList = [];

    for (const roleName of requiredRoles) {
        // Try to find an existing employee for this role
        let emp = await Employee.findOne({ role: { $regex: new RegExp(roleName, 'i') } });
        
        if (!emp) {
            console.log(`Role ${roleName} not found. Creating default...`);
            const defaultId = `EMP-${roleName.substring(0, 3).toUpperCase()}-001`;
            emp = new Employee({
                employeeId: defaultId,
                name: `Default ${roleName}`,
                username: roleName.toLowerCase().replace(' ', ''),
                password: await bcrypt.hash("password123", 10),
                pin: "1234",
                role: roleName,
                position: roleName,
                email: `${roleName.toLowerCase().replace(' ', '')}@americano.com`,
                phone: "+62 821 0000 0000",
                active: true,
                salary: 3000.0,
                attendanceRecord: []
            });
            await emp.save();
        }
        staffList.push(emp);
    }

    // 2. Categories
    // We can keep wiping these as they are static config
    await Category.deleteMany({});
    await new Category({ name: "COFFEE", description: "All espresso based coffee" }).save();
    await new Category({ name: "NON-COFFEE", description: "Teas and chocolates" }).save();
    await new Category({ name: "FOOD", description: "Snacks and meals" }).save();

    // 3. Menus
    await Menu.deleteMany({});
    await new Menu({
        name: "Caffe Americano", category: "COFFEE", price: 25.0,
        available: true,
        description: "Classic Americano with rich espresso shots.",
        imageUrl: "https://images.unsplash.com/photo-1551030173-122aabc4489c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        gallery: []
    }).save();
    await new Menu({
        name: "Cappuccino", category: "COFFEE", price: 30.0,
        available: true,
        description: "Smooth espresso blended with steamed milk and foam.",
        imageUrl: "https://images.unsplash.com/photo-1534778101976-62847782c213?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        gallery: []
    }).save();
    await new Menu({
        name: "Matcha Latte", category: "NON-COFFEE", price: 35.0,
        available: true,
        description: "Premium Japanese green tea with steamed milk.",
        imageUrl: "https://images.unsplash.com/photo-1536514072410-5019a3c69182?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        gallery: []
    }).save();
    await new Menu({
        name: "Croissant", category: "FOOD", price: 20.0,
        available: true,
        description: "Flaky, buttery pastry baked fresh daily.",
        imageUrl: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        gallery: []
    }).save();

    // 4. ShopConfig
    await ShopConfig.deleteMany({});
    const config = new ShopConfig({
        shopName: "Siap Nyafe",
        websiteTitle: "Siap Nyafe - Coffee Shop",
        phoneNumber: "0812-3456-7890",
        address: "Jl. Sudirman No 123",
        latestDropPromoTitle: "Promo 11.11",
        latestDropPromoDesc: "Diskon 50% untuk semua variant kopi! Jangan sampai ketinggalan promo menarik ini. Spesial di bulan November.",
        latestDropPromoDate: "2024-11-11",
        latestDropNewsTitle: "Penghargaan Coffee Shop Terbaik 2024",
        latestDropNewsDesc: "Kami baru saja memenangkan penghargaan Coffee Shop Terbaik se-Jakarta! Terima kasih atas dukungan kalian.",
        latestDropEventTitle: "Live Music Night",
        latestDropEventDesc: "Saksikan penampilan special dari Kahitna di cabang Sudirman, Jumat depan mulai jam 7 malam.",
        marqueeText: "WELCOME TO SIAP NYAFE | BEST COFFEE IN TOWN | OPEN DAILY 07:00 - 23:00 | FREE WIFI",
        infoTitle: "TENTANG SIAP NYAFE",
        infoContent: "Siap Nyafe berdiri pada tahun 2023 dengan misi menyediakan kopi terbaik dan tempat paling nyaman.",
        infoFooter1: "Siap Nyafe © 2024. All rights reserved.",
        infoFooter2: "Designed by Widi",
        techSpec1: "Arabica Beans 100%",
        techSpec2: "La Marzocco Espresso Machine",
        techSpec3: "V60 & Chemex Availability",
        heroImageUrl: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
        badgeText1: "Premium Beans",
        badgeText2: "Cozy Space"
    });
    await config.save();

    // 5. Shift Schedule: Wiped and regenerated safely
    await ShiftSchedule.deleteMany({});
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const shiftTypes = ['MORNING', 'AFTERNOON', 'EVENING'];

    const shiftEntries = [];
    for (const day of days) {
        for (const shiftType of shiftTypes) {
            // Assign ALL 5 staff (matching the 5 roles) to EVERY shift
            for (const emp of staffList) {
                shiftEntries.push({
                    employeeId: emp.employeeId,
                    employeeName: emp.name,
                    role: emp.role,
                    position: emp.position || emp.role,
                    dayOfWeek: day,
                    shiftType: shiftType
                });
            }
        }
    }
    await ShiftSchedule.insertMany(shiftEntries);
    return true;
};

router.post('/run', async (req, res) => {
    try {
        await seedDatabase();
        res.json({ message: "Seeding completed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = { router, seedDatabase };
