const mongoose = require('mongoose');

// ============================================
// Global ID Plugin (Mongoose Object ID logic matching Spring Data)
// ============================================
const renameIdPlugin = function(schema) {
    schema.virtual('id').get(function() {
        if (!this._id) return null;
        return typeof this._id.toHexString === 'function' ? this._id.toHexString() : this._id.toString();
    });
    schema.set('toJSON', { virtuals: true });
    schema.set('toObject', { virtuals: true });
};
mongoose.plugin(renameIdPlugin);

// ============================================
// 1. Employee & Attendance
// ============================================
const AttendanceSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    present: { type: Boolean, default: false },
    notes: { type: String }
});

const EmployeeSchema = new mongoose.Schema({
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pin: { type: String }, // Used for quick actions
    role: { type: String, required: true },
    position: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    active: { type: Boolean, default: true },
    salary: { type: Number },
    attendanceRecord: [AttendanceSchema]
});
EmployeeSchema.set('toJSON', { virtuals: true, transform: (doc, ret) => { delete ret._id; delete ret.__v; delete ret.password; }});

// ============================================
// 2. Order
// ============================================
const OrderItemSchema = new mongoose.Schema({
    menuId: { type: String, required: true },
    menuName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
});

const OrderSchema = new mongoose.Schema({
    orderNumber: { type: String, required: true, unique: true },
    tableNumber: { type: String }, // String to support "Takeaway"
    customerName: { type: String },
    items: [OrderItemSchema],
    totalPrice: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number },
    status: { type: String, enum: ['PENDING', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'], default: 'PENDING' },
    notes: { type: String }, // Renamed from note to match frontend
    paymentMethod: { type: String, enum: ['CASH', 'QRIS', 'CARD', 'DEBIT'], required: true }, // Added DEBIT to match frontend
    createdAt: { type: Date, default: Date.now },
    assignedStaffId: { type: String },
    assignedStaffName: { type: String }
});
OrderSchema.set('toJSON', { virtuals: true, transform: (doc, ret) => { delete ret._id; delete ret.__v; }});

// ============================================
// 3. ShopConfig
// ============================================
const SocialLinkSchema = new mongoose.Schema({
    platform: { type: String },
    url: { type: String },
    icon: { type: String }
});

const ShopConfigSchema = new mongoose.Schema({
    shopName: { type: String },
    websiteTitle: { type: String },
    faviconUrl: { type: String },
    logoUrl: { type: String },
    address: { type: String },
    phoneNumber: { type: String },
    instagramUrl: { type: String },
    facebookUrl: { type: String },
    twitterUrl: { type: String },
    socialLinks: [SocialLinkSchema],
    latestDropPromoTitle: { type: String },
    latestDropPromoDesc: { type: String },
    latestDropPromoDate: { type: String },
    latestDropNewsTitle: { type: String },
    latestDropNewsDesc: { type: String },
    latestDropEventTitle: { type: String },
    latestDropEventDesc: { type: String },
    techSpec1: { type: String },
    techSpec2: { type: String },
    techSpec3: { type: String },
    heroImageUrl: { type: String },
    badgeText1: { type: String },
    badgeText2: { type: String },
    marqueeText: { type: String },
    galleryImages: [{ type: String }],
    infoTitle: { type: String },
    infoContent: { type: String },
    infoFooter1: { type: String },
    infoFooter2: { type: String }
});
ShopConfigSchema.set('toJSON', { virtuals: true, transform: (doc, ret) => { delete ret._id; delete ret.__v; }});

// ============================================
// 4. Menu & Category
// ============================================
const MenuSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    imageUrl: { type: String },
    gallery: [{ type: String }],
    available: { type: Boolean, default: true }
});
MenuSchema.set('toJSON', { virtuals: true, transform: (doc, ret) => { delete ret._id; delete ret.__v; }});

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String }
});
CategorySchema.set('toJSON', { virtuals: true, transform: (doc, ret) => { delete ret._id; delete ret.__v; }});

// ============================================
// 5. Shift Schedule
// ============================================
const ShiftScheduleSchema = new mongoose.Schema({
    employeeId: { type: String, required: true },
    employeeName: { type: String, required: true },
    role: { type: String }, // For staff category validation
    position: { type: String, required: true },
    dayOfWeek: { type: String, enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] },
    shiftType: { type: String, enum: ['MORNING', 'AFTERNOON', 'EVENING', 'OFF'] }
});
ShiftScheduleSchema.set('toJSON', { virtuals: true, transform: (doc, ret) => { delete ret._id; delete ret.__v; }});

// ============================================
// 6. Transaction 
// ============================================
const TransactionSchema = new mongoose.Schema({
    type: { type: String, enum: ['INCOME', 'EXPENSE'], required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
    relatedOrderId: { type: String }
});
TransactionSchema.set('toJSON', { virtuals: true, transform: (doc, ret) => { delete ret._id; delete ret.__v; }});

// ============================================
// 7. Ingredient 
// ============================================
const IngredientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true }, // kg, liters, grams, pcs
    minThreshold: { type: Number }
});
IngredientSchema.set('toJSON', { virtuals: true, transform: (doc, ret) => { delete ret._id; delete ret.__v; }});

// ============================================
// 8. Other Schemas (Feedback, Note, Notification, Post)
// ============================================
const FeedbackSchema = new mongoose.Schema({
    customerName: { type: String },
    email: { type: String },
    rating: { type: Number },
    message: { type: String },
    shiftEmployees: [{ type: String }],
    timestamp: { type: Date, default: Date.now }
});
FeedbackSchema.set('toJSON', { virtuals: true, transform: (doc, ret) => { delete ret._id; delete ret.__v; }});

const NoteSchema = new mongoose.Schema({
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    content: { type: String, required: true },
    lastUpdatedBy: { type: String },
    updatedAt: { type: Date, default: Date.now }
});
NoteSchema.set('toJSON', { virtuals: true, transform: (doc, ret) => { delete ret._id; delete ret.__v; }});

const NotificationSchema = new mongoose.Schema({
    type: { type: String, required: true },
    message: { type: String, required: true },
    tableNumber: { type: String },
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});
NotificationSchema.set('toJSON', { virtuals: true, transform: (doc, ret) => { delete ret._id; delete ret.__v; }});

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    content: { type: String }, // Made optional to prevent 400 errors from empty forms
    category: { type: String, default: 'NEWS' },
    excerpt: { type: String },
    featuredImage: { type: String },
    author: { type: String },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' },
    publishedAt: { type: Date }
}, { timestamps: true });
PostSchema.set('toJSON', { virtuals: true, transform: (doc, ret) => { delete ret._id; delete ret.__v; }});

// ============================================
// EXPORTS
// ============================================
module.exports = {
    Employee: mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema, 'employees'),
    Order: mongoose.models.Order || mongoose.model('Order', OrderSchema, 'orders'),
    ShopConfig: mongoose.models.ShopConfig || mongoose.model('ShopConfig', ShopConfigSchema, 'shop_config'),
    Menu: mongoose.models.Menu || mongoose.model('Menu', MenuSchema, 'menus'),
    Category: mongoose.models.Category || mongoose.model('Category', CategorySchema, 'categories'),
    ShiftSchedule: mongoose.models.ShiftSchedule || mongoose.model('ShiftSchedule', ShiftScheduleSchema, 'shift_schedules'),
    Transaction: mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema, 'transactions'),
    Ingredient: mongoose.models.Ingredient || mongoose.model('Ingredient', IngredientSchema, 'ingredients'),
    Feedback: mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema, 'feedbacks'),
    Note: mongoose.models.Note || mongoose.model('Note', NoteSchema, 'notes'),
    Notification: mongoose.models.Notification || mongoose.model('Notification', NotificationSchema, 'notifications'),
    Post: mongoose.models.Post || mongoose.model('Post', PostSchema, 'posts')
};
