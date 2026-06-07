import {useState} from 'react';
import {
    Alert,
    Anchor,
    Button,
    Container,
    Group,
    Paper,
    PasswordInput,
    Stack,
    Text,
    TextInput,
    Title,
    ActionIcon
} from '@mantine/core';
import {IconMoon, IconSun, IconAlertCircle} from '@tabler/icons-react';
import {useMantineColorScheme} from '@mantine/core';

import * as TextUtils from '../utils/text-utils.js';

function AuthPage({onAuthSuccess}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Mantine state
    // ------------------------------------------------------------------------------------------------------------------------

    const {colorScheme, toggleColorScheme} = useMantineColorScheme();

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [mode, setMode] = useState('login');

    const [loginForm, setLoginForm] = useState({
        email: '',
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
                onAuthSuccess(auth);
            })
            .catch(error => console.error(error));
    }

    function register(event) {
        event.preventDefault();

        setErrors({});
        setMessage('');

        if (registerForm.password !== registerForm.confirmPassword) {
            setErrors({
                confirmPassword: 'Passwords do not match'
            });
            return;
        }

        const {confirmPassword, ...payload} = registerForm;

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
                            label="Email"
                            placeholder="you@example.com"
                            value={loginForm.email}
                            onChange={updateLoginForm}
                            error={errors.email}
                        />

                        <PasswordInput
                            name="password"
                            label="Password"
                            placeholder="Your password"
                            value={loginForm.password}
                            onChange={updateLoginForm}
                            error={errors.password}
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
                    <Text c="dimmed" size="sm">
                        Create your CoachFlow account to start managing clients.
                    </Text>
                </Stack>

                {renderMessageAlert()}

                <form onSubmit={register}>
                    <Stack>
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

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Container size={420}
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
                    variant="subtle"
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