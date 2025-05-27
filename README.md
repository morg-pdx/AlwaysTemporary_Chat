# AlwaysTemp GPT – Chrome Extension Demo

A lightweight extension that ensures `?privateChat=true` is always present via a URL flag. No tracking, no network requests, no logging—just the flag, every time.

---

## Technical Details

| Toggle | What happens |
| ------ | ------------ |
| **Enable Always-Temporary** | The extension patches `history.pushState` / `replaceState` and watches DOM changes. Any time the chat loads without `?privateChat=true`, it rewrites the URL in-place. |
| **Enable Strict Mode** | Same as above **plus** a hard redirect away from the left-hand sidebar (those chats don’t support temporary mode). |

---

As a JavaScript lover who has spent most of their time in backend and infra, this was a great opportunity to dive into lower-level client infrastructure.

I built this app because I was tired of clicking **Temporary mode** on every chat. Originally, it was a simple script that listened for navigations to the chat site and redirected you if the temp parameter wasn’t present. I soon found that this didn’t work with the client being built on React Router, which interacts with Chrome’s History APIs instead of hard refreshing. This meant that when someone changed models or state within the app, my script didn’t pick up on it.

The solution was to write a custom wrapper around the History API to reshape the URL with the necessary GET params for temp chat. We fire an event on navigation actions that synthetically pushes a new URL to Chrome history, then immediately dispatches a `popstate` notification, causing React to update as if a new navigation occurred.

You’ll also notice a throttler on the observer object. It turns out I was destroying my RAM and some client functionality by running this script for every DOM mutation (thousands of times a second—whoops).

You might ask, *why didn’t I just do a quick “if temporary button not clicked, click()”?* It would have been a perfectly viable option, but:

1. It’s more likely that the site changes their button than their API, so this is more durable.  
2. It’s a really cool solution.

Right now I don’t think Gemini, Claude, OpenRouter, etc., offer a temporary mode, but if they do I hope to support those as well.

---

## Project Structure

├── src
│   ├── popup/            # React toggles & CSS
│   ├── core/redirect.ts  # URL-rewrite logic
│   └── storage.ts        # chrome.storage wrappers
