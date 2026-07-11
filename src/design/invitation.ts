import { DEFAULT_MASCOT_ID } from "@/design/mascots";
import { DEFAULT_BACKGROUND_ID } from "@/design/backgrounds";

export interface InvitationDesign {
  mascotId: string;
  backgroundId: string;
  stickers: string[];
}

export const DEFAULT_INVITATION_DESIGN: InvitationDesign = {
  mascotId: DEFAULT_MASCOT_ID,
  backgroundId: DEFAULT_BACKGROUND_ID,
  stickers: [],
};

export const MESSAGE_MAX_LENGTH = 280;
export const TITLE_MAX_LENGTH = 60;
export const RECIPIENT_NAME_MAX_LENGTH = 60;
