
export interface ShippingRateHistory {
  id: number;
  service_id: number;
  weight_from: number;
  weight_to: number;
  price: number;
  effective_from: string;
  effective_to: string | null;
  notes: string | null;
  shipping_services: {
    service_name: string;
  };
}

export interface ShippingService {
  id: number;
  service_name: string;
}

export interface NewRate {
  service_id: string;
  weight_from: string;
  weight_to: string;
  price: string;
  effective_from: Date;
  notes: string;
}
