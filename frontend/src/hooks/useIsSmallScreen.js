import { useMediaQuery } from '@mantine/hooks';

const MOBILE_QUERY = '(max-width: 48em)';

export function useIsSmallScreen() {
    return useMediaQuery(MOBILE_QUERY);
}

export default useIsSmallScreen;