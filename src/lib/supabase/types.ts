export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_mascot_id: string;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_mascot_id?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_mascot_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
