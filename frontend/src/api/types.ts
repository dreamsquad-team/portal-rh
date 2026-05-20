export interface VacationRequest {
  issue_key: string;
  status: string;
  status_category: string;
  contract_type: string;
  start_date: string | null;
  end_date: string | null;
  days_taken: number | null;
  balance: number | null;
  created_at: string;
  jira_url: string;
}

export interface Employee {
  name: string;
  email: string;
  department: string;
  position: string;
  admission_date: string | null;
  years_of_service: number | null;
  completed_one_year: boolean;
  next_anniversary: string | null;
  has_open_request: boolean;
  current_balance: number | null;
  total_days_taken: number;
  latest_request: VacationRequest | null;
  requests: VacationRequest[];
}
