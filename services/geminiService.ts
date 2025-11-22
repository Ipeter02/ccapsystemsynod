
// AI Functionality has been removed from this system.
// This file is kept as a placeholder to avoid build errors in case of lingering imports.

export const generateAssistantResponse = async (
  prompt: string, 
  context: string,
  location?: { lat: number; lng: number }
): Promise<string> => {
    return "AI Assistant is currently disabled.";
};

export const summarizeChat = async (messages: string[]): Promise<string> => {
    return "AI Summary is currently disabled.";
};
