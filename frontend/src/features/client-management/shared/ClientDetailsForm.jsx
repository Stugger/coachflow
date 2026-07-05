import {
    Button,
    Select,
    Stack,
    TextInput,
} from '@mantine/core';
import { DateInput, DatePickerInput } from '@mantine/dates';
import {IconCalendar} from '@tabler/icons-react';
import * as PhoneUtils from '../../../utils/phone-utils.js';

function ClientDetailsForm({form, errors, onChange, onPhoneChange, onSubmit, submitLabel = 'Save',}) {

    return (
        <form onSubmit={onSubmit}>
            <Stack>

                <TextInput
                    label="First Name"
                    name="firstName"
                    value={form.firstName}
                    onChange={onChange}
                    error={errors.firstName}
                    required
                />

                <TextInput
                    label="Last Name"
                    name="lastName"
                    value={form.lastName}
                    onChange={onChange}
                    error={errors.lastName}
                    required
                />

                <TextInput
                    label="Preferred Name"
                    name="preferredName"
                    placeholder="Optional"
                    value={form.preferredName}
                    onChange={onChange}
                />

                <TextInput
                    label="Phone"
                    name="phone"
                    inputMode="tel"
                    placeholder="(555) 123-4567"
                    value={form.phone}
                    error={errors.phone}
                    required
                    onChange={(event) => {
                        const phone = PhoneUtils.formatPhoneFromDigits(event.target.value);

                        if (onPhoneChange) {
                            onPhoneChange(phone);
                        }
                    }}
                />

                <TextInput
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="Optional"
                    value={form.email}
                    onChange={onChange}
                    error={errors.email}
                />

                <DateInput
                    visibleFrom="sm"
                    label="Birth Date"
                    valueFormat="MM/DD/YYYY"
                    value={form.birthDate}
                    maxDate={new Date()}
                    error={errors.birthDate}
                    required
                    rightSection={<IconCalendar size={18} stroke={1.8}/>}
                    onChange={(value) =>
                        onChange({
                            target: {
                                name: 'birthDate',
                                value: value || '',
                            },
                        })
                    }
                />

                <DatePickerInput
                    hiddenFrom="sm"
                    label="Birth Date"
                    valueFormat="MM/DD/YYYY"
                    value={form.birthDate || null}
                    error={errors.birthDate}
                    maxDate={new Date()}
                    required
                    dropdownType="modal"
                    rightSection={<IconCalendar size={18} stroke={1.8}/>}
                    onChange={(value) =>
                        onChange({
                            target: {
                                name: 'birthDate',
                                value: value || '',
                            },
                        })
                    }
                />

                <Select
                    label="Gender"
                    name="gender"
                    placeholder="Select gender"
                    value={form.gender}
                    onChange={(value) =>
                        onChange({
                            target: {
                                name: 'gender',
                                value: value || '',
                            },
                        })
                    }
                    data={[
                        { value: 'MALE', label: 'Male' },
                        { value: 'FEMALE', label: 'Female' },
                        { value: 'NON_BINARY', label: 'Non-binary' },
                        { value: 'UNDISCLOSED', label: 'Prefer not to say' },
                        { value: 'OTHER', label: 'Other' },
                    ]}
                />

                <Button type="submit" mt="sm">
                    {submitLabel}
                </Button>

            </Stack>
        </form>
    );
}

export default ClientDetailsForm;