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
      products: {
        Row: {
          listing_title: string
          product_cost: number | null
          sku: string
          stock_quantity: number | null
          supplier: string | null
          warehouse_location: string | null
        }
        Insert: {
          listing_title: string
          product_cost?: number | null
          sku: string
          stock_quantity?: number | null
          supplier?: string | null
          warehouse_location?: string | null
        }
        Update: {
          listing_title?: string
          product_cost?: number | null
          sku?: string
          stock_quantity?: number | null
          supplier?: string | null
          warehouse_location?: string | null
        }
        Relationships: []
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
          gross_profit: number | null
          id: number
          platform: string
          promoted: boolean | null
          quantity: number
          sale_date: string
          sku: string | null
          total_price: number | null
        }
        Insert: {
          gross_profit?: number | null
          id?: number
          platform: string
          promoted?: boolean | null
          quantity: number
          sale_date: string
          sku?: string | null
          total_price?: number | null
        }
        Update: {
          gross_profit?: number | null
          id?: number
          platform?: string
          promoted?: boolean | null
          quantity?: number
          sale_date?: string
          sku?: string | null
          total_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_sku_fkey"
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
            referencedRelation: "products"
            referencedColumns: ["sku"]
          },
        ]
      }
    }
    Functions: {
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
