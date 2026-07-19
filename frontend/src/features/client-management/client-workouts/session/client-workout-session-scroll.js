const SESSION_SCROLL_DELAY = 250;
const SESSION_SCROLL_RETRY_DELAY = 75;
const SESSION_SCROLL_MAX_ATTEMPTS = 4;

export function getSessionItemScrollId(itemId) {
    return `session-item-${itemId}`;
}

export function getSessionSetScrollId(setKey) {
    return `session-set-${setKey}`;
}

export function getSessionStepScrollId(stepKey) {
    return `session-step-${stepKey}`;
}

export function getSessionRestScrollId(sourceKey) {
    return `session-rest-${sourceKey}`;
}

export function scheduleSessionScroll(targetId,
    {
        block = 'start',
        behavior = 'smooth',
        delay = SESSION_SCROLL_DELAY,
        onScrolled,
    } = {},
) {
    let timeoutId = null;
    let frameId = null;
    let cancelled = false;

    function queueAttempt(attempt) {
        timeoutId = window.setTimeout(
            () => {
                frameId = window.requestAnimationFrame(() => {
                    if (cancelled) {
                        return;
                    }

                    const target = document.getElementById(targetId);

                    if (target) {
                        target.scrollIntoView({
                            behavior,
                            block,
                        });

                        onScrolled?.();
                        return;
                    }

                    if (attempt + 1 < SESSION_SCROLL_MAX_ATTEMPTS) {
                        queueAttempt(attempt + 1);
                    }
                });
            },
            attempt === 0 ? delay : SESSION_SCROLL_RETRY_DELAY,
        );
    }

    queueAttempt(0);

    return () => {
        cancelled = true;

        if (timeoutId !== null) {
            window.clearTimeout(timeoutId);
        }

        if (frameId !== null) {
            window.cancelAnimationFrame(frameId);
        }
    };
}