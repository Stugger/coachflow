import {useDisclosure} from '@mantine/hooks';
import {
    AppShell as MantineAppShell,
    useMantineColorScheme,
    ActionIcon,
    Burger,
    Group,
    NavLink,
    Text,
    Avatar,
    Stack,
    Button,
    Box,
    Divider,
} from '@mantine/core';
import {
    IconMoon,
    IconSun,
    IconCalendar,
    IconBarbell,
    IconBooks,
    IconClipboardList,
    IconHome,
    IconLogout,
    IconUsers,
    IconX
} from '@tabler/icons-react';

import {Outlet, useLocation, useNavigate} from 'react-router-dom';

import {ROUTES} from '../constants/routes';

function AppShell({auth, onLogout}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Mantine state
    // ------------------------------------------------------------------------------------------------------------------------

    const {colorScheme, toggleColorScheme} = useMantineColorScheme();

    const [mobileOpened, {toggle: toggleMobile, close: closeMobile}] = useDisclosure(false);
    const [desktopOpened, {toggle: toggleDesktop}] = useDisclosure(true);

    // ------------------------------------------------------------------------------------------------------------------------
    // Route state
    // ------------------------------------------------------------------------------------------------------------------------

    const navigate = useNavigate();
    const location = useLocation();

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const showLabels = desktopOpened || mobileOpened;

    // ------------------------------------------------------------------------------------------------------------------------
    // Navigation helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function isActive(path) {
        if (path === ROUTES.HOME) {
            return location.pathname === ROUTES.HOME;
        }

        return location.pathname.startsWith(path);
    }

    function navigateTo(path) {
        navigate(path);
        closeMobile();
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderNavLink(path, Icon, label) {
        return (
            <NavLink
                active={isActive(path)}
                label={showLabels ? label : undefined}
                leftSection={<Icon size={20} stroke={1.8}/>}
                onClick={() => navigateTo(path)}
                styles={{
                    root: {
                        display: 'flex',
                        justifyContent: showLabels ? 'flex-start' : 'center',
                        paddingInline: showLabels ? undefined : 0,
                    },
                    section: {
                        marginRight: showLabels ? undefined : 0,
                    },
                    body: {
                        display: showLabels ? undefined : 'none',
                    },
                }}
            />
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <MantineAppShell
            header={{
                height: 60,
                offset: false,
            }}
            navbar={{
                width: desktopOpened ? 240 : 76,
                breakpoint: 'sm',
                collapsed: {
                    mobile: !mobileOpened,
                },
            }}
            padding="md"
        >
            <MantineAppShell.Header hiddenFrom="sm">
                <Group h="100%" px="md">
                    <Burger
                        hiddenFrom="sm"
                        variant="subtle"
                        opened={mobileOpened}
                        onClick={toggleMobile}
                        size="md"
                        style={{
                            paddingLeft: '0.5rem',
                        }}
                    />
                    <Text fw={700}>CoachFlow</Text>
                </Group>
            </MantineAppShell.Header>

            {mobileOpened && (
                <div
                    className="mobile-sidebar-backdrop"
                    onClick={closeMobile}
                />
            )}

            <MantineAppShell.Navbar p="sm">
                <Stack h="100%" gap="sm">
                    <Group justify={desktopOpened ? 'space-between' : 'center'}>
                        {desktopOpened && <Text fw={700}>CoachFlow</Text>}

                        <Burger
                            visibleFrom="sm"
                            opened={desktopOpened}
                            onClick={toggleDesktop}
                            size="md"
                            style={{
                                paddingLeft: '0.35rem',
                            }}
                        />
                        <Button
                            hiddenFrom="sm"
                            variant="subtle"
                            color="black"
                            onClick={closeMobile}
                            px="4"
                        >
                            <IconX size={30} stroke={1.5}/>
                        </Button>
                    </Group>

                    <Group
                        gap="sm"
                        wrap="nowrap"
                        justify="flex-start"
                        style={{
                            paddingLeft: '0.4rem',
                        }}
                    >
                        <Avatar color="blue" radius="xl">
                            {auth.trainer.firstName.charAt(0).toUpperCase()}
                            {auth.trainer.lastName.charAt(0).toUpperCase()}
                        </Avatar>

                        {showLabels && (
                            <Text size="sm" fw={500} truncate>
                                {auth.trainer.firstName} {auth.trainer.lastName}
                            </Text>
                        )}
                    </Group>

                    <Stack gap={4} style={{flex: 1}}>
                        {renderNavLink(ROUTES.HOME, IconHome, 'Dashboard')}
                        {renderNavLink(ROUTES.CLIENTS, IconUsers, 'Clients')}
                        {renderNavLink(ROUTES.APPOINTMENTS, IconCalendar, 'Appointments')}
                        <Divider
                            my="xs"
                            labelPosition="left"
                            label={
                                <Box style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <IconBooks size={16} />
                                    <span>Libraries</span>
                                </Box>
                            }
                        />
                        {renderNavLink(ROUTES.EXERCISES, IconBarbell, 'Exercises')}
                        {renderNavLink(ROUTES.WORKOUT_TEMPLATES, IconClipboardList, 'Workouts')}
                    </Stack>

                    <Box>
                        <NavLink
                            label={showLabels ? (colorScheme === 'dark' ? 'Light mode' : 'Dark mode') : undefined}
                            leftSection={
                                colorScheme === 'dark'
                                    ? <IconSun size={20} stroke={1.8}/>
                                    : <IconMoon size={20} stroke={1.8}/>
                            }
                            onClick={() => toggleColorScheme()}
                            styles={{
                                root: {
                                    display: 'flex',
                                    justifyContent: showLabels ? 'flex-start' : 'center',
                                    paddingInline: showLabels ? undefined : 0,
                                },
                                section: {
                                    marginRight: showLabels ? undefined : 0,
                                },
                                body: {
                                    display: showLabels ? undefined : 'none',
                                },
                            }}
                        />
                        <NavLink
                            label={showLabels ? 'Logout' : undefined}
                            leftSection={<IconLogout size={20} stroke={1.8}/>}
                            onClick={onLogout}
                            styles={{
                                root: {
                                    display: 'flex',
                                    justifyContent: showLabels ? 'flex-start' : 'center',
                                    paddingInline: showLabels ? undefined : 0,
                                    paddingLeft: showLabels ? '0.75rem' : '0.3rem',
                                },
                                section: {
                                    marginRight: showLabels ? undefined : 0,
                                },
                                body: {
                                    display: showLabels ? undefined : 'none',
                                },
                            }}
                        />
                    </Box>
                </Stack>
            </MantineAppShell.Navbar>

            <MantineAppShell.Main>
                <Outlet/>
            </MantineAppShell.Main>
        </MantineAppShell>
    );
}

export default AppShell;