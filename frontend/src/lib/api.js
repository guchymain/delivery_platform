import axios from 'axios';

const rawUrl = (import.meta.env.VITE_API_URL || '').trim();
const cleanUrl = rawUrl.replace(/\/+$/, '');
const API_BASE_URL = cleanUrl
  ? (cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`)
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

// Attach JWT token from localStorage to all outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('delivery_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthenticated and format error message
api.interceptors.response.use(
  (response) => {
    // Normalization helper: ensure response.data.data exists for standard access
    if (response.data && typeof response.data === 'object' && response.data.data === undefined) {
      // Map common backend root keys into .data
      if (response.data.delivery) response.data.data = response.data.delivery;
      else if (response.data.deliveries) response.data.data = { deliveries: response.data.deliveries, total: response.data.total };
      else if (response.data.jobs) response.data.data = response.data.jobs;
      else if (response.data.profile) response.data.data = response.data.profile;
      else if (response.data.payments) response.data.data = { payments: response.data.payments, total: response.data.total };
      else if (response.data.payment) response.data.data = response.data.payment;
      else if (response.data.users) response.data.data = { users: response.data.users, total: response.data.total };
      else if (response.data.riders) response.data.data = { riders: response.data.riders, total: response.data.count };
      else if (response.data.metrics) {
        const m = response.data.metrics;
        response.data.data = {
          totalUsers: m.users?.total || 0,
          totalRiders: m.ridersFleet?.total || 0,
          totalDeliveries: m.deliveries?.total || 0,
          activeDeliveries: m.deliveries?.active || 0,
          completedDeliveries: m.deliveries?.delivered || 0,
          totalRevenue: m.financials?.totalRevenue || 0,
          pendingRevenue: 0,
          rawMetrics: m
        };
      } else if (response.data.user) response.data.data = response.data.user;
    }
    return response;
  },
  (error) => {
    let message =
      error.response?.data?.message ||
      (error.response?.data?.errors &&
        error.response.data.errors.map((e) => e.message || e).join(', ')) ||
      error.message ||
      'An unexpected error occurred';

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      message = 'Server request timed out. The cloud server may be waking up from sleep; please try again.';
    } else if (error.message === 'Network Error') {
      message = 'Network connection error. Please ensure the backend is active and CORS is permitted.';
    }

    // Attach user-friendly formatted message to error object
    error.displayMessage = message;

    if (error.response?.status === 401) {
      const isAuthUrl =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register');

      if (!isAuthUrl) {
        localStorage.removeItem('delivery_token');
        localStorage.removeItem('delivery_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    return Promise.reject(error);
  }
);

// 1. Authentication Endpoints
export const authAPI = {
  login: async (credentials) => {
    const payload = credentials?.email
      ? { email: credentials.email, password: credentials.password }
      : credentials;
    const res = await api.post('/auth/login', payload);
    return res.data;
  },
  register: async (payload) => {
    // Map any snake_case to backend expected camelCase if provided
    const body = {
      name: payload.name || `${payload.first_name || ''} ${payload.last_name || ''}`.trim(),
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      role: payload.role || 'CUSTOMER',
      vehicleType: payload.vehicle_type || payload.vehicleType,
      plateNumber: payload.vehicle_number || payload.plateNumber,
      licenseNumber: payload.license_number || payload.licenseNumber
    };
    const res = await api.post('/auth/register', body);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  changePassword: async ({ current_password, currentPassword, new_password, newPassword }) => {
    const res = await api.put('/auth/password', {
      currentPassword: currentPassword || current_password,
      newPassword: newPassword || new_password
    });
    return res.data;
  }
};

// 2. Deliveries Endpoints
export const deliveryAPI = {
  create: async (payload) => {
    const body = {
      pickupAddress: payload.pickup_address || payload.pickupAddress,
      pickupContactName: payload.sender_name || payload.pickupContactName || 'Sender',
      pickupContactPhone: payload.sender_phone || payload.pickupContactPhone || '0000000000',
      pickupNotes: payload.pickup_notes || payload.pickupNotes,
      deliveryAddress: payload.delivery_address || payload.deliveryAddress,
      recipientName: payload.recipient_name || payload.recipientName,
      recipientPhone: payload.recipient_phone || payload.recipientPhone,
      deliveryNotes: payload.delivery_notes || payload.deliveryNotes,
      packageType: payload.package_type || payload.packageType || 'PARCEL',
      packageWeight: parseFloat(payload.weight || payload.packageWeight || 1.0),
      packageDescription: payload.package_description || payload.packageDescription,
      paymentMethod: payload.payment_method || payload.paymentMethod || 'CASH'
    };
    return await api.post('/deliveries', body);
  },
  getAll: async (params = {}) => {
    return await api.get('/deliveries', { params });
  },
  getById: async (id) => {
    return await api.get(`/deliveries/${id}`);
  },
  track: async (trackingCode) => {
    return await api.get(`/deliveries/track/${trackingCode}`);
  },
  update: async (id, payload) => {
    return await api.put(`/deliveries/${id}`, payload);
  },
  confirm: async (id) => {
    return await api.post(`/deliveries/${id}/confirm`);
  },
  cancel: async (id, reason) => {
    return await api.post(`/deliveries/${id}/cancel`, { reason });
  },
  accept: async (id) => {
    return await api.post(`/deliveries/${id}/accept`);
  },
  release: async (id, reason) => {
    return await api.post(`/deliveries/${id}/release`, { reason });
  },
  updateStatus: async (id, status, notes) => {
    return await api.put(`/deliveries/${id}/status`, { status, notes });
  }
};
export const deliveriesAPI = deliveryAPI;

// 3. Rider Endpoints
export const riderAPI = {
  getProfile: async () => {
    return await api.get('/riders/profile');
  },
  updateProfile: async (payload) => {
    const body = {
      vehicleType: payload.vehicle_type || payload.vehicleType,
      plateNumber: payload.vehicle_number || payload.plateNumber,
      licenseNumber: payload.license_number || payload.licenseNumber
    };
    return await api.put('/riders/profile', body);
  },
  updateAvailability: async (availabilityStatus) => {
    return await api.put('/riders/availability', { availabilityStatus });
  },
  getAvailableDeliveries: async () => {
    return await api.get('/riders/available-jobs');
  },
  getAvailableJobs: async () => {
    return await api.get('/riders/available-jobs');
  },
  getDeliveries: async (params = {}) => {
    return await api.get('/riders/history', { params });
  },
  getHistory: async (params = {}) => {
    return await api.get('/riders/history', { params });
  },
  getActiveDelivery: async () => {
    // Find delivery assigned to this rider in transit
    const res = await api.get('/deliveries', { params: { limit: 10 } });
    const deliveries = res.data?.data?.deliveries || res.data?.deliveries || [];
    const active = deliveries.find((d) =>
      ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(d.status)
    );
    return { data: { data: active || null, success: true } };
  },
  acceptDelivery: async (id) => {
    return await api.post(`/deliveries/${id}/accept`);
  },
  releaseDelivery: async (id, reason) => {
    return await api.post(`/deliveries/${id}/release`, { reason });
  },
  updateDeliveryStatus: async (id, status, notes) => {
    return await api.put(`/deliveries/${id}/status`, { status, notes });
  }
};
export const ridersAPI = riderAPI;

// 4. Payments Endpoints
export const paymentAPI = {
  processPayment: async (payload) => {
    const id = payload.delivery_id || payload.deliveryId || payload.id;
    const body = {
      paymentMethod: payload.payment_method || payload.paymentMethod || 'CARD',
      notes: payload.notes || 'Settled via customer portal'
    };
    return await api.post(`/payments/${id}/pay`, body);
  },
  pay: async (deliveryId, { paymentMethod, notes }) => {
    return await api.post(`/payments/${deliveryId}/pay`, { paymentMethod, notes });
  },
  getMyPayments: async (params = {}) => {
    return await api.get('/payments', { params });
  },
  getAll: async (params = {}) => {
    return await api.get('/payments', { params });
  },
  getAllPayments: async (params = {}) => {
    return await api.get('/payments', { params });
  },
  getById: async (id) => {
    return await api.get(`/payments/${id}`);
  },
  refund: async (id, reason) => {
    return await api.post(`/payments/${id}/refund`, { reason });
  }
};
export const paymentsAPI = paymentAPI;

// 5. Administration Endpoints
export const adminAPI = {
  getMetrics: async () => {
    return await api.get('/admin/overview');
  },
  getOverview: async () => {
    return await api.get('/admin/overview');
  },
  getUsers: async (params = {}) => {
    return await api.get('/admin/users', { params });
  },
  getUserById: async (id) => {
    return await api.get(`/admin/users/${id}`);
  },
  updateUserStatus: async (id, status) => {
    return await api.put(`/admin/users/${id}/status`, { status });
  },
  updateUser: async (id, payload) => {
    return await api.put(`/admin/users/${id}`, payload);
  },
  deleteUser: async (id) => {
    return await api.delete(`/admin/users/${id}`);
  },
  getRiders: async (params = {}) => {
    return await api.get('/admin/riders', { params });
  },
  assignRider: async (deliveryId, riderId) => {
    return await api.put(`/admin/deliveries/${deliveryId}/assign`, { riderId: Number(riderId) });
  },
  updateDeliveryStatus: async (id, status, notes) => {
    return await api.put(`/deliveries/${id}/status`, { status, notes });
  }
};

// 6. User Profile Endpoints
export const userAPI = {
  getProfile: async () => {
    return await api.get('/users/profile');
  },
  updateProfile: async (payload) => {
    const name = payload.name || `${payload.first_name || ''} ${payload.last_name || ''}`.trim();
    return await api.put('/users/profile', {
      name: name || undefined,
      phone: payload.phone || undefined
    });
  },
  changePassword: async (payload) => {
    return await authAPI.changePassword(payload);
  },
  deactivateAccount: async () => {
    return await api.post('/users/deactivate');
  }
};
export const usersAPI = userAPI;

export default api;
