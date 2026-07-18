import {
    NumberInput,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
} from '@mantine/core';

import DurationInput from '../../../../components/input/DurationInput.jsx';
import {
    TRACKING_FIELD_KEY,
    TRACKING_FIELD_TYPE,
} from '../../../exercises/exercise-tracking-fields.js';

import {getSetResultInputDetails} from './client-workout-set-result-utils.js';

function ClientWorkoutSessionResultInputs({config, set, values, onChange}) {
    const fields = config.trackingFields.filter(field => field.key !== TRACKING_FIELD_KEY.NOTES);

    if (config.eachSide) {
        return (
            <Stack gap="lg">
                <ResultInputGroup
                    label="Left"
                    side="left"
                    fields={fields}
                    set={set}
                    values={values.left}
                    onChange={onChange}
                />

                <ResultInputGroup
                    label="Right"
                    side="right"
                    fields={fields}
                    set={set}
                    values={values.right}
                    onChange={onChange}
                />
            </Stack>
        );
    }

    return (
        <ResultInputGroup
            side="default"
            fields={fields}
            set={set}
            values={values.default}
            onChange={onChange}
        />
    );
}

function ResultInputGroup({label, side, fields, set, values = {}, onChange}) {
    return (
        <Stack gap="xs">
            {label && <Text fw={700}>{label}</Text>}

            {fields.length ? (
                <SimpleGrid cols={{base: 2, sm: 2}} spacing="sm">
                    {fields.map(field => (
                        <SessionResultInput
                            key={field.key}
                            field={field}
                            target={set.targets?.[field.key]}
                            value={values[field.key] ?? ''}
                            onChange={nextValue => onChange(side, field.key, nextValue)}
                        />
                    ))}
                </SimpleGrid>
            ) : (
                <Text size="sm" c="dimmed">
                    No result fields configured.
                </Text>
            )}
        </Stack>
    );
}

function SessionResultInput({field, target, value, onChange}) {
    const {label, type, unit, targetLabel, placeholder} = getSetResultInputDetails(field, target);
    const description = `Target: ${targetLabel}`;

    if (field.key === TRACKING_FIELD_KEY.TIME || field.key === TRACKING_FIELD_KEY.REST) {
        return (
            <DurationInput
                label={label}
                description={description}
                value={value}
                onChange={onChange}
            />
        );
    }

    if (type === TRACKING_FIELD_TYPE.TEXT) {
        return (
            <TextInput
                label={label}
                description={description}
                value={value}
                placeholder={placeholder}
                onChange={event => onChange(event.currentTarget.value)}
            />
        );
    }

    const integer = field.key === TRACKING_FIELD_KEY.REPS;

    return (
        <NumberInput
            label={label}
            description={description}
            value={value}
            placeholder={placeholder}
            suffix={unit ? ` ${unit}` : undefined}
            decimalScale={integer ? 0 : 2}
            allowDecimal={!integer}
            hideControls
            min={0}
            max={field.key === TRACKING_FIELD_KEY.RPE ? 10 : undefined}
            onChange={onChange}
        />
    );
}

export default ClientWorkoutSessionResultInputs;