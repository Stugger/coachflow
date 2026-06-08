import * as PhoneUtils from './phone-utils';
import * as TextUtils from './text-utils';

export function createEmptyClientDetailsForm() {
    return {
        firstName: '',
        lastName: '',
        preferredName: '',
        email: '',
        phone: '',
        birthDate: '',
        gender: '',
    };
}

export function createClientDetailsFormFromClient(client) {
    return {
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        preferredName: client.preferredName || '',
        email: client.email || '',
        phone: client.phone || '',
        birthDate: client.birthDate || '',
        gender: client.gender || '',
    };
}

export function validateClientDetailsForm(form) {
    const errors = {};

    if (!form.firstName.trim()) {
        errors.firstName = 'First name is required';
    }

    if (!form.lastName.trim()) {
        errors.lastName = 'Last name is required';
    }

    if (!form.birthDate) {
        errors.birthDate = 'Birth date is required';
    }

    if (!form.phone.trim()) {
        errors.phone = 'Phone number is required';
    } else {
        const phone = PhoneUtils.splitPhone(form.phone);

        if (PhoneUtils.isPartialPhone(phone.area, phone.prefix, phone.line)) {
            errors.phone = 'Phone number must be complete';
        }
    }

    return errors;
}

export function normalizeClientDetailsForm(form) {
    return {
        ...form,
        firstName: TextUtils.normalizeName(form.firstName),
        lastName: TextUtils.normalizeName(form.lastName),
        preferredName: TextUtils.normalizeName(form.preferredName),
        email: TextUtils.normalizeEmail(form.email),
        phone: form.phone.trim(),
        gender: form.gender || null,
    };
}

export function updateFormField(form, errors, setForm, setErrors, name, value) {
    setForm({
        ...form,
        [name]: value,
    });

    if (errors[name]) {
        const updatedErrors = {...errors};
        delete updatedErrors[name];
        setErrors(updatedErrors);
    }
}