import type { InvitationDesign } from "@/design/invitation";

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
      invitations: {
        Row: {
          id: string;
          owner_id: string;
          share_token: string;
          status: "draft" | "pending" | "accepted" | "declined";
          recipient_name: string | null;
          title: string;
          message: string;
          design: InvitationDesign;
          created_at: string;
          updated_at: string;
          sent_at: string | null;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          owner_id: string;
          share_token: string;
          status?: "draft" | "pending" | "accepted" | "declined";
          recipient_name?: string | null;
          title?: string;
          message?: string;
          design?: InvitationDesign;
          created_at?: string;
          updated_at?: string;
          sent_at?: string | null;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          owner_id?: string;
          share_token?: string;
          status?: "draft" | "pending" | "accepted" | "declined";
          recipient_name?: string | null;
          title?: string;
          message?: string;
          design?: InvitationDesign;
          created_at?: string;
          updated_at?: string;
          sent_at?: string | null;
          expires_at?: string | null;
        };
        Relationships: [];
      };
      invitation_responses: {
        Row: {
          id: string;
          invitation_id: string;
          recipient_name: string;
          activity: string | null;
          response_date: string | null;
          response_time: string | null;
          decline_count: number;
          responded_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          recipient_name: string;
          activity?: string | null;
          response_date?: string | null;
          response_time?: string | null;
          decline_count?: number;
          responded_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string;
          recipient_name?: string;
          activity?: string | null;
          response_date?: string | null;
          response_time?: string | null;
          decline_count?: number;
          responded_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invitation_responses_invitation_id_fkey";
            columns: ["invitation_id"];
            isOneToOne: true;
            referencedRelation: "invitations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
