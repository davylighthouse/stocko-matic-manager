export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      amazon_fba_tiers: {
        Row: {
          created_at: string | null
          fee_amount: number
          id: number
          size_category: string
          tier_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fee_amount?: number
          id?: number
          size_category: string
          tier_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fee_amount?: number
          id?: number
          size_category?: string
          tier_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      bundle_components: {
        Row: {
          bundle_sku: string | null
          calculated_cost_price: number | null
          calculated_stock_quantity: number | null
          component_sku: string | null
          created_at: string | null
          id: number
          quantity: number
          updated_at: string | null
        }
        Insert: {
          bundle_sku?: string | null
          calculated_cost_price?: number | null
          calculated_stock_quantity?: number | null
          component_sku?: string | null
          created_at?: string | null
          id?: number
          quantity: number
          updated_at?: string | null
        }
        Update: {
          bundle_sku?: string | null
          calculated_cost_price?: number | null
          calculated_stock_quantity?: number | null
          component_sku?: string | null
          created_at?: string | null
          id?: number
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bundle_components_bundle_sku_fkey"
            columns: ["bundle_sku"]
            isOneToOne: false
            referencedRelation: "current_stock_levels"
            referencedColumns: ["sku"]
          },
          {
            foreignKeyName: "bundle_components_bundle_sku_fkey"
            columns: ["bundle_sku"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["sku"]
          },
          {
            foreignKeyName: "bundle_components_component_sku_fkey"
            columns: ["component_sku"]
            isOneToOne: false
            referencedRelation: "current_stock_levels"
            referencedColumns: ["sku"]
          },
          {
            foreignKeyName: "bundle_components_component_sku_fkey"
            columns: ["component_sku"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["sku"]
          },
        ]
      }
      bundle_products: {
        Row: {
          bundle_sku: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          bundle_sku: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          bundle_sku?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bundle_products_bundle_sku_fkey"
            columns: ["bundle_sku"]
            isOneToOne: true
            referencedRelation: "current_stock_levels"
            referencedColumns: ["sku"]
          },
          {
            foreignKeyName: "bundle_products_bundle_sku_fkey"
            columns: ["bundle_sku"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["sku"]
          },
        ]
      }
      courier_settings: {
        Row: {
          courier: string
          created_at: string | null
          id: number
          surcharge_percentage: number
          updated_at: string | null
        }
        Insert: {
          courier: string
          created_at?: string | null
          id?: number
          surcharge_percentage?: number
          updated_at?: string | null
        }
        Update: {
          courier?: string
          created_at?: string | null
          id?: number
          surcharge_percentage?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      initial_stock: {
        Row: {
          created_at: string | null
          effective_date: string
          id: number
          quantity: number
          sku: string | null
        }
        Insert: {
          created_at?: string | null
          effective_date: string
          id?: number
          quantity: number
          sku?: string | null
        }
        Update: {
          created_at?: string | null
          effective_date?: string
          id?: number
          quantity?: number
          sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "initial_stock_sku_fkey"
            columns: ["sku"]
            isOneToOne: true
            referencedRelation: "current_stock_levels"
            referencedColumns: ["sku"]
          },
          {
            foreignKeyName: "initial_stock_sku_fkey"
            columns: ["sku"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["sku"]
          },
        ]
      }
      picking_fee_history: {
        Row: {
          created_at: string | null
          created_by: string | null
          effective_from: string
          effective_to: string | null
          fee_amount: number
          fee_name: string
          id: number
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          effective_from: string
          effective_to?: string | null
          fee_amount: number
          fee_name: string
          id?: number
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          effective_from?: string
          effective_to?: string | null
          fee_amount?: number
          fee_name?: string
          id?: number
          notes?: string | null
        }
        Relationships: []
      }
      platform_fee_history: {
        Row: {
          created_at: string | null
          created_by: string | null
          effective_from: string
          effective_to: string | null
          flat_fee: number
          id: number
          notes: string | null
          percentage_fee: number
          platform_name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          effective_from: string
          effective_to?: string | null
          flat_fee?: number
          id?: number
          notes?: string | null
          percentage_fee?: number
          platform_name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          effective_from?: string
          effective_to?: string | null
          flat_fee?: number
          id?: number
          notes?: string | null
          percentage_fee?: number
          platform_name?: string
        }
        Relationships: []
      }
      product_cost_history: {
        Row: {
          additional_costs: number | null
          advertising_cost: number | null
          created_at: string | null
          created_by: string | null
          effective_from: string
          effective_to: string | null
          id: number
          making_up_cost: number | null
          notes: string | null
          packaging_cost: number | null
          product_cost: number
          promoted_listing_percentage: number | null
          sku: string
        }
        Insert: {
          additional_costs?: number | null
          advertising_cost?: number | null
          created_at?: string | null
          created_by?: string | null
          effective_from: string
          effective_to?: string | null
          id?: number
          making_up_cost?: number | null
          notes?: string | null
          packaging_cost?: number | null
          product_cost: number
          promoted_listing_percentage?: number | null
          sku: string
        }
        Update: {
          additional_costs?: number | null
          advertising_cost?: number | null
          created_at?: string | null
          created_by?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: number
          making_up_cost?: number | null
          notes?: string | null
          packaging_cost?: number | null
          product_cost?: number
          promoted_listing_percentage?: number | null
          sku?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          additional_costs: number | null
          additional_costs_notes: string | null
          amazon_fba_tier_id: number | null
          default_picking_fee_id: number
          default_shipping_service: string | null
          default_shipping_service_id: number
          dimensions_height: number | null
          dimensions_length: number | null
          dimensions_width: number | null
          listing_title: string
          low_stock_threshold: number | null
          making_up_cost: number | null
          making_up_cost_notes: string | null
          order_index: number | null
          packaging_cost: number | null
          packaging_cost_notes: string | null
          product_cost: number | null
          product_cost_notes: string | null
          product_status: string | null
          promoted_listing_percentage: number | null
          sku: string
          stock_quantity: number
          supplier: string | null
          vat_status: string | null
          warehouse_location: string | null
          weight: number | null
        }
        Insert: {
          additional_costs?: number | null
          additional_costs_notes?: string | null
          amazon_fba_tier_id?: number | null
          default_picking_fee_id: number
          default_shipping_service?: string | null
          default_shipping_service_id: number
          dimensions_height?: number | null
          dimensions_length?: number | null
          dimensions_width?: number | null
          listing_title: string
          low_stock_threshold?: number | null
          making_up_cost?: number | null
          making_up_cost_notes?: string | null
          order_index?: number | null
          packaging_cost?: number | null
          packaging_cost_notes?: string | null
          product_cost?: number | null
          product_cost_notes?: string | null
          product_status?: string | null
          promoted_listing_percentage?: number | null
          sku: string
          stock_quantity?: number
          supplier?: string | null
          vat_status?: string | null
          warehouse_location?: string | null
          weight?: number | null
        }
        Update: {
          additional_costs?: number | null
          additional_costs_notes?: string | null
          amazon_fba_tier_id?: number | null
          default_picking_fee_id?: number
          default_shipping_service?: string | null
          default_shipping_service_id?: number
          dimensions_height?: number | null
          dimensions_length?: number | null
          dimensions_width?: number | null
          listing_title?: string
          low_stock_threshold?: number | null
          making_up_cost?: number | null
          making_up_cost_notes?: string | null
          order_index?: number | null
          packaging_cost?: number | null
          packaging_cost_notes?: string | null
          product_cost?: number | null
          product_cost_notes?: string | null
          product_status?: string | null
          promoted_listing_percentage?: number | null
          sku?: string
          stock_quantity?: number
          supplier?: string | null
          vat_status?: string | null
          warehouse_location?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_amazon_fba_tier_id_fkey"
            columns: ["amazon_fba_tier_id"]
            isOneToOne: false
            referencedRelation: "amazon_fba_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_default_picking_fee_id_fkey"
            columns: ["default_picking_fee_id"]
            isOneToOne: false
            referencedRelation: "current_picking_fees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_default_picking_fee_id_fkey"
            columns: ["default_picking_fee_id"]
            isOneToOne: false
            referencedRelation: "picking_fee_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_default_shipping_service_id_fkey"
            columns: ["default_shipping_service_id"]
            isOneToOne: false
            referencedRelation: "shipping_services"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          advertising_cost: number | null
          gross_profit: number | null
          id: number
          platform: string
          promoted: boolean | null
          quantity: number
          sale_date: string
          shipping_service_id: number | null
          sku: string | null
          total_price: number | null
          verified: boolean | null
        }
        Insert: {
          advertising_cost?: number | null
          gross_profit?: number | null
          id?: number
          platform: string
          promoted?: boolean | null
          quantity: number
          sale_date: string
          shipping_service_id?: number | null
          sku?: string | null
          total_price?: number | null
          verified?: boolean | null
        }
        Update: {
          advertising_cost?: number | null
          gross_profit?: number | null
          id?: number
          platform?: string
          promoted?: boolean | null
          quantity?: number
          sale_date?: string
          shipping_service_id?: number | null
          sku?: string | null
          total_price?: number | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_shipping_service_id_fkey"
            columns: ["shipping_service_id"]
            isOneToOne: false
            referencedRelation: "shipping_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "current_stock_levels"
            referencedColumns: ["sku"]
          },
          {
            foreignKeyName: "sales_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["sku"]
          },
        ]
      }
      shipping_rate_history: {
        Row: {
          created_at: string | null
          created_by: string | null
          effective_from: string
          effective_to: string | null
          id: number
          notes: string | null
          price: number
          service_id: number | null
          weight_from: number
          weight_to: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          effective_from: string
          effective_to?: string | null
          id?: number
          notes?: string | null
          price?: number
          service_id?: number | null
          weight_from: number
          weight_to: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: number
          notes?: string | null
          price?: number
          service_id?: number | null
          weight_from?: number
          weight_to?: number
        }
        Relationships: [
          {
            foreignKeyName: "shipping_rate_history_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "shipping_services"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_services: {
        Row: {
          courier: string
          created_at: string | null
          id: number
          max_weight: number
          price: number
          service_name: string
          updated_at: string | null
        }
        Insert: {
          courier: string
          created_at?: string | null
          id?: number
          max_weight?: number
          price?: number
          service_name: string
          updated_at?: string | null
        }
        Update: {
          courier?: string
          created_at?: string | null
          id?: number
          max_weight?: number
          price?: number
          service_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stock_adjustments: {
        Row: {
          adjustment_date: string | null
          created_at: string | null
          id: number
          notes: string | null
          quantity: number
          sku: string | null
        }
        Insert: {
          adjustment_date?: string | null
          created_at?: string | null
          id?: number
          notes?: string | null
          quantity: number
          sku?: string | null
        }
        Update: {
          adjustment_date?: string | null
          created_at?: string | null
          id?: number
          notes?: string | null
          quantity?: number
          sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_adjustments_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "current_stock_levels"
            referencedColumns: ["sku"]
          },
          {
            foreignKeyName: "stock_adjustments_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["sku"]
          },
        ]
      }
      stock_check_items: {
        Row: {
          created_at: string | null
          id: number
          product_cost: number | null
          quantity: number
          sku: string | null
          stock_check_id: number | null
          warehouse_location: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          product_cost?: number | null
          quantity: number
          sku?: string | null
          stock_check_id?: number | null
          warehouse_location?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          product_cost?: number | null
          quantity?: number
          sku?: string | null
          stock_check_id?: number | null
          warehouse_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_check_items_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "current_stock_levels"
            referencedColumns: ["sku"]
          },
          {
            foreignKeyName: "stock_check_items_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["sku"]
          },
          {
            foreignKeyName: "stock_check_items_stock_check_id_fkey"
            columns: ["stock_check_id"]
            isOneToOne: false
            referencedRelation: "latest_stock_check_quantities"
            referencedColumns: ["stock_check_id"]
          },
          {
            foreignKeyName: "stock_check_items_stock_check_id_fkey"
            columns: ["stock_check_id"]
            isOneToOne: false
            referencedRelation: "stock_checks"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_checks: {
        Row: {
          check_date: string | null
          completed: boolean | null
          id: number
          notes: string | null
        }
        Insert: {
          check_date?: string | null
          completed?: boolean | null
          id?: number
          notes?: string | null
        }
        Update: {
          check_date?: string | null
          completed?: boolean | null
          id?: number
          notes?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      current_picking_fees: {
        Row: {
          effective_from: string | null
          effective_to: string | null
          fee_amount: number | null
          fee_name: string | null
          id: number | null
        }
        Insert: {
          effective_from?: string | null
          effective_to?: string | null
          fee_amount?: number | null
          fee_name?: string | null
          id?: number | null
        }
        Update: {
          effective_from?: string | null
          effective_to?: string | null
          fee_amount?: number | null
          fee_name?: string | null
          id?: number | null
        }
        Relationships: []
      }
      current_platform_fees: {
        Row: {
          effective_from: string | null
          effective_to: string | null
          flat_fee: number | null
          percentage_fee: number | null
          platform_name: string | null
        }
        Insert: {
          effective_from?: string | null
          effective_to?: string | null
          flat_fee?: number | null
          percentage_fee?: number | null
          platform_name?: string | null
        }
        Update: {
          effective_from?: string | null
          effective_to?: string | null
          flat_fee?: number | null
          percentage_fee?: number | null
          platform_name?: string | null
        }
        Relationships: []
      }
      current_product_costs: {
        Row: {
          additional_costs: number | null
          advertising_cost: number | null
          making_up_cost: number | null
          packaging_cost: number | null
          product_cost: number | null
          promoted_listing_percentage: number | null
          sku: string | null
        }
        Insert: {
          additional_costs?: number | null
          advertising_cost?: number | null
          making_up_cost?: number | null
          packaging_cost?: number | null
          product_cost?: number | null
          promoted_listing_percentage?: number | null
          sku?: string | null
        }
        Update: {
          additional_costs?: number | null
          advertising_cost?: number | null
          making_up_cost?: number | null
          packaging_cost?: number | null
          product_cost?: number | null
          promoted_listing_percentage?: number | null
          sku?: string | null
        }
        Relationships: []
      }
      current_shipping_rates: {
        Row: {
          effective_from: string | null
          effective_to: string | null
          price: number | null
          service_id: number | null
          weight_from: number | null
          weight_to: number | null
        }
        Insert: {
          effective_from?: string | null
          effective_to?: string | null
          price?: number | null
          service_id?: number | null
          weight_from?: number | null
          weight_to?: number | null
        }
        Update: {
          effective_from?: string | null
          effective_to?: string | null
          price?: number | null
          service_id?: number | null
          weight_from?: number | null
          weight_to?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_rate_history_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "shipping_services"
            referencedColumns: ["id"]
          },
        ]
      }
      current_stock_levels: {
        Row: {
          adjustments: number | null
          current_stock: number | null
          initial_stock: number | null
          quantity_sold: number | null
          sku: string | null
        }
        Relationships: []
      }
      latest_stock_check_quantities: {
        Row: {
          check_date: string | null
          last_check_quantity: number | null
          sku: string | null
          stock_check_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_check_items_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "current_stock_levels"
            referencedColumns: ["sku"]
          },
          {
            foreignKeyName: "stock_check_items_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["sku"]
          },
        ]
      }
      sales_profitability: {
        Row: {
          advertising_cost: number | null
          fba_fee_amount: number | null
          listing_title: string | null
          platform: string | null
          platform_fee_percentage: number | null
          platform_fees: number | null
          platform_flat_fee: number | null
          promoted: boolean | null
          promoted_listing_percentage: number | null
          quantity: number | null
          sale_date: string | null
          sale_id: number | null
          shipping_cost: number | null
          sku: string | null
          total_price: number | null
          total_product_cost: number | null
          vat_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "current_stock_levels"
            referencedColumns: ["sku"]
          },
          {
            foreignKeyName: "sales_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["sku"]
          },
        ]
      }
      sales_totals: {
        Row: {
          earliest_sale: string | null
          latest_sale: string | null
          total_profit: number | null
          total_quantity: number | null
          total_sales: number | null
          unique_products: number | null
        }
        Relationships: []
      }
      sales_with_products: {
        Row: {
          gross_profit: number | null
          id: number | null
          listing_title: string | null
          platform: string | null
          promoted: boolean | null
          quantity: number | null
          sale_date: string | null
          sku: string | null
          total_price: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "current_stock_levels"
            referencedColumns: ["sku"]
          },
          {
            foreignKeyName: "sales_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["sku"]
          },
        ]
      }
      total_sales_quantities: {
        Row: {
          sku: string | null
          total_sold: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "current_stock_levels"
            referencedColumns: ["sku"]
          },
          {
            foreignKeyName: "sales_sku_fkey"
            columns: ["sku"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["sku"]
          },
        ]
      }
    }
    Functions: {
      calculate_stock_for_sku: {
        Args: {
          p_sku: string
        }
        Returns: number
      }
      get_picking_fee_at_date: {
        Args: {
          p_fee_name: string
          p_date: string
        }
        Returns: number
      }
      get_platform_fee_at_date: {
        Args: {
          p_platform_name: string
          p_date: string
        }
        Returns: {
          percentage_fee: number
          flat_fee: number
        }[]
      }
      get_product_cost_at_date: {
        Args: {
          p_sku: string
          p_date: string
        }
        Returns: {
          product_cost: number
          packaging_cost: number
          making_up_cost: number
          additional_costs: number
          promoted_listing_percentage: number
        }[]
      }
      get_promoted_listing_percentage_at_date: {
        Args: {
          p_sku: string
          p_date: string
        }
        Returns: number
      }
      get_shipping_rate_at_date: {
        Args: {
          p_service_id: number
          p_weight: number
          p_date: string
        }
        Returns: number
      }
      get_top_products_by_sales: {
        Args: {
          start_date: string
          end_date: string
        }
        Returns: {
          rank: number
          sku: string
          listing_title: string
          total_sales: number
          total_quantity: number
          grand_total: number
        }[]
      }
      is_bundle_component: {
        Args: {
          p_sku: string
        }
        Returns: boolean
      }
      process_product_updates: {
        Args: {
          p_sku: string
          p_updates: Json
        }
        Returns: undefined
      }
      safe_to_integer: {
        Args: {
          v: string
        }
        Returns: number
      }
      update_stock_quantities: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_stock_quantity: {
        Args: {
          p_sku: string
          p_quantity: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
