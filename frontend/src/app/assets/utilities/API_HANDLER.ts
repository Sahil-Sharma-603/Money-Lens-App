const BASE_URL = 'http://localhost:5001/api';

export type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  params?: Record<string, string>;
};

export type PlaidAccount = {
  account_id: string;
  name: string;
  official_name: string;
  type: string;
  subtype: string;
  mask: string;
};

export type PlaidAccountsResponse = {
  accounts: PlaidAccount[];
};

export type SignupResponse = {
  message: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export type LoginResponse = {
  token: string;
  user: {
    _id: string;
    email: string;
    name: string;
    lastName: string;
  };
};

export type PlaidLinkResponse = {
  link_token: string;
};

export type Transaction = {
  transaction_id: string;
  date: string;
  name: string;
  amount: number;
  category: string[];
};

export type TransactionsResponse = {
  transactions: Transaction[];
  count: number;
};

export type UserResponse = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type DashboardResponse = {
  todaySpending: number;
  recentTransactions: { amount: number; name: string; category: string }[];
  balance: number;
  monthlySpending: { month: string; spent: number; earned: number }[];
  dailyAvg: number; 
  monthAvg: { spent: number; earned: number };
  thisMonth: { spent: number; earned: number };
};

// Update apiRequest function
export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, params, requireAuth = true } = options;

  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const queryParams = new URLSearchParams(params);
    url += `?${queryParams.toString()}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (requireAuth) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    return response.json();
  } catch (error) {
    console.error(`API ${method} ${endpoint} failed:`, error);
    throw error;
  }
}
