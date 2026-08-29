export type Intent =
  | "find_medical"
  | "find_food"
  | "find_water"
  | "find_shelter"
  | "report_missing_person"
  | "report_found_item"
  | "report_missing_person_confirm"
  | "report_found_item_confirm"
  | "connect_helper"
  | "general_query"
  | "greeting"
  | "unknown";

export type Language = "mr" | "hi" | "en";

export interface ConversationState {
  sessionId: string;
  callSid: string;
  callerPhone: string;
  language: Language;
  intent: Intent | null;
  location: { lat: number; lng: number } | null;
  collectedInfo: Record<string, string>;
  turnCount: number;
  lastActivity: Date;
}

export interface ParsedUtterance {
  intent: Intent;
  language: Language;
  entities: {
    location?: string;
    personName?: string;
    personDescription?: string;
    itemDescription?: string;
    serviceType?: string;
  };
  confidence: number;
}

export interface ServiceResult {
  id: string;
  name: string;
  type: string;
  location: { lat: number; lng: number };
  distance: number;
  contactPhone?: string;
  description?: string;
}

export interface ReportResult {
  id: string;
  type: string;
  status: string;
  confirmationCode: string;
}
