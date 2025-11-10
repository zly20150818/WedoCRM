export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  imageUrl?: string;
};

export type Project = {
  id?: string;
  name: string; // project_name in DB
  project_number: string;
  customer_id: string; // customer in DB
  project_type: string;
  project_stage: string; // stage in DB
  owner_id: string; // project_owner in DB
  description?: string;
  estimated_value: number;
  budget: number;
  start_date?: Date; // startDate in DB
  end_date?: Date; // endDate in DB
};
