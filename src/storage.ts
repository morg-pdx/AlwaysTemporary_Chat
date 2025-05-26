import {DEFAULT_REDIRECT_PROPS, ToggleProps} from "./obj/toggleProps";
export const REDIRECT_PROPS_KEY = 'redirectProps';

export const loadRedirectProps = async (): Promise<ToggleProps> => {
    const { [REDIRECT_PROPS_KEY]: stored = DEFAULT_REDIRECT_PROPS } =
        await chrome.storage.local.get(REDIRECT_PROPS_KEY);

    return stored as ToggleProps;
};

export const saveRedirectProps = async (updates: Partial<ToggleProps>): Promise<void> => {
    const current = await loadRedirectProps();
    const updated = { ...current, ...updates };
    await chrome.storage.local.set({ [REDIRECT_PROPS_KEY]: updated });
};