import React, { useEffect, useState, ChangeEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { loadRedirectProps, saveRedirectProps } from '../storage';
import './index.css';

export interface ToggleProps {
    isEnabled: boolean;
    isStrict: boolean;
}

function Popup() {
    const [redirect, setRedirect] = useState(false);
    const [strict, setStrict] = useState(false);

    useEffect(() => {
        loadRedirectProps()
            .then(({ isEnabled, isStrict }: ToggleProps) => {
                setRedirect(isEnabled);
                setStrict(isStrict);
            })
            .catch(() => {
                setRedirect(false);
                setStrict(false);
            });
    }, []);

    const persist = (nextRedirect: boolean, nextStrict: boolean) =>
        saveRedirectProps({ isEnabled: nextRedirect, isStrict: nextStrict }).catch(
            (err: Error) => console.error('Error saving redirect props:', err),
        );

    const handleRedirectToggle = (e: ChangeEvent<HTMLInputElement>) => {
        const next = e.target.checked;
        setRedirect(next);
        if (!next) setStrict(false);
        persist(next, strict);
    };

    const handleStrictToggle = (e: ChangeEvent<HTMLInputElement>) => {
        const next = e.target.checked;
        setStrict(next);
        persist(redirect, next);
    };

    const isStrictDisabled = !redirect;

    return (
        <div className="popup-container">
            <header className="popup-header">
                <h1 className="popup-main-title">AlwaysTemp GPT</h1>
            </header>

            <section className="popup-section">
                {/* Redirect toggle */}
                <div className="switch-row">
                    <span id="redirect-switch-label" className="switch-label">
                        Enable Always-Temporary
                    </span>
                    <label className="switch" aria-labelledby="redirect-switch-label">
                        <input
                            type="checkbox"
                            checked={redirect}
                            onChange={handleRedirectToggle}
                            aria-checked={redirect}
                        />
                        <span className="slider round" />
                    </label>
                </div>

                {/* Strict-mode toggle */}
                <div className={`switch-row${isStrictDisabled ? ' disabled' : ''}`}>
                    <span id="strict-switch-label" className="switch-label">
                        Enable Strict Mode
                    </span>
                    <label
                        className="switch"
                        aria-labelledby="strict-switch-label"
                    >
                        <input
                            type="checkbox"
                            checked={strict}
                            onChange={handleStrictToggle}
                            aria-checked={strict}
                            disabled={isStrictDisabled}
                        />
                        <span className="slider round" />
                    </label>
                </div>
            </section>
        </div>
    );
}

const container = document.getElementById('root');
if (container) {
    createRoot(container).render(<Popup />);
}
