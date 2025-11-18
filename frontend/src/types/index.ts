export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'customer' | 'sales' | 'reservation' | 'finance' | 'operations';
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  lead_id: string;
  name: string;
  email: string;
  phone: string;
  source: 'Website' | 'Social Media' | 'Email' | 'Walk-in' | 'Referral';
  type: 'B2B' | 'B2C';
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  agent_id: string;
  agent?: User;
  value?: number;
  notes?: string;
  last_contact?: string;
  next_followup?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  category_id?: string;
  category?: Category;
  total_value: number;
  status: 'Active' | 'Inactive' | 'Suspended';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  sale_id: string;
  customer_id: string;
  customer?: Customer;
  agent_id: string;
  agent?: User;
  amount: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Refunded';
  payment_method: 'Cash' | 'Card' | 'Bank Transfer' | 'Check';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  reservation_id: string;
  customer_id: string;
  customer?: Customer;
  service: string;
  date: string;
  time: string;
  duration: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  ticket_id: string;
  customer_id: string;
  customer?: Customer;
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assigned_to?: string;
  assignee?: User;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  user_id: string;
  user?: User;
  date: string;
  check_in: string;
  check_out?: string;
  total_hours?: number;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day';
  notes?: string;
  created_at: string;
  updated_at: string;
}