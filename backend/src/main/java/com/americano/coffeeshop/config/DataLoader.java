package com.americano.coffeeshop.config;

import com.americano.coffeeshop.model.*;
import com.americano.coffeeshop.repository.AttendanceRepository;
import com.americano.coffeeshop.repository.CategoryRepository;
import com.americano.coffeeshop.repository.EmployeeRepository;
import com.americano.coffeeshop.repository.IngredientRepository;
import com.americano.coffeeshop.repository.MenuRepository;
import com.americano.coffeeshop.repository.OrderRepository;
import com.americano.coffeeshop.repository.ShiftScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

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

        @Override
        public void run(String... args) throws Exception {
                // Clear data for fresh seeding
                menuRepository.deleteAll();
                categoryRepository.deleteAll();
                ingredientRepository.deleteAll();
                employeeRepository.deleteAll();
                employeeRepository.deleteAll();
                orderRepository.deleteAll();
                shiftScheduleRepository.deleteAll();
                attendanceRepository.deleteAll(); // <--- Clear Attendance History

                seedCategories();
                seedMenu();
                seedIngredients();
                seedEmployees();
                seedOrders();
                seedShifts();
                System.out.println("✅ All Data Seeding Completed Successfully!");
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
                                Arrays.asList(
                                                "https://images.unsplash.com/photo-1571181805149-2ce0b21e03db",
                                                "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
                                                "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
                                                "https://images.unsplash.com/photo-1511920170033-f8396924c348")));

                // Coffee
                menus.add(createMenu("Espresso", "Coffee",
                                "Rich and bold single shot espresso", 25000,
                                "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04",
                                Arrays.asList(
                                                "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04",
                                                "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd",
                                                "https://images.unsplash.com/photo-1559056199-641a0ac8b55e",
                                                "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085")));

                menus.add(createMenu("Americano", "Coffee",
                                "Espresso diluted with hot water", 28000,
                                "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd",
                                Arrays.asList(
                                                "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd",
                                                "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
                                                "https://images.unsplash.com/photo-1497935586351-b67a49e01000",
                                                "https://images.unsplash.com/photo-1461023058943-07fcbe16d735")));

                menus.add(createMenu("Cappuccino", "Coffee",
                                "Espresso with steamed milk and foam", 35000,
                                "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7",
                                Arrays.asList(
                                                "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7",
                                                "https://images.unsplash.com/photo-1534778101976-62847782c213",
                                                "https://images.unsplash.com/photo-1572442388796-11668a67e53d",
                                                "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f")));

                menus.add(createMenu("Cafe Latte", "Coffee",
                                "Espresso with steamed milk", 38000,
                                "https://images.unsplash.com/photo-1485808191679-5f86510681a2",
                                Arrays.asList(
                                                "https://images.unsplash.com/photo-1485808191679-5f86510681a2",
                                                "https://images.unsplash.com/photo-1544787219-7f47ccb76574",
                                                "https://images.unsplash.com/photo-1534778101976-62847782c213",
                                                "https://images.unsplash.com/photo-1572442388796-11668a67e53d")));

                menus.add(createMenu("Mocha", "Coffee",
                                "Espresso with chocolate and steamed milk", 42000,
                                "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
                                Arrays.asList(
                                                "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
                                                "https://images.unsplash.com/photo-1511920170033-f8396924c348",
                                                "https://images.unsplash.com/photo-1578374173703-4f8d26487d9a",
                                                "https://images.unsplash.com/photo-1568649929103-2f6f8819e70f")));

                menus.add(createMenu("Vietnamese Coffee", "Coffee",
                                "Strong coffee with condensed milk", 32000,
                                "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
                                Arrays.asList(
                                                "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
                                                "https://images.unsplash.com/photo-1587734195503-904fca47e0e9",
                                                "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7",
                                                "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd")));

                // Non-Coffee
                menus.add(createMenu("Matcha Latte", "Non-Coffee",
                                "Japanese green tea with steamed milk", 40000,
                                "https://images.unsplash.com/photo-1536013266800-92e257e33b59",
                                Arrays.asList(
                                                "https://images.unsplash.com/photo-1536013266800-92e257e33b59",
                                                "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9",
                                                "https://images.unsplash.com/photo-1582793988951-9b7d8cd6279e",
                                                "https://images.unsplash.com/photo-1541167760496-1628856ab772")));

                menus.add(createMenu("Chocolate", "Non-Coffee",
                                "Rich hot chocolate with whipped cream", 35000,
                                "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed",
                                Arrays.asList(
                                                "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed",
                                                "https://images.unsplash.com/photo-1553787499-6f5cd4097f8b",
                                                "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7",
                                                "https://images.unsplash.com/photo-1511920170033-f8396924c348")));

                menus.add(createMenu("Strawberry Smoothie", "Non-Coffee",
                                "Fresh strawberry blended smoothie", 38000,
                                "https://images.unsplash.com/photo-1505252585461-04db1eb84625",
                                Arrays.asList(
                                                "https://images.unsplash.com/photo-1505252585461-04db1eb84625",
                                                "https://images.unsplash.com/photo-1546548970-71785318a17b",
                                                "https://images.unsplash.com/photo-1553530666-ba11a7da3888",
                                                "https://images.unsplash.com/photo-1577234286642-fc512a5f8f11")));

                // Tea
                menus.add(createMenu("English Breakfast Tea", "Tea",
                                "Classic black tea blend", 25000,
                                "https://images.unsplash.com/photo-1576092768241-dec231879fc3",
                                Arrays.asList(
                                                "https://images.unsplash.com/photo-1576092768241-dec231879fc3",
                                                "https://images.unsplash.com/photo-1556679343-c7306c1976bc",
                                                "https://images.unsplash.com/photo-1597481499750-3e6b22637e12",
                                                "https://images.unsplash.com/photo-1544787219-7f47ccb76574")));

                menus.add(createMenu("Green Tea", "Tea",
                                "Premium Japanese green tea", 28000,
                                "https://images.unsplash.com/photo-1556679343-c7306c1976bc",
                                Arrays.asList(
                                                "https://images.unsplash.com/photo-1556679343-c7306c1976bc",
                                                "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9",
                                                "https://images.unsplash.com/photo-1597481499750-3e6b22637e12",
                                                "https://images.unsplash.com/photo-1576092768241-dec231879fc3")));

                menus.add(createMenu("Chamomile Tea", "Tea",
                                "Relaxing herbal infusion", 27000,
                                "https://images.unsplash.com/photo-1597481499750-3e6b22637e12",
                                Arrays.asList(
                                                "https://images.unsplash.com/photo-1597481499750-3e6b22637e12",
                                                "https://images.unsplash.com/photo-1544787219-7f47ccb76574",
                                                "https://images.unsplash.com/photo-1576092768241-dec231879fc3",
                                                "https://images.unsplash.com/photo-1556679343-c7306c1976bc")));

                // Pastry
                menus.add(createMenu("Croissant", "Pastry",
                                "Buttery French pastry", 22000,
                                "https://images.unsplash.com/photo-1555507036-ab1f4038808a",
                                Arrays.asList(
                                                "https://images.unsplash.com/photo-1555507036-ab1f4038808a",
                                                "https://images.unsplash.com/photo-1530610476181-d83430b64dcd",
                                                "https://images.unsplash.com/photo-1509440159596-0249088772ff",
                                                "https://images.unsplash.com/photo-1608198093002-ad4e0d1f6e9f")));

                menus.add(createMenu("Chocolate Croissant", "Pastry",
                                "Croissant filled with dark chocolate", 28000,
                                "https://images.unsplash.com/photo-1530610476181-d83430b64dcd",
                                Arrays.asList(
                                                "https://images.unsplash.com/photo-1530610476181-d83430b64dcd",
                                                "https://images.unsplash.com/photo-1555507036-ab1f4038808a",
                                                "https://images.unsplash.com/photo-1608198093002-ad4e0d1f6e9f",
                                                "https://images.unsplash.com/photo-1509440159596-0249088772ff")));

                menus.add(createMenu("Blueberry Muffin", "Pastry",
                                "Fresh baked muffin with blueberries", 25000,
                                "https://images.unsplash.com/photo-1607958996333-41aef7caefaa",
                                Arrays.asList(
                                                "https://images.unsplash.com/photo-1607958996333-41aef7caefaa",
                                                "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7",
                                                "https://images.unsplash.com/photo-1608198093002-ad4e0d1f6e9f",
                                                "https://images.unsplash.com/photo-1603532648955-039310d9ed75")));

                // Dessert
                menus.add(createMenu("Chocolate Cake", "Dessert",
                                "Rich layered chocolate cake", 35000,
                                "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
                                Arrays.asList(
                                                "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
                                                "https://images.unsplash.com/photo-1565958011703-44f9829ba187",
                                                "https://images.unsplash.com/photo-1588195538326-c5acd4371a08",
                                                "https://images.unsplash.com/photo-1571115177098-24ec42ed204d")));

                menus.add(createMenu("Cheesecake", "Dessert",
                                "Creamy New York style cheesecake", 38000,
                                "https://images.unsplash.com/photo-1533134242989-8f9c9d45dc1a",
                                Arrays.asList(
                                                "https://images.unsplash.com/photo-1533134242989-8f9c9d45dc1a",
                                                "https://images.unsplash.com/photo-1524351199678-941a58a3df50",
                                                "https://images.unsplash.com/photo-1567327942458-65446b85b2ee",
                                                "https://images.unsplash.com/photo-1565958011703-44f9829ba187")));

                menus.add(createMenu("Tiramisu", "Dessert",
                                "Classic Italian coffee-flavored dessert", 42000,
                                "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
                                Arrays.asList(
                                                "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9",
                                                "https://images.unsplash.com/photo-1586040140378-b5af26e6b43c",
                                                "https://images.unsplash.com/photo-1566739443557-02c3db36b1e6",
                                                "https://images.unsplash.com/photo-1534432182912-63863115e106")));

                menuRepository.saveAll(menus);
                System.out.println("✓ Menus seeded (" + menus.size() + " items with 4 images each)");
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
                m.setPrice(new BigDecimal(price));
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
                                // Manager
                                createEmployee("EMP001", "Sarah Johnson", "Manager", "manager",
                                                "sarah.johnson@americano.com",
                                                "081234567890", "manager", defaultPassword, 15000000),

                                // Baristas
                                createEmployee("EMP002", "Michael Chen", "Barista", "barista",
                                                "michael.chen@americano.com",
                                                "081234567891", "barista", defaultPassword, 6500000),
                                createEmployee("EMP003", "Emma Williams", "Barista", "barista2",
                                                "emma.williams@americano.com",
                                                "081234567892", "barista", defaultPassword, 6500000),
                                createEmployee("EMP004", "David Martinez", "Barista", "barista3",
                                                "david.martinez@americano.com",
                                                "081234567893", "barista", defaultPassword, 6500000),

                                // Cashiers
                                createEmployee("EMP005", "Lisa Anderson", "Cashier", "cashier",
                                                "lisa.anderson@americano.com",
                                                "081234567894", "cashier", defaultPassword, 5500000),
                                createEmployee("EMP006", "James Taylor", "Cashier", "cashier2",
                                                "james.taylor@americano.com",
                                                "081234567895", "cashier", defaultPassword, 5500000),

                                // Kitchen Staff
                                createEmployee("EMP007", "Sofia Rodriguez", "Kitchen Staff", "kitchen",
                                                "sofia.rodriguez@americano.com",
                                                "081234567896", "kitchen", defaultPassword, 6000000),
                                createEmployee("EMP008", "Daniel Kim", "Kitchen Staff", "kitchen2",
                                                "daniel.kim@americano.com",
                                                "081234567897", "kitchen", defaultPassword, 6000000),
                                createEmployee("EMP009", "Olivia Brown", "Kitchen Staff", "kitchen3",
                                                "olivia.brown@americano.com",
                                                "081234567898", "kitchen", defaultPassword, 6000000),

                                // Waiters
                                createEmployee("EMP010", "Ryan Davis", "Waiter", "waiter", "ryan.davis@americano.com",
                                                "081234567899", "waiter", defaultPassword, 5000000),
                                createEmployee("EMP011", "Isabella Garcia", "Waiter", "waiter2",
                                                "isabella.garcia@americano.com",
                                                "081234567800", "waiter", defaultPassword, 5000000),
                                createEmployee("EMP012", "Lucas Wilson", "Waiter", "waiter3",
                                                "lucas.wilson@americano.com",
                                                "081234567801", "waiter", defaultPassword, 5000000),

                                // Cleaning Staff
                                createEmployee("EMP013", "Mia Thompson", "Cleaning Staff", "cleaning",
                                                "mia.thompson@americano.com",
                                                "081234567802", "cleaning", defaultPassword, 4500000),
                                createEmployee("EMP014", "Ethan Moore", "Cleaning Staff", "cleaning2",
                                                "ethan.moore@americano.com",
                                                "081234567803", "cleaning", defaultPassword, 4500000));

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
                e.setSalary(new BigDecimal(salary));
                e.setActive(true);
                return e;
        }

        private void seedShifts() {
                shiftScheduleRepository.deleteAll();
                List<Employee> employees = employeeRepository.findAll();
                List<ShiftSchedule> schedules = new ArrayList<>();

                for (Employee emp : employees) {
                        // Determine pattern based on index to make it look semi-realistic
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
                                        // Pattern: Manager Morning, others rotated
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

                // Sample orders from today
                orders.add(createOrder("Table 1", "John Doe",
                                Arrays.asList(
                                                createOrderItem("Cappuccino", 2, 35000),
                                                createOrderItem("Croissant", 1, 22000)),
                                OrderStatus.COMPLETED, LocalDateTime.now().minusHours(2)));

                orders.add(createOrder("Table 3", "Jane Smith",
                                Arrays.asList(
                                                createOrderItem("Cafe Latte", 1, 38000),
                                                createOrderItem("Chocolate Cake", 1, 35000)),
                                OrderStatus.COMPLETED, LocalDateTime.now().minusHours(1)));

                orders.add(createOrder("Table 5", "Bob Wilson",
                                Arrays.asList(
                                                createOrderItem("Americano", 2, 28000),
                                                createOrderItem("Blueberry Muffin", 2, 25000)),
                                OrderStatus.PENDING, LocalDateTime.now().minusMinutes(15)));

                orders.add(createOrder("Takeaway", "Alice Brown",
                                Arrays.asList(
                                                createOrderItem("Matcha Latte", 1, 40000),
                                                createOrderItem("Cheesecake", 1, 38000)),
                                OrderStatus.PREPARING, LocalDateTime.now().minusMinutes(5)));

                orders.add(createOrder("Table 7", "Charlie Davis",
                                Arrays.asList(
                                                createOrderItem("Mocha", 2, 42000),
                                                createOrderItem("Tiramisu", 1, 42000),
                                                createOrderItem("Espresso", 1, 25000)),
                                OrderStatus.COMPLETED, LocalDateTime.now().minusHours(3)));

                orderRepository.saveAll(orders);
                System.out.println("✓ Orders seeded (" + orders.size() + " sample orders)");
        }

        private Order createOrder(String tableNumber, String customerName, List<Order.OrderItem> items,
                        OrderStatus status, LocalDateTime createdAt) {
                Order order = new Order();
                order.setTableNumber(tableNumber);
                order.setCustomerName(customerName);
                order.setItems(items);
                order.setStatus(status);
                order.setCreatedAt(createdAt);

                // Calculate total
                BigDecimal total = items.stream()
                                .map(item -> item.getPrice().multiply(new BigDecimal(item.getQuantity())))
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                order.setTotalAmount(total);

                return order;
        }

        private Order.OrderItem createOrderItem(String menuName, int quantity, int price) {
                Order.OrderItem item = new Order.OrderItem();
                item.setMenuName(menuName);
                item.setQuantity(quantity);
                item.setPrice(new BigDecimal(price));
                return item;
        }
}
