import {useEffect} from 'react';

export function useScreenWakeLock(enabled = true) {
    useEffect(() => {
        if (!enabled || !('wakeLock' in navigator)) {
            return;
        }

        let disposed = false;
        let wakeLock = null;

        async function requestWakeLock() {
            if (disposed || wakeLock || document.visibilityState !== 'visible') {
                return;
            }

            try {
                const nextWakeLock = await navigator.wakeLock.request('screen');

                if (disposed) {
                    await nextWakeLock.release();
                    return;
                }

                wakeLock = nextWakeLock;

                wakeLock.addEventListener('release', () => {
                    wakeLock = null;
                });
            } catch (error) {
                /*
                 * Wake Lock is optional enhancement behavior.
                 * The session remains fully usable when unsupported or denied.
                 */
                console.warn('Unable to keep the screen awake:', error);
            }
        }

        function handleVisibilityChange() {
            if (document.visibilityState === 'visible') {
                requestWakeLock();
            }
        }

        requestWakeLock();

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            disposed = true;

            document.removeEventListener('visibilitychange', handleVisibilityChange);

            if (wakeLock) {
                wakeLock.release().catch(() => {});
                wakeLock = null;
            }
        };
    }, [enabled]);
}

export default useScreenWakeLock;