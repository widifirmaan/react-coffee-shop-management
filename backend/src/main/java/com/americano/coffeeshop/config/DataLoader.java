package com.americano.coffeeshop.config;

import com.americano.coffeeshop.model.*;
import com.americano.coffeeshop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

        private final AttendanceRepository attendanceRepository;
        private final MenuRepository menuRepository;
        private final IngredientRepository ingredientRepository;
        private final EmployeeRepository employeeRepository;
        private final CategoryRepository categoryRepository;
        private final OrderRepository orderRepository;
        private final ShiftScheduleRepository shiftScheduleRepository;
        private final PasswordEncoder passwordEncoder;
        private final ShopConfigRepository shopConfigRepository;
        private final PostRepository postRepository;

        @Override
        public void run(String... args) throws Exception {
                // Check if data exists - DISABLED TO FORCE SEED (User Request)
                /*
                 * if (employeeRepository.count() > 0) {
                 * System.out.println("✅ Database already populated. Skipping data seeding.");
                 * return;
                 * }
                 */

                System.out.println("⚡ Starting Data Seeding...");

                // Clear data
                menuRepository.deleteAll();
                categoryRepository.deleteAll();
                ingredientRepository.deleteAll();
                employeeRepository.deleteAll();
                orderRepository.deleteAll();
                shiftScheduleRepository.deleteAll();
                attendanceRepository.deleteAll();
                shopConfigRepository.deleteAll();
                postRepository.deleteAll();

                seedShopConfig();
                seedCategories();
                seedMenu();
                seedIngredients();
                seedEmployees();
                seedShifts();
                seedAttendance();
                seedOrders();
                seedPosts();

                System.out.println("✅ All Data Seeding Completed Successfully with NEW LOGIC!");
        }

        private void seedPosts() {
                List<Post> posts = new ArrayList<>();

                Post p1 = new Post();
                p1.setTitle("GRAND OPENING PROMO 50% OFF");
                p1.setCategory("PROMO");
                p1.setExcerpt("Celebrate our grand opening with half-price on all coffee items!");
                p1.setContent("<p>Join us for our grand opening week! All coffee beverages are 50% off.</p>");
                p1.setImageUrl("https://images.unsplash.com/photo-1509042239860-f550ce710b93");
                p1.setStatus("PUBLISHED");
                p1.setCreatedAt(LocalDateTime.now().minusDays(5));
                p1.setPublishedAt(LocalDateTime.now().minusDays(5));
                posts.add(p1);

                Post p2 = new Post();
                p2.setTitle("New Seasonal Menu: Sakura Matcha");
                p2.setCategory("NEWS");
                p2.setExcerpt("Experience the taste of spring with our new Sakura Matcha Latte.");
                p2.setContent("<p>Limited time only! Authentic matcha with a hint of cherry blossom.</p>");
                p2.setImageUrl("https://images.unsplash.com/photo-1541167760496-1628856ab772");
                p2.setStatus("PUBLISHED");
                p2.setCreatedAt(LocalDateTime.now().minusDays(2));
                p2.setPublishedAt(LocalDateTime.now().minusDays(2));
                posts.add(p2);

                postRepository.saveAll(posts);
                System.out.println("✓ Blog Posts seeded (" + posts.size() + " items)");
        }

        private void seedShopConfig() {
                ShopConfig config = new ShopConfig();
                config.setShopName("SIAP NYAFE");
                config.setWebsiteTitle("Siap Nyafe Dashboard");
                config.setAddress("Jl. Kopi No. 123, Jakarta Selatan");
                config.setPhoneNumber("0812-3456-7890");
                config.setInstagramUrl("https://instagram.com/siapnyafe");

                config.setTechSpec1("// EST 2026");
                config.setLogoUrl("https://placehold.co/100x100/000000/FFFFFF?text=SN"); // Temporary LogoPlaceholder
                config.setTechSpec2("// JKT_SEL");
                config.setTechSpec3("// V.2.0.FINAL");

                config.setHeroImageUrl("/illustration_hero.png");
                config.setBadgeText1("SIAP");
                config.setBadgeText2("NYAFE");
                config.setMarqueeText("SIAP NYAFE • FRESH BREW • GOOD VIBES • 24/7 OPEN •");

                // Gallery Images
                config.setGalleryImages(Arrays.asList(
                                "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
                                "https://images.unsplash.com/photo-1511920170033-f8396924c348",
                                "https://images.unsplash.com/photo-1521017432531-fbd92d768814",
                                "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
                                "https://images.unsplash.com/photo-1559925393-8be0ec4767c8",
                                "https://images.unsplash.com/photo-1497935586351-b67a49e01000",
                                "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
                                "https://images.unsplash.com/photo-1442512595331-e89e73853f31",
                                "https://images.unsplash.com/photo-1504630083234-14187a9df0f5",
                                "https://images.unsplash.com/photo-1445116572660-236099ec97a0"));

                shopConfigRepository.save(config);
                System.out.println("✓ Shop Config seeded (with new UI fields)");
        }

        private void seedAttendance() {
                List<Employee> activeStaff = employeeRepository.findAll().stream()
                                .filter(e -> e.getPosition().equals("Manager") || e.getUsername().equals("barista")
                                                || e.getUsername().equals("kitchen"))
                                .toList();

                for (Employee emp : activeStaff) {
                        Attendance att = new Attendance();
                        att.setEmployeeId(emp.getEmployeeId());
                        att.setEmployeeName(emp.getName());
                        att.setDate(LocalDate.now());
                        att.setClockInTime(LocalDateTime.now().minusHours(4));
                        att.setStatus("WORKING");
                        att.setCheckInStatus("ON_TIME");
                        att.setHoursWorked(0.0); // Not clocked out yet

                        attendanceRepository.save(att);
                }
                System.out.println("✓ Attendance seeded (" + activeStaff.size() + " active staff)");
        }

        private void seedCategories() {
                List<Category> categories = Arrays.asList(
                                createCategory("Featured", "Special featured items"),
                                createCategory("Coffee", "Premium coffee selections"),
                                createCategory("Non-Coffee", "Delicious non-coffee beverages"),
                                createCategory("Tea", "Premium tea selections"),
                                createCategory("Pastry", "Fresh baked goods"),
                                createCategory("Dessert", "Sweet treats"));
                categoryRepository.saveAll(categories);
                System.out.println("✓ Categories seeded (" + categories.size() + " items)");
        }

        private Category createCategory(String name, String description) {
                Category c = new Category();
                c.setName(name);
                c.setDescription(description);
                return c;
        }

        private void seedMenu() {
                List<Menu> menus = new ArrayList<>();
                // Featured Item
                menus.add(createMenu("Caramel Macchiato", "Featured",
                                "Espresso with vanilla, steamed milk, and caramel drizzle", 45000,
                                "https://images.unsplash.com/photo-1571181805149-2ce0b21e03db",
                                Arrays.asList("https://images.unsplash.com/photo-1571181805149-2ce0b21e03db")));
                // Coffee
                menus.add(createMenu("Espresso", "Coffee", "Rich and bold single shot espresso", 25000,
                                "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04", null));
                menus.add(createMenu("Americano", "Coffee", "Espresso diluted with hot water", 28000,
                                "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd", null));
                menus.add(createMenu("Cappuccino", "Coffee", "Espresso with steamed milk and foam", 35000,
                                "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7", null));
                menus.add(createMenu("Cafe Latte", "Coffee", "Espresso with steamed milk", 38000,
                                "https://images.unsplash.com/photo-1485808191679-5f86510681a2", null));
                menus.add(createMenu("Mocha", "Coffee", "Espresso with chocolate and steamed milk", 42000,
                                "https://images.unsplash.com/photo-1542291026-7eec264c27ff", null));
                menus.add(createMenu("Vietnamese Coffee", "Coffee", "Strong coffee with condensed milk", 32000,
                                "https://images.unsplash.com/photo-1509042239860-f550ce710b93", null));
                // Non-Coffee
                menus.add(createMenu("Matcha Latte", "Non-Coffee", "Japanese green tea with steamed milk", 40000,
                                "https://images.unsplash.com/photo-1536013266800-92e257e33b59", null));
                menus.add(createMenu("Chocolate", "Non-Coffee", "Rich hot chocolate with whipped cream", 35000,
                                "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed", null));
                menus.add(createMenu("Strawberry Smoothie", "Non-Coffee", "Fresh strawberry blended smoothie", 38000,
                                "https://images.unsplash.com/photo-1505252585461-04db1eb84625", null));
                // Tea
                menus.add(createMenu("English Breakfast Tea", "Tea", "Classic black tea blend", 25000,
                                "https://images.unsplash.com/photo-1576092768241-dec231879fc3", null));
                menus.add(createMenu("Green Tea", "Tea", "Premium Japanese green tea", 28000,
                                "https://images.unsplash.com/photo-1556679343-c7306c1976bc", null));
                menus.add(createMenu("Chamomile Tea", "Tea", "Relaxing herbal infusion", 27000,
                                "https://images.unsplash.com/photo-1597481499750-3e6b22637e12", null));
                // Pastry
                menus.add(createMenu("Croissant", "Pastry", "Buttery French pastry", 22000,
                                "https://images.unsplash.com/photo-1555507036-ab1f4038808a", null));
                menus.add(createMenu("Chocolate Croissant", "Pastry", "Croissant filled with dark chocolate", 28000,
                                "https://images.unsplash.com/photo-1530610476181-d83430b64dcd", null));
                menus.add(createMenu("Blueberry Muffin", "Pastry", "Fresh baked muffin with blueberries", 25000,
                                "https://images.unsplash.com/photo-1607958996333-41aef7caefaa", null));
                // Dessert
                menus.add(createMenu("Chocolate Cake", "Dessert", "Rich layered chocolate cake", 35000,
                                "https://images.unsplash.com/photo-1578985545062-69928b1d9587", null));
                menus.add(createMenu("Cheesecake", "Dessert", "Creamy New York style cheesecake", 38000,
                                "https://images.unsplash.com/photo-1533134242989-8f9c9d45dc1a", null));
                menus.add(createMenu("Tiramisu", "Dessert", "Classic Italian coffee-flavored dessert", 42000,
                                "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9", null));

                menuRepository.saveAll(menus);
                System.out.println("✓ Menus seeded (" + menus.size() + " items)");
        }

        private String optimizeUrl(String url) {
                if (url != null && url.contains("images.unsplash.com") && !url.contains("?")) {
                        return url + "?auto=format&fit=crop&w=600&q=80";
                }
                return url;
        }

        private Menu createMenu(String name, String category, String description, int price, String imageUrl,
                        List<String> gallery) {
                Menu m = new Menu();
                m.setName(name);
                m.setCategory(category);
                m.setDescription(description);
                m.setPrice((double) price);
                m.setImageUrl(optimizeUrl(imageUrl));
                if (gallery != null) {
                        m.setGallery(gallery.stream().map(this::optimizeUrl).toList());
                }
                m.setAvailable(true);
                return m;
        }

        private void seedIngredients() {
                List<Ingredient> ingredients = Arrays.asList(
                                createIngredient("Arabica Coffee Beans", 25.0, "kg", 5.0),
                                createIngredient("Robusta Coffee Beans", 20.0, "kg", 5.0),
                                createIngredient("Fresh Milk", 50.0, "liters", 10.0),
                                createIngredient("Whole Milk", 30.0, "liters", 8.0),
                                createIngredient("Almond Milk", 15.0, "liters", 5.0),
                                createIngredient("Sugar", 40.0, "kg", 10.0),
                                createIngredient("Brown Sugar", 20.0, "kg", 5.0),
                                createIngredient("Chocolate Syrup", 10.0, "liters", 2.0),
                                createIngredient("Caramel Syrup", 8.0, "liters", 2.0),
                                createIngredient("Vanilla Syrup", 8.0, "liters", 2.0),
                                createIngredient("Matcha Powder", 3.0, "kg", 1.0),
                                createIngredient("Cocoa Powder", 5.0, "kg", 1.0),
                                createIngredient("Whipped Cream", 15.0, "cans", 5.0),
                                createIngredient("Croissants", 60.0, "pcs", 20.0),
                                createIngredient("Muffins", 45.0, "pcs", 15.0),
                                createIngredient("Cake Slices", 30.0, "pcs", 10.0),
                                createIngredient("Tea Bags", 200.0, "pcs", 50.0),
                                createIngredient("Paper Cups (Small)", 150.0, "pcs", 30.0),
                                createIngredient("Paper Cups (Medium)", 180.0, "pcs", 40.0),
                                createIngredient("Paper Cups (Large)", 120.0, "pcs", 30.0),
                                createIngredient("Plastic Lids", 250.0, "pcs", 50.0),
                                createIngredient("Straws", 300.0, "pcs", 100.0),
                                createIngredient("Napkins", 500.0, "pcs", 100.0));
                ingredientRepository.saveAll(ingredients);
                System.out.println("✓ Ingredients seeded (" + ingredients.size() + " items)");
        }

        private Ingredient createIngredient(String name, double quantity, String unit, double minThreshold) {
                Ingredient i = new Ingredient();
                i.setName(name);
                i.setQuantity(quantity);
                i.setUnit(unit);
                i.setMinThreshold(minThreshold);
                return i;
        }

        private void seedEmployees() {
                String defaultPassword = passwordEncoder.encode("password123");
                List<Employee> employees = Arrays.asList(
                                createEmployee("EMP001", "Sarah Johnson", "Manager", "manager", "sarah@americano.com",
                                                "081", "manager",
                                                defaultPassword, 15000000),
                                createEmployee("EMP002", "Michael Chen", "Barista", "barista", "michael@americano.com",
                                                "082",
                                                "barista", defaultPassword, 6500000),
                                createEmployee("EMP003", "Emma Williams", "Barista", "barista2", "emma@americano.com",
                                                "083", "barista",
                                                defaultPassword, 6500000),
                                createEmployee("EMP005", "Lisa Anderson", "Cashier", "cashier", "lisa@americano.com",
                                                "084", "cashier",
                                                defaultPassword, 5500000),
                                createEmployee("EMP007", "Sofia Rodriguez", "Kitchen Staff", "kitchen",
                                                "sofia@americano.com", "085",
                                                "kitchen", defaultPassword, 6000000),
                                createEmployee("EMP010", "Ryan Davis", "Waiter", "waiter", "ryan@americano.com", "086",
                                                "waiter",
                                                defaultPassword, 5000000));

                employeeRepository.saveAll(employees);
                System.out.println("✓ Employees seeded (" + employees.size() + " staff members)");
        }

        private Employee createEmployee(String employeeId, String name, String position, String username, String email,
                        String phone, String role, String password, int salary) {
                Employee e = new Employee();
                e.setEmployeeId(employeeId);
                e.setName(name);
                e.setPosition(position);
                e.setUsername(username);
                e.setEmail(email);
                e.setPhone(phone);
                e.setRole(role);
                e.setPassword(password);
                e.setPin("123456"); // Default PIN
                e.setSalary(new BigDecimal(salary));
                e.setActive(true);
                return e;
        }

        private void seedShifts() {
                shiftScheduleRepository.deleteAll();
                List<Employee> employees = employeeRepository.findAll();
                List<ShiftSchedule> schedules = new ArrayList<>();

                for (Employee emp : employees) {
                        int empIdx = employees.indexOf(emp);
                        for (DayOfWeek day : DayOfWeek.values()) {
                                ShiftSchedule s = new ShiftSchedule();
                                s.setEmployeeId(emp.getEmployeeId());
                                s.setEmployeeName(emp.getName());
                                s.setPosition(emp.getPosition());
                                s.setDayOfWeek(day);

                                if (day == DayOfWeek.SUNDAY) {
                                        s.setShiftType(ShiftSchedule.ShiftType.OFF);
                                } else {
                                        if (emp.getPosition().equalsIgnoreCase("Manager")) {
                                                s.setShiftType(ShiftSchedule.ShiftType.MORNING);
                                        } else {
                                                int pattern = (day.getValue() + empIdx) % 3;
                                                if (pattern == 0)
                                                        s.setShiftType(ShiftSchedule.ShiftType.MORNING);
                                                else if (pattern == 1)
                                                        s.setShiftType(ShiftSchedule.ShiftType.AFTERNOON);
                                                else
                                                        s.setShiftType(ShiftSchedule.ShiftType.EVENING);
                                        }
                                }
                                schedules.add(s);
                        }
                }
                shiftScheduleRepository.saveAll(schedules);
                System.out.println("✓ Shift Schedules seeded (" + schedules.size() + " records)");
        }

        private void seedOrders() {
                List<Order> orders = new ArrayList<>();
                List<Menu> allMenu = menuRepository.findAll();
                java.util.Random random = new java.util.Random();

                if (allMenu.isEmpty()) {
                        System.out.println("⚠️ No menu items found, skipping random order generation.");
                        return;
                }

                // 1. Historical Orders (Last 7 Days)
                System.out.println("   Generating historical orders for Dashboard analytics...");
                for (int i = 1; i <= 7; i++) {
                        java.time.LocalDate date = java.time.LocalDate.now().minusDays(i);
                        int dailyCount = 5 + random.nextInt(10); // 5 to 14 orders per day

                        for (int j = 0; j < dailyCount; j++) {
                                LocalDateTime time = date.atTime(8 + random.nextInt(12), random.nextInt(60));
                                List<Order.OrderItem> items = new ArrayList<>();
                                int itemCount = 1 + random.nextInt(3);
                                for (int k = 0; k < itemCount; k++) {
                                        Menu m = allMenu.get(random.nextInt(allMenu.size()));
                                        items.add(createOrderItem(m.getName(), 1 + random.nextInt(2),
                                                        m.getPrice().intValue()));
                                }

                                Order order = createOrder("Table " + (1 + random.nextInt(15)), "Guest", items,
                                                OrderStatus.COMPLETED,
                                                time);
                                order.setAssignedStaffName("Michael Chen");
                                orders.add(order);
                        }
                }

                // 2. Active Orders
                orders.add(createOrder("Table 1", "John Doe",
                                Arrays.asList(createOrderItem("Cappuccino", 2, 35000),
                                                createOrderItem("Croissant", 1, 22000)),
                                OrderStatus.COMPLETED, LocalDateTime.now().minusHours(2)));

                orders.add(createOrder("Table 3", "Jane Smith",
                                Arrays.asList(createOrderItem("Cafe Latte", 1, 38000),
                                                createOrderItem("Chocolate Cake", 1, 35000)),
                                OrderStatus.COMPLETED, LocalDateTime.now().minusHours(1)));

                orders.add(createOrder("Table 5", "Bob Wilson",
                                Arrays.asList(createOrderItem("Americano", 2, 28000),
                                                createOrderItem("Blueberry Muffin", 2, 25000)),
                                OrderStatus.PENDING, LocalDateTime.now().minusMinutes(15)));

                orders.add(createOrder("Takeaway", "Alice Brown",
                                Arrays.asList(createOrderItem("Matcha Latte", 1, 40000),
                                                createOrderItem("Cheesecake", 1, 38000)),
                                OrderStatus.PREPARING, LocalDateTime.now().minusMinutes(5)));

                orders.add(createOrder("Table 7", "Charlie Davis",
                                Arrays.asList(createOrderItem("Mocha", 2, 42000), createOrderItem("Tiramisu", 1, 42000),
                                                createOrderItem("Espresso", 1, 25000)),
                                OrderStatus.COMPLETED, LocalDateTime.now().minusHours(3)));

                orders.add(createOrder("Table 9", "Eve Polastri",
                                Arrays.asList(createOrderItem("Vietnamese Coffee", 1, 32000)),
                                OrderStatus.READY_TO_SERVE, LocalDateTime.now().minusMinutes(2)));

                // NEW ORDERS FOR KITCHEN SCREENSHOTS
                orders.add(createOrder("Table 12", "David Miller",
                                Arrays.asList(createOrderItem("Cappuccino", 1, 35000),
                                                createOrderItem("Chocolate Croissant", 2, 28000)),
                                OrderStatus.PENDING, LocalDateTime.now().minusMinutes(8)));

                orders.add(createOrder("Table 4", "Sarah Connor",
                                Arrays.asList(createOrderItem("Green Tea", 2, 28000),
                                                createOrderItem("Cheesecake", 1, 38000)),
                                OrderStatus.PREPARING, LocalDateTime.now().minusMinutes(12)));

                orders.add(createOrder("Table 8", "John Snow",
                                Arrays.asList(createOrderItem("Espresso", 4, 25000)),
                                OrderStatus.PENDING, LocalDateTime.now().minusMinutes(3)));

                orderRepository.saveAll(orders);
                System.out.println("✓ Orders seeded (" + orders.size() + " total: historical & active)");
        }

        private Order createOrder(String tableNumber, String customerName, List<Order.OrderItem> items,
                        OrderStatus status,
                        LocalDateTime createdAt) {
                Order order = new Order();
                order.setOrderNumber(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                order.setTableNumber(tableNumber);
                order.setCustomerName(customerName);
                order.setItems(items);
                order.setStatus(status);
                order.setCreatedAt(createdAt);

                double total = items.stream()
                                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                                .sum();

                order.setTotalPrice(total);
                order.setTax(total * 0.11);
                order.setGrandTotal(total * 1.11);

                return order;
        }

        private Order.OrderItem createOrderItem(String menuName, int quantity, int price) {
                Order.OrderItem item = new Order.OrderItem();
                item.setMenuName(menuName);
                item.setQuantity(quantity);
                item.setPrice((double) price);
                return item;
        }
}
