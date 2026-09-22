export const mockOrders = [
  {
    id: "ORD-94812",
    date: "2025-02-14",
    customer: {
      name: "Sakshi Sharma",
      email: "sakshi@example.com",
      phone: "+91 98765 43210"
    },
    shippingAddress: {
      address: "42 Innovation Park, Tech Avenue",
      city: "Bangalore",
      state: "Karnataka",
      postalCode: "560100"
    },
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
    status: "Delivered",
    items: [
      {
        id: "prod-1",
        name: "Sony WH-1000XM5 Wireless Headphones",
        price: 349.99,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: "prod-6",
        name: "Ray-Ban Classic Aviator Sunglasses",
        price: 178.00,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80"
      }
    ],
    pricing: {
      subtotal: 527.99,
      shipping: 0.00,
      tax: 26.40,
      total: 554.39
    }
  },
  {
    id: "ORD-83921",
    date: "2025-02-18",
    customer: {
      name: "Rohan Patel",
      email: "rohan.patel@example.com",
      phone: "+91 91234 56789"
    },
    shippingAddress: {
      address: "18 Marine Drive, Skyline Apt 4B",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400020"
    },
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
    status: "Processing",
    items: [
      {
        id: "prod-4",
        name: "Nike Air Max 270 React",
        price: 159.99,
        quantity: 2,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80"
      }
    ],
    pricing: {
      subtotal: 319.98,
      shipping: 10.00,
      tax: 16.00,
      total: 345.98
    }
  },
  {
    id: "ORD-72154",
    date: "2025-02-21",
    customer: {
      name: "Ananya Iyer",
      email: "ananya.iyer@example.com",
      phone: "+91 99887 76655"
    },
    shippingAddress: {
      address: "7 Lotus Boulevard, Sector 128",
      city: "Noida",
      state: "Uttar Pradesh",
      postalCode: "201304"
    },
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
    status: "Placed",
    items: [
      {
        id: "prod-3",
        name: "Minimalist Leather Backpack",
        price: 129.50,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: "prod-7",
        name: "Mechanical Wireless Keyboard RGB",
        price: 119.00,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80"
      }
    ],
    pricing: {
      subtotal: 248.50,
      shipping: 0.00,
      tax: 12.43,
      total: 260.93
    }
  },
  {
    id: "ORD-61099",
    date: "2025-02-23",
    customer: {
      name: "David Miller",
      email: "david.m@example.com",
      phone: "+1 415 555 0192"
    },
    shippingAddress: {
      address: "500 Howard St, Suite 300",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105"
    },
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
    status: "Shipped",
    items: [
      {
        id: "prod-2",
        name: "Apple Watch Ultra 2 Titanium",
        price: 799.00,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
      }
    ],
    pricing: {
      subtotal: 799.00,
      shipping: 0.00,
      tax: 39.95,
      total: 838.95
    }
  }
];
