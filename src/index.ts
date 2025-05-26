import {
    DISABLED_PATHS,
    DISABLED_SUBDOMAINS,
    HOME_URL,
    PRIVATE_CHAT_GET_PARAM,
    SIDEBAR_PATH
} from "./obj/constants"
import { loadRedirectProps } from "./storage"
import {Redirector, RedirectProps} from "./redirector";

const redirectProps: RedirectProps = {
    homeUrl: HOME_URL,
    sidebarPath: SIDEBAR_PATH,
    disabledPaths: DISABLED_PATHS,
    disabledSubdomains: DISABLED_SUBDOMAINS,
    privateChatParam: PRIVATE_CHAT_GET_PARAM,
    loadProps: loadRedirectProps
}
const redirector = new Redirector(redirectProps);
await redirector.init();