const BASE_URL = 'http://localhost:5001/api';

export type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  params?: Record<string, string>;
  requireAuth?: boolean; // Add this line
};

// export type PlaidAccount = {
//   account_id: string;
//   name: string;
//   official_name: string;
//   type: string;
//   subtype: string;
//   mask: string;
// };

export interface PlaidAccount {
  id: string;
  name: string;
  mask: string;
  type: string;
  subtype: string;
  verification_status: string;
}


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
  _id: string;
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

// CSV Import response type
export type CSVImportResponse = {
  success: boolean;
  count: number;
  skipped: number;
  errors: number;
  errorDetails?: any[];
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

// Function for uploading files (like CSV)
export async function uploadFile<T>(
  endpoint: string,
  formData: FormData,
): Promise<T> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  let url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'File upload failed');
    }

    return response.json();
  } catch (error) {
    console.error(`File upload to ${endpoint} failed:`, error);
    throw error;
  }
}