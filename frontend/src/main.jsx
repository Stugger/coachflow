import '@mantine/core/styles.css';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import App from './App.jsx';
import './index.css'

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <MantineProvider defaultColorScheme="dark"
             theme={{
                 components: {
                     TextInput: {
                         defaultProps: {
                             size: 'md',
                         },
                     },
                     PasswordInput: {
                         defaultProps: {
                             size: 'md',
                         },
                     },
                 },
             }}>
            <App />
        </MantineProvider>
    </BrowserRouter>
);