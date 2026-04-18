import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Create connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create adapter
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    console.log("🌱 Starting database seed...");

    // Clear existing data
    await prisma.review.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.productFaq.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.otpToken.deleteMany({});
    await prisma.user.deleteMany({});

    console.log("✅ Cleared existing data");

    // ============ CREATE USERS ============
    const users = await Promise.all(
        Array.from({ length: 20 }, async (_, i) => {
            const hashedPassword = await hash("Password@123", 10);
            return prisma.user.create({
                data: {
                    name: `User ${i + 1}`,
                    email: `user${i + 1}@example.com`,
                    password: hashedPassword,
                    phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
                    answer: `Answer ${i + 1}`,
                    role: i === 0 ? "ADMIN" : "CUSTOMER",
                    image: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 1}`,
                },
            });
        })
    );

    console.log(`✅ Created ${users.length} users`);

    // ============ CREATE CATEGORIES ============
    const categories = await Promise.all([
        prisma.category.create({
            data: {
                name: "Electronics",
                slug: "electronics",
                description: "All kinds of electronic devices and gadgets",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
            },
        }),
        prisma.category.create({
            data: {
                name: "Fashion",
                slug: "fashion",
                description: "Latest fashion and clothing items",
                image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400",
            },
        }),
        prisma.category.create({
            data: {
                name: "Home & Kitchen",
                slug: "home-kitchen",
                description: "Everything for your home and kitchen",
                image: "https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400",
            },
        }),
        prisma.category.create({
            data: {
                name: "Sports & Outdoors",
                slug: "sports-outdoors",
                description: "Sports equipment and outdoor gear",
                image: "https://images.unsplash.com/photo-1517836357463-d25ddfcbf042?w=400",
            },
        }),
        prisma.category.create({
            data: {
                name: "Books & Media",
                slug: "books-media",
                description: "Books, ebooks, and digital media",
                image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
            },
        }),
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    // ============ CREATE PRODUCTS ============
    const productsData = [
        // Electronics (6 products)
        {
            categoryId: categories[0].id,
            name: "Sony WH-1000XM5 Headphones",
            slug: "sony-wh-1000xm5",
            description: "Premium noise-cancelling wireless headphones with 40-hour battery",
            price: 34999,
            quantity: 45,
            brand: "Sony",
            shipping: true,
            additionalImages: [
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
            ],
            productDetails: {
                color: "Black",
                warranty: "2 years",
                batteryLife: "40 hours",
            },
        },
        {
            categoryId: categories[0].id,
            name: "iPhone 15 Pro Max",
            slug: "iphone-15-pro-max",
            description: "Latest Apple flagship smartphone with A17 Pro chip",
            price: 139999,
            quantity: 20,
            brand: "Apple",
            shipping: true,
            additionalImages: [
                "https://images.unsplash.com/photo-1592286927505-1def25e5e137?w=500",
            ],
            productDetails: {
                color: "Space Black",
                storage: "256GB",
                display: "6.7 inch",
            },
        },
        {
            categoryId: categories[0].id,
            name: "Samsung 55\" QLED TV",
            slug: "samsung-55-qled",
            description: "4K QLED TV with quantum dot technology",
            price: 84999,
            quantity: 15,
            brand: "Samsung",
            shipping: true,
            additionalImages: [
                "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500",
            ],
            productDetails: {
                resolution: "4K",
                size: "55 inch",
                refreshRate: "120Hz",
            },
        },
        {
            categoryId: categories[0].id,
            name: "MacBook Pro 16\" M3 Max",
            slug: "macbook-pro-16-m3",
            description: "Professional laptop with M3 Max chip and stunning display",
            price: 249999,
            quantity: 10,
            brand: "Apple",
            shipping: true,
            additionalImages: [
                "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500",
            ],
            productDetails: {
                chip: "M3 Max",
                ram: "36GB",
                storage: "1TB",
            },
        },
        {
            categoryId: categories[0].id,
            name: "DJI Air 3S Drone",
            slug: "dji-air-3s",
            description: "Professional camera drone with 48MP sensor",
            price: 84999,
            quantity: 12,
            brand: "DJI",
            shipping: true,
            additionalImages: [
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500",
            ],
            productDetails: {
                camera: "48MP",
                maxFlightTime: "46 minutes",
                maxSpeed: "75.6 km/h",
            },
        },
        {
            categoryId: categories[0].id,
            name: "iPad Air 6th Gen",
            slug: "ipad-air-6",
            description: "Versatile tablet with M2 chip",
            price: 59999,
            quantity: 25,
            brand: "Apple",
            shipping: true,
            additionalImages: [
                "https://images.unsplash.com/photo-1544716278-ca5e3af2abd8?w=500",
            ],
            productDetails: {
                chip: "M2",
                storage: "256GB",
                display: "11-inch",
            },
        },

        // Fashion (6 products)
        {
            categoryId: categories[1].id,
            name: "Premium Cotton T-Shirt",
            slug: "premium-cotton-tshirt",
            description: "100% organic cotton comfortable t-shirt",
            price: 799,
            quantity: 150,
            brand: "ThreadCo",
            shipping: true,
            additionalImages: [
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
            ],
            productDetails: {
                material: "100% Organic Cotton",
                sizes: ["XS", "S", "M", "L", "XL", "XXL"],
                colors: ["Black", "White", "Blue"],
            },
        },
        {
            categoryId: categories[1].id,
            name: "Denim Jeans Classic Blue",
            slug: "denim-jeans-classic",
            description: "Timeless denim jeans with perfect fit",
            price: 2499,
            quantity: 80,
            brand: "DenimCo",
            shipping: true,
            additionalImages: [
                "https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500",
            ],
            productDetails: {
                material: "98% Cotton, 2% Elastane",
                waist: "28-38",
                length: "30-36",
            },
        },
        {
            categoryId: categories[1].id,
            name: "Leather Jacket Classic",
            slug: "leather-jacket",
            description: "Premium genuine leather jacket",
            price: 12999,
            quantity: 30,
            brand: "LeatherLux",
            shipping: true,
            additionalImages: [
                "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500",
            ],
            productDetails: {
                material: "Genuine Leather",
                sizes: ["S", "M", "L", "XL"],
                colors: ["Black", "Brown"],
            },
        },
        {
            categoryId: categories[1].id,
            name: "Summer Dress Floral",
            slug: "summer-dress-floral",
            description: "Light and breezy floral summer dress",
            price: 1999,
            quantity: 100,
            brand: "StyleIt",
            shipping: true,
            additionalImages: [
                "https://images.unsplash.com/photo-1595777707802-8b865fe5e336?w=500",
            ],
            productDetails: {
                material: "Cotton Blend",
                sizes: ["XS", "S", "M", "L", "XL"],
                pattern: "Floral",
            },
        },
        {
            categoryId: categories[1].id,
            name: "Sports Running Shoes",
            slug: "sports-running-shoes",
            description: "Comfortable and durable running shoes",
            price: 4999,
            quantity: 120,
            brand: "RunFast",
            shipping: true,
            additionalImages: [
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
            ],
            productDetails: {
                sizes: ["5-13"],
                colors: ["Black", "White", "Blue"],
                weight: "250g",
            },
        },
        {
            categoryId: categories[1].id,
            name: "Wool Winter Scarf",
            slug: "wool-winter-scarf",
            description: "Soft and warm wool scarf",
            price: 1499,
            quantity: 200,
            brand: "WarmCo",
            shipping: false,
            additionalImages: [
                "https://images.unsplash.com/photo-1530387191325-3cf5f5ecd519?w=500",
            ],
            productDetails: {
                material: "100% Wool",
                colors: ["Beige", "Gray", "Navy"],
                length: "200cm",
            },
        },

        // Home & Kitchen (6 products)
        {
            categoryId: categories[2].id,
            name: "Stainless Steel Cookware Set",
            slug: "stainless-steel-cookware",
            description: "12-piece non-stick cookware set",
            price: 8999,
            quantity: 40,
            brand: "KitchenPro",
            shipping: true,
            additionalImages: [
                "https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=500",
            ],
            productDetails: {
                pieces: "12",
                material: "Stainless Steel",
                warranty: "10 years",
            },
        },
        {
            categoryId: categories[2].id,
            name: "Electric Coffee Maker",
            slug: "electric-coffee-maker",
            description: "Programmable coffee maker with thermal carafe",
            price: 3999,
            quantity: 50,
            brand: "BrewMaster",
            shipping: true,
            additionalImages: [
                "https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=500",
            ],
            productDetails: {
                capacity: "1.5L",
                power: "1000W",
                features: ["Programmable", "Auto Shut-off"],
            },
        },
        {
            categoryId: categories[2].id,
            name: "Microwave Oven 25L",
            slug: "microwave-oven-25l",
            description: "Digital microwave with multiple cooking modes",
            price: 5999,
            quantity: 35,
            brand: "HomeChef",
            shipping: true,
            additionalImages: [
                "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500",
            ],
            productDetails: {
                capacity: "25L",
                power: "900W",
                modes: ["Microwave", "Grill", "Convection"],
            },
        },
        {
            categoryId: categories[2].id,
            name: "Bed Sheet Set Cotton",
            slug: "bed-sheet-set-cotton",
            description: "Premium cotton bed sheet set",
            price: 2499,
            quantity: 100,
            brand: "CozyBed",
            shipping: false,
            additionalImages: [
                "https://images.unsplash.com/photo-1565793539052-b1b3c5f0d6a5?w=500",
            ],
            productDetails: {
                material: "100% Cotton",
                count: "400TC",
                sizes: ["Single", "Double", "Queen", "King"],
            },
        },
        {
            categoryId: categories[2].id,
            name: "Pillow Memory Foam",
            slug: "pillow-memory-foam",
            description: "Orthopedic memory foam pillow",
            price: 1999,
            quantity: 120,
            brand: "ComfortPlus",
            shipping: true,
            additionalImages: [
                "https://images.unsplash.com/photo-1584622181563-430f63602d4b?w=500",
            ],
            productDetails: {
                material: "Memory Foam",
                firmness: "Medium",
                washable: true,
            },
        },
        {
            categoryId: categories[2].id,
            name: "Dining Table Wood",
            slug: "dining-table-wood",
            description: "Beautiful solid wood dining table",
            price: 24999,
            quantity: 8,
            brand: "WoodCraft",
            shipping: true,
            additionalImages: [
                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
            ],
            productDetails: {
                material: "Solid Wood",
                seater: "6",
                finish: "Natural Walnut",
            },
        },

        // Sports & Outdoors (6 products)
        {
            categoryId: categories[3].id,
            name: "Mountain Bike 21-Speed",
            slug: "mountain-bike-21-speed",
            description: "High-performance mountain bike with suspension",
            price: 19999,
            quantity: 20,
            brand: "CyclePro",
            shipping: true,
            additionalImages: [
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
            ],
            productDetails: {
                wheelSize: "29 inch",
                gears: "21-speed",
                suspension: "Front",
            },
        },
        {
            categoryId: categories[3].id,
            name: "Yoga Mat Premium",
            slug: "yoga-mat-premium",
            description: "Non-slip eco-friendly yoga mat",
            price: 2499,
            quantity: 200,
            brand: "YogaFlow",
            shipping: true,
            additionalImages: [
                "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500",
            ],
            productDetails: {
                material: "TPE",
                thickness: "8mm",
                colors: ["Purple", "Blue", "Green"],
            },
        },
        {
            categoryId: categories[3].id,
            name: "Camping Tent 4-Person",
            slug: "camping-tent-4-person",
            description: "Lightweight waterproof camping tent",
            price: 8999,
            quantity: 30,
            brand: "CampGear",
            shipping: true,
            additionalImages: [
                "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=500",
            ],
            productDetails: {
                capacity: "4 person",
                material: "Polyester",
                waterproof: true,
            },
        },
        {
            categoryId: categories[3].id,
            name: "Swimming Goggles Pro",
            slug: "swimming-goggles-pro",
            description: "Professional swimming goggles",
            price: 799,
            quantity: 300,
            brand: "AquaVision",
            shipping: false,
            additionalImages: [
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
            ],
            productDetails: {
                lens: "Polycarbonate",
                colors: ["Blue", "Black", "Clear"],
                uvProtection: true,
            },
        },
        {
            categoryId: categories[3].id,
            name: "Dumbbell Set 20kg",
            slug: "dumbbell-set-20kg",
            description: "Complete dumbbell set for home gym",
            price: 4999,
            quantity: 50,
            brand: "FitFlex",
            shipping: true,
            additionalImages: [
                "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500",
            ],
            productDetails: {
                totalWeight: "20kg",
                pairs: "2x10kg",
                material: "Iron",
            },
        },
        {
            categoryId: categories[3].id,
            name: "Hiking Backpack 50L",
            slug: "hiking-backpack-50l",
            description: "Durable hiking backpack with multiple compartments",
            price: 6999,
            quantity: 40,
            brand: "TrailMaster",
            shipping: true,
            additionalImages: [
                "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
            ],
            productDetails: {
                capacity: "50L",
                material: "Nylon",
                weatherResistant: true,
            },
        },

        // Books & Media (6 products)
        {
            categoryId: categories[4].id,
            name: "The Midnight Library - Matt Haig",
            slug: "midnight-library-matt-haig",
            description: "A captivating novel about infinite possibilities",
            price: 499,
            quantity: 80,
            brand: "Canongate",
            shipping: false,
            additionalImages: [
                "https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=500",
            ],
            productDetails: {
                format: "Paperback",
                pages: "304",
                language: "English",
            },
        },
        {
            categoryId: categories[4].id,
            name: "Atomic Habits - James Clear",
            slug: "atomic-habits-james-clear",
            description: "Transform your habits and get 1% better every day",
            price: 599,
            quantity: 150,
            brand: "Avery",
            shipping: false,
            additionalImages: [
                "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500",
            ],
            productDetails: {
                format: "Hardcover",
                pages: "320",
                language: "English",
            },
        },
    ];

    const products = await Promise.all(
        productsData.map((product) =>
            prisma.product.create({
                data: {
                    ...product,
                    price: product.price.toString(),
                    availability:
                        product.quantity > 0
                            ? "IN_STOCK"
                            : product.quantity === 0
                                ? "OUT_OF_STOCK"
                                : "PREORDER",
                },
            })
        )
    );

    console.log(`✅ Created ${products.length} products`);

    // ============ CREATE PRODUCT FAQs ============
    for (const product of products.slice(0, 10)) {
        await prisma.productFaq.createMany({
            data: [
                {
                    productId: product.id,
                    question: `What is the warranty for ${product.name}?`,
                    answer: "We provide 1 year manufacturer warranty on all products.",
                    order: 1,
                },
                {
                    productId: product.id,
                    question: `Is shipping free for ${product.name}?`,
                    answer: product.shipping
                        ? "Yes, free shipping available for this product."
                        : "Shipping charges apply as per our policy.",
                    order: 2,
                },
                {
                    productId: product.id,
                    question: `What is the return policy for ${product.name}?`,
                    answer: "We offer 30 days return policy from the date of delivery.",
                    order: 3,
                },
            ],
        });
    }

    console.log(`✅ Created product FAQs`);

    // ============ CREATE ADDRESSES ============
    const addresses = [];
    for (const user of users) {
        const addr = await prisma.address.create({
            data: {
                userId: user.id,
                name: user.name,
                phone: user.phone,
                addressLine1: `${Math.floor(Math.random() * 1000)} Main Street`,
                addressLine2: `Apt ${Math.floor(Math.random() * 100)}`,
                city: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai"][
                    Math.floor(Math.random() * 5)
                ],
                state: ["Maharashtra", "Delhi", "Karnataka", "Telangana", "Tamil Nadu"][
                    Math.floor(Math.random() * 5)
                ],
                pincode: Math.floor(100000 + Math.random() * 900000).toString(),
                country: "India",
                isDefault: true,
                type: "SHIPPING",
            },
        });
        addresses.push(addr);
    }

    console.log(`✅ Created ${addresses.length} addresses`);

    // ============ CREATE CARTS ============
    const carts = await Promise.all(
        users.slice(0, 15).map((user) =>
            prisma.cart.create({
                data: {
                    userId: user.id,
                },
            })
        )
    );

    console.log(`✅ Created ${carts.length} carts`);

    // ============ CREATE CART ITEMS ============
    let cartItemsCount = 0;
    for (const cart of carts) {
        const randomProducts = products
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.floor(Math.random() * 3) + 1);

        for (const product of randomProducts) {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: product.id,
                    quantity: Math.floor(Math.random() * 3) + 1,
                },
            });
            cartItemsCount++;
        }
    }

    console.log(`✅ Created ${cartItemsCount} cart items`);

    // ============ CREATE ORDERS ============
    const orders = [];
    for (let i = 0; i < 15; i++) {
        const user = users[i];
        const selectedProducts = products
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.floor(Math.random() * 4) + 1);

        const subTotal = selectedProducts.reduce(
            (sum, p) => sum + parseFloat(p.price.toString()) * Math.floor(Math.random() * 3 + 1),
            0
        );

        const shippingCost = subTotal > 50000 ? 0 : 500;
        const taxAmount = subTotal * 0.18;
        const totalAmount = subTotal + shippingCost + taxAmount;

        const order = await prisma.order.create({
            data: {
                orderNumber: `ORD-${Date.now()}-${i}`,
                buyerId: user.id,
                addressId: addresses[i].id,
                subTotal: subTotal.toString(),
                shippingCost: shippingCost.toString(),
                taxAmount: taxAmount.toString(),
                totalAmount: totalAmount.toString(),
                status: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"][
                    Math.floor(Math.random() * 5)
                ] as any,
                trackingNumber: `TRACK-${Math.random().toString(36).substring(7).toUpperCase()}`,
            },
        });

        // Create order items
        for (const product of selectedProducts) {
            const quantity = Math.floor(Math.random() * 3) + 1;
            await prisma.orderItem.create({
                data: {
                    orderId: order.id,
                    productId: product.id,
                    quantity,
                    price: product.price,
                },
            });
        }

        orders.push(order);
    }

    console.log(`✅ Created ${orders.length} orders with items`);

    // ============ CREATE PAYMENTS ============
    for (const order of orders.slice(0, 10)) {
        await prisma.payment.create({
            data: {
                orderId: order.id,
                razorpayOrderId: `razorpay_order_${Math.random().toString(36).substring(7)}`,
                razorpayPaymentId: `razorpay_payment_${Math.random().toString(36).substring(7)}`,
                razorpaySignature: `signature_${Math.random().toString(36).substring(7)}`,
                amount: order.totalAmount,
                status: order.status === "DELIVERED" ? "SUCCESS" : "PENDING",
                paymentMethod: ["card", "upi", "netbanking"][Math.floor(Math.random() * 3)],
                cardLast4: "1234",
                cardNetwork: "Visa",
                paidAt: order.status === "DELIVERED" ? new Date() : null,
            },
        });
    }

    console.log(`✅ Created payments`);

    // ============ CREATE REVIEWS ============
    let reviewsCount = 0;
    for (const product of products.slice(0, 15)) {
        const randomUsers = users
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.floor(Math.random() * 5) + 1);

        for (const user of randomUsers) {
            await prisma.review.create({
                data: {
                    productId: product.id,
                    userId: user.id,
                    rating: Math.floor(Math.random() * 5) + 1,
                    comment: [
                        "Great product! Very satisfied.",
                        "Good quality and fast delivery.",
                        "Amazing! Exceeded expectations.",
                        "Value for money.",
                        "Highly recommended!",
                        "Perfect for the price.",
                    ][Math.floor(Math.random() * 6)],
                },
            });
            reviewsCount++;
        }
    }

    console.log(`✅ Created ${reviewsCount} reviews`);

    console.log("🎉 Database seeding completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });