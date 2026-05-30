import {useState} from 'react';

function AuthPage({onAuthSuccess}) {

    const [mode, setMode] = useState('login');

    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    });

    const [registerForm, setRegisterForm] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');

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

        if (errors[name]) {
            const updatedErrors = {...errors};
            delete updatedErrors[name];
            setErrors(updatedErrors);
        }

        if (message) {
            setMessage('');
        }
    }

    function updateRegisterForm(event) {
        const {name, value} = event.target;
        setRegisterForm({
            ...registerForm,
            [name]: value
        });
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

        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register-trainer`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(registerForm)
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

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>CoachFlow</h1>

                {mode === 'login' && (
                    <>
                        {message && Object.keys(errors).length === 0 && (
                            <div className="form-error">
                                {message}
                            </div>
                        )}

                        <form onSubmit={login} className="client-form">
                            <input name="email" className={errors.email ? 'input-error' : ''} placeholder="Email" value={loginForm.email} onChange={updateLoginForm}/>
                            {errors.email && <div className="field-error">* {errors.email}</div>}

                            <input name="password" className={errors.password ? 'input-error' : ''} type="password" placeholder="Password" value={loginForm.password} onChange={updateLoginForm}/>
                            {errors.password && <div className="field-error">* {errors.password}</div>}

                            <button type="submit" className="primary-button">Login</button>
                        </form>

                        <div className="auth-switch">
                            <p>Don't have an account?</p>
                            <button type="button" className="link-button" onClick={() => switchMode('register')}>
                                Register now
                            </button>
                        </div>
                    </>
                )}
                {mode === 'register' && (
                    <>
                        <button type="button" className="link-button back-link" onClick={() => switchMode('login')}>
                            &lt; Back to login
                        </button>

                        {message && Object.keys(errors).length === 0 && (
                            <div className="form-error">
                                {message}
                            </div>
                        )}

                        <h2>Create trainer account</h2>

                        <form onSubmit={register} className="client-form">
                            <label className="form-label">Identity</label>

                            <input name="firstName" className={errors.firstName ? 'input-error' : ''} placeholder="First name" value={registerForm.firstName} onChange={updateRegisterForm}/>
                            {errors.firstName && <div className="field-error">* {errors.firstName}</div>}

                            <input name="lastName" className={errors.lastName ? 'input-error' : ''} placeholder="Last name" value={registerForm.lastName} onChange={updateRegisterForm}/>
                            {errors.lastName && <div className="field-error">* {errors.lastName}</div>}

                            <label className="form-label">Credentials</label>

                            <input name="email" className={errors.email ? 'input-error' : ''} placeholder="Email" value={registerForm.email} onChange={updateRegisterForm}/>
                            {errors.email && <div className="field-error">* {errors.email}</div>}

                            <input name="password" className={errors.password ? 'input-error' : ''} type="password" placeholder="Password" value={registerForm.password} onChange={updateRegisterForm}/>
                            {errors.password && <div className="field-error">* {errors.password}</div>}

                            <button type="submit">Create Account</button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default AuthPage;