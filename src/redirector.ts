export interface RedirectProps {
    homeUrl: string
    sidebarPath: string
    disabledPaths: string[]
    disabledSubdomains: string[]
    privateChatParam: string
    loadProps: () => Promise<ToggleProps>
}

export interface ToggleProps {
    isEnabled: boolean
    isStrict: boolean
}

export class Redirector {
    private readonly observer: MutationObserver;
    private isInitialized : boolean = false;
    private injectTimer: number | null = null;

    constructor(private cfg: RedirectProps) {
        this.observer = new MutationObserver(this.scheduleInject);
    }

    public async init(): Promise<void> {
        if (this.isInitialized) return;
        this.isInitialized = true;

        history.pushState = this.patchHistory(history.pushState);
        history.replaceState = this.patchHistory(history.replaceState);

        ["popstate", "locationchange"].forEach(e =>
            window.addEventListener(e, this.scheduleInject, { capture: true })
        )
        this.observer.observe(document, { childList: true, subtree: true })
        await this.injectParam()
    }

    private scheduleInject = (): void => {
        if (this.injectTimer !== null) return
        // Only executes on dom repaint (protecting innocent ram)
        this.injectTimer = requestAnimationFrame(async () => {
            this.injectTimer = null
            await this.injectParam()
        })
    }

    // Wraps Chrome API method with instructions to include temporary param
    private patchHistory =
        (fn: typeof history.pushState) =>
            (...args: Parameters<typeof fn>): void => {
                args[2] = this.rewriteUrl(args[2])
                fn.apply(history, args)
                window.dispatchEvent(new Event("locationchange"))
            }

    private setTemporaryParam(url: URL): URL {
        if (!url.searchParams.has(this.cfg.privateChatParam)) {
            url.searchParams.set(this.cfg.privateChatParam, "true")
        }
        return url
    }

    private rewriteUrl(raw: unknown): string {
        const base = typeof raw === "string" && raw !== "" ? raw : location.href
        const url = new URL(base, location.origin)
        this.setTemporaryParam(url)
        return url.pathname + url.search + url.hash
    }

    // Synthetic history pop to assert state of the URL we modified
    private dispatchURL(href: string): void {
        if (href === location.href) return
        history.pushState(history.state, "", href)
        window.dispatchEvent(new PopStateEvent("popstate"))
    }

    private async injectParam(): Promise<void> {
        const { isEnabled, isStrict } = await this.cfg.loadProps()
        if (!isEnabled) return

        const { pathname, hostname, href } = window.location
        if (pathname.startsWith(this.cfg.sidebarPath)) {
            if (isStrict) this.dispatchURL(new URL(this.cfg.homeUrl).href)
            return
        }

        const isDisabledPath = this.cfg.disabledPaths.some(p =>
            pathname.startsWith(p)
        )
        const disabledSub = hostname
            .split(".")
            .slice(0, -2)
            .some(s => this.cfg.disabledSubdomains.includes(s))

        if (disabledSub || isDisabledPath) return

        const url = new URL(href)
        this.setTemporaryParam(url)
        this.dispatchURL(url.href)
    }
}
