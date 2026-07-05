import {useState} from 'react';
import {
    useMantineColorScheme,
    Alert,
    Anchor,
    Box,
    Button,
    Checkbox,
    Container,
    Group,
    Paper,
    PasswordInput,
    Stepper,
    Stack,
    Text,
    TextInput,
    Title,
    Tooltip,
    Divider,
    ActionIcon
} from '@mantine/core';

import {
    IconAlertCircle,
    IconCheck,
    IconMoon,
    IconSun
} from '@tabler/icons-react';

import * as TextUtils from '../utils/text-utils.js';

const REMEMBERED_EMAIL_KEY = 'coachflow.remembered-email';

const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 64;
const MAX_PASSWORD_STORAGE_BYTES = 72;

function AuthPage({onAuthSuccess}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Mantine state
    // ------------------------------------------------------------------------------------------------------------------------

    const {colorScheme, toggleColorScheme} = useMantineColorScheme();

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [mode, setMode] = useState('login');

    const [rememberEmail, setRememberEmail] = useState(
        () => Boolean(localStorage.getItem(REMEMBERED_EMAIL_KEY))
    );

    const [loginForm, setLoginForm] = useState({
        email: localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? '',
        password: ''
    });

    const [registerForm, setRegisterForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');

    // ------------------------------------------------------------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    function switchMode(mode) {
        setErrors({});
        setMessage('');
        setMode(mode);
    }

    function updateLoginForm(event) {
        const {name, value} = event.target;

        setLoginForm({
            ...loginForm,
            [name]: value
        });

        clearValidationState(name);
    }

    function updateRegisterForm(event) {
        const {name, value} = event.target;

        setRegisterForm({
            ...registerForm,
            [name]: value
        });

        clearValidationState(name);
    }

    function clearValidationState(name) {
        if (errors[name]) {
            const updatedErrors = {...errors};
            delete updatedErrors[name];
            setErrors(updatedErrors);
        }

        if (message) {
            setMessage('');
        }
    }

    function handleBadResponse(errorBody) {
        if (errorBody.fieldErrors) {
            setErrors(errorBody.fieldErrors);
        }

        if (errorBody.message) {
            setMessage(errorBody.message);
        }
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Auth
    // ------------------------------------------------------------------------------------------------------------------------

    function login(event) {
        event.preventDefault();

        setErrors({});
        setMessage('');

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(loginForm)
        })
            .then(async response => {
                if (!response.ok) {
                    handleBadResponse(await response.json());
                    throw new Error('Login failed');
                }

                return response.json();
            })
            .then(auth => {
                const normalizedEmail = TextUtils.normalizeEmail(loginForm.email);

                if (rememberEmail) {
                    localStorage.setItem(REMEMBERED_EMAIL_KEY, normalizedEmail);
                } else {
                    localStorage.removeItem(REMEMBERED_EMAIL_KEY);
                }

                onAuthSuccess(auth);
            })
            .catch(error => console.error(error));
    }

    function register(event) {
        event.preventDefault();

        setErrors({});
        setMessage('');

        const passwordStatus = getPasswordStatus(registerForm.password);
        const validationErrors = {};

        if (!passwordStatus.isValid) {
            validationErrors.password = passwordStatus.errorMessage;
        }

        if (registerForm.password !== registerForm.confirmPassword) {
            validationErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const payload = {...registerForm};
        delete payload.confirmPassword;

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register-trainer`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(normalizeForm(payload))
        })
            .then(async response => {
                if (!response.ok) {
                    handleBadResponse(await response.json());
                    throw new Error('Registration failed');
                }

                return response.json();
            })
            .then(auth => {
                onAuthSuccess(auth);
            })
            .catch(error => console.error(error));
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderMessageAlert() {
        if (!message || Object.keys(errors).length > 0) {
            return null;
        }

        return (
            <Alert
                color="red"
                icon={<IconAlertCircle size={18}/>}
                variant="light"
            >
                {message}
            </Alert>
        );
    }

    function renderLoginForm() {
        return (
            <>
                <Stack gap="xs" ta="center">
                    <Title order={1}>CoachFlow</Title>
                    <Text c="dimmed" size="sm">
                        Sign in to manage your clients, sessions, and coaching workflow.
                    </Text>
                </Stack>

                {renderMessageAlert()}

                <form onSubmit={login}>
                    <Stack>
                        <TextInput
                            name="email"
                            type="email"
                            autoComplete="username"
                            label="Email"
                            placeholder="you@example.com"
                            value={loginForm.email}
                            onChange={updateLoginForm}
                            error={errors.email}
                        />

                        <PasswordInput
                            name="password"
                            autoComplete="current-password"
                            label="Password"
                            placeholder="Your password"
                            value={loginForm.password}
                            onChange={updateLoginForm}
                            error={errors.password}
                        />

                        <Checkbox
                            label="Remember my email"
                            checked={rememberEmail}
                            onChange={(event) => setRememberEmail(event.currentTarget.checked)}
                        />

                        <Button type="submit"
                                fullWidth
                        >
                            Login
                        </Button>
                    </Stack>
                </form>

                <Group justify="center" gap={6}>
                    <Text size="sm" c="dimmed">
                        Don't have an account?
                    </Text>

                    <Anchor
                        component="button"
                        type="button"
                        size="sm"
                        onClick={() => switchMode('register')}
                    >
                        Register now
                    </Anchor>
                </Group>
            </>
        );
    }

    function renderRegisterForm() {
        return (
            <>
                <Stack gap="xs" ta="center">
                    <Title order={3}>Create your coach account</Title>
                    <Text c="dimmed" size="sm" style={{
                        paddingLeft: '1.5rem',
                        paddingRight: '1.5rem',
                    }}>
                        Create your CoachFlow account to start managing your clients.
                    </Text>
                    <Divider my="xs" labelPosition="center" visibleFrom="xs"/>
                </Stack>

                {renderMessageAlert()}

                <form onSubmit={register}>
                    <Stack>
                        <Stack hiddenFrom="xs">
                            <TextInput
                                name="firstName"
                                label="First name"
                                placeholder="First name"
                                required
                                value={registerForm.firstName}
                                onChange={updateRegisterForm}
                                error={errors.firstName}
                            />
                            <TextInput
                                name="lastName"
                                label="Last name"
                                placeholder="Last name"
                                required
                                value={registerForm.lastName}
                                onChange={updateRegisterForm}
                                error={errors.lastName}
                            />
                        </Stack>
                        <Group visibleFrom="xs" wrap={"nowrap"}>
                            <TextInput
                                name="firstName"
                                label="First name"
                                placeholder="First name"
                                required
                                value={registerForm.firstName}
                                onChange={updateRegisterForm}
                                error={errors.firstName}
                            />

                            <TextInput
                                name="lastName"
                                label="Last name"
                                placeholder="Last name"
                                required
                                value={registerForm.lastName}
                                onChange={updateRegisterForm}
                                error={errors.lastName}
                            />
                        </Group>

                        <TextInput
                            name="email"
                            type="email"
                            label="Email"
                            placeholder="you@example.com"
                            required
                            value={registerForm.email}
                            onChange={updateRegisterForm}
                            error={errors.email}
                        />

                        <PasswordInput
                            name="password"
                            label="Password"
                            placeholder="Password"
                            required
                            value={registerForm.password}
                            onChange={updateRegisterForm}
                            error={errors.password}
                        />

                        {renderPasswordGuidance()}

                        <PasswordInput
                            name="confirmPassword"
                            label="Confirm password"
                            placeholder="Confirm password"
                            required
                            value={registerForm.confirmPassword}
                            onChange={updateRegisterForm}
                            error={errors.confirmPassword}
                        />

                        <Button type="submit" fullWidth>
                            Create Account
                        </Button>

                        <Group justify="center" gap={6}>
                            <Text size="sm" c="dimmed">
                                Already have an account?
                            </Text>

                            <Anchor
                                component="button"
                                type="button"
                                size="sm"
                                onClick={() => switchMode('login')}
                            >
                                Sign in
                            </Anchor>
                        </Group>
                    </Stack>
                </form>
            </>
        );
    }

    function renderPasswordGuidance() {
        const status = getPasswordStatus(registerForm.password);

        if (!registerForm.password) {
            return null;
        }

        return (
            <Box className="auth-password-guidance">
                <Group justify="space-between" gap="xs" mb="xs">
                    <Text size="xs" fw={600}>
                        Password strength
                    </Text>

                    <Text size="xs" fw={600} c={status.color}>
                        {status.label}
                    </Text>
                </Group>
                <Stepper
                    active={status.step}
                    color={status.color}
                    size="xs"
                    iconSize={20}
                    completedIcon={<IconCheck size={12}/>}
                >
                    <Stepper.Step
                        aria-label="Needs more characters"
                        icon={
                            <Tooltip label="Needs more characters" withArrow arrowSize={8} events={{ hover: true, focus: false, touch: true }}>
                                <span>1</span>
                            </Tooltip>
                        }
                    />
                    <Stepper.Step
                        aria-label="Meets minimum length"
                        icon={
                            <Tooltip label="Meets minimum length" withArrow arrowSize={8} events={{ hover: true, focus: false, touch: true }}>
                                <span>2</span>
                            </Tooltip>
                        }
                    />
                    <Stepper.Step
                        aria-label="Good password length"
                        icon={
                            <Tooltip label="Good password length" withArrow arrowSize={8} events={{ hover: true, focus: false, touch: true }}>
                                <span>3</span>
                            </Tooltip>
                        }
                    />
                    <Stepper.Step
                        aria-label="Great password length"
                        icon={
                            <Tooltip label="Great password length" withArrow arrowSize={8} events={{ hover: true, focus: false, touch: true }}>
                                <span>4</span>
                            </Tooltip>
                        }
                    />
                </Stepper>

                <Text size="xs" c="dimmed" mt="xs">
                    {status.hint}
                </Text>
            </Box>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Container size={460}
           px="xl"
           py="xl"
           style={{
               minHeight: '100dvh',
               display: 'flex',
               alignItems: 'center',
           }}
        >
            <Paper
                radius="md"
                p="lg"
                withBorder
                shadow="sm"
                style={{
                    position: 'relative',
                    width: '100%',
                }}
            >
                <ActionIcon
                    variant="default"
                    size="lg"
                    color="gray"
                    onClick={() => toggleColorScheme()}
                    style={{
                        position: 'absolute',
                        top: '0.8rem',
                        right: '1rem'
                    }}
                >
                    {colorScheme === 'dark'
                        ? <IconSun size={20} stroke={1.8}/>
                        : <IconMoon size={20} stroke={1.8}/>
                    }
                </ActionIcon>
                <Stack style={{paddingTop: '2.25rem'}}>
                    {mode === 'login' && renderLoginForm()}
                    {mode === 'register' && renderRegisterForm()}
                </Stack>
            </Paper>
        </Container>
    );

    // ------------------------------------------------------------------------------------------------------------------------
    // Utility
    // ------------------------------------------------------------------------------------------------------------------------

    function getPasswordStatus(password) {
        const characterCount = Array.from(password).length;
        const storageLimitExceeded =
            characterCount > MAX_PASSWORD_LENGTH
            || new TextEncoder().encode(password).length > MAX_PASSWORD_STORAGE_BYTES;

        if (storageLimitExceeded) {
            return {
                isValid: false,
                errorMessage: 'Password is too long',
                step: 0,
                color: 'red',
                label: 'Too long',
                hint: 'Choose a shorter password.',
            };
        }

        if (characterCount < MIN_PASSWORD_LENGTH) {
            const remainingCharacters = MIN_PASSWORD_LENGTH - characterCount;

            return {
                isValid: false,
                errorMessage: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
                step: 0,
                color: 'red',
                label: 'Too short',
                hint: `${remainingCharacters} more ${remainingCharacters === 1 ? 'character' : 'characters'} needed.`,
            };
        }

        if (characterCount < 18) {
            return {
                isValid: true,
                errorMessage: null,
                step: 1,
                color: colorScheme === 'light' ? 'yellow' : 'orange',
                label: 'Meets minimum',
                hint: 'Use a unique password that you do not reuse elsewhere.',
            };
        }

        if (characterCount < 26) {
            return {
                isValid: true,
                errorMessage: null,
                step: 2,
                color: 'teal',
                label: 'Strong',
                hint: 'A password manager can generate a unique password.',
            };
        }

        return {
            isValid: true,
            errorMessage: null,
            step: 3,
            color: 'green',
            label: 'Very strong',
            hint: 'A longer unique password is harder to guess.',
        };
    }

    function normalizeForm(form) {
        return {
            ...form,
            firstName: TextUtils.normalizeName(form.firstName),
            lastName: TextUtils.normalizeName(form.lastName),
            email: TextUtils.normalizeEmail(form.email),
        };
    }
}

export default AuthPage;