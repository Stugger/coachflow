import useIsSmallScreen from '../../../../hooks/useIsSmallScreen.js';
import {
    Box,
    NumberInput,
    Paper,
    Stack,
    Text,
    TextInput,
    useComputedColorScheme,
} from '@mantine/core';

import ClientWorkoutSessionStopwatch from './ClientWorkoutSessionStopwatch.jsx';
import DurationInput from '../../../../components/input/DurationInput.jsx';

import {
    TRACKING_FIELD_KEY,
    TRACKING_FIELD_TYPE,
} from '../../../exercises/exercise-tracking-fields.js';

import {getSetResultInputDetails} from './client-workout-set-result-utils.js';

function ClientWorkoutSessionResultInputs({config, set, values, stackItem, onChange}) {

    const isSmallScreen = useIsSmallScreen();
    const colorScheme = useComputedColorScheme('light')

    const fields = config.trackingFields.filter(field =>
        field.key !== TRACKING_FIELD_KEY.NOTES
        && field.key !== TRACKING_FIELD_KEY.REST
    );

    if (config.eachSide) {
        return (
            <Stack gap="lg">
                <ResultInputGroup
                    label="Left"
                    side="left"
                    fields={fields}
                    set={set}
                    values={values.left}
                    stackItem={stackItem}
                    isSmallScreen={isSmallScreen}
                    colorScheme={colorScheme}
                    onChange={onChange}
                />

                <ResultInputGroup
                    label="Right"
                    side="right"
                    fields={fields}
                    set={set}
                    values={values.right}
                    stackItem={stackItem}
                    isSmallScreen={isSmallScreen}
                    colorScheme={colorScheme}
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
            stackItem={stackItem}
            isSmallScreen={isSmallScreen}
            colorScheme={colorScheme}
            onChange={onChange}
        />
    );
}

function ResultInputGroup({label, side, fields, set, values = {}, stackItem, isSmallScreen, colorScheme, onChange}) {

    const hasDurationInFields = fields.find(field => field.key === TRACKING_FIELD_KEY.TIME);

    return (
        <Stack gap="xs">
            {label && (
                <Text fw={700}>
                    {label}
                </Text>
            )}

            {fields.length ? (
                <Paper
                    withBorder
                    radius="md"
                    maw="36rem"
                    mx="auto"
                    w="100%"
                    style={{
                        overflow: 'hidden',
                        backgroundColor: 'var(--color-workout-exercise-bg)',
                    }}
                >
                    {fields.map((field, index) => (
                        <SessionResultInput
                            key={field.key}
                            field={field}
                            target={set.targets?.[field.key]}
                            value={values[field.key] ?? ''}
                            index={index}
                            stackItem={stackItem}
                            withTopBorder={index > 0}
                            isSmallScreen={isSmallScreen}
                            hasDurationInFields={hasDurationInFields}
                            colorScheme={colorScheme}
                            onChange={(nextValue, options) =>
                                onChange(side, field.key, nextValue, options)
                            }
                        />
                    ))}
                </Paper>
            ) : (
                <Text size="sm" c="dimmed">
                    No result fields configured.
                </Text>
            )}
        </Stack>
    );
}

function SessionResultInput({field, target, value, index, stackItem, withTopBorder, isSmallScreen, hasDurationInFields, colorScheme, onChange}) {
    const {
        width,
        label,
        modeLabel,
        type,
        unit,
        targetLabel,
        placeholder,
    } = getSetResultInputDetails(field, target);

    return (
        <MetricRow
            label={label}
            modeLabel={modeLabel}
            targetLabel={targetLabel}
            stackItem={stackItem}
            alternate={index % 2 === 0}
            withTopBorder={withTopBorder}
            isSmallScreen={isSmallScreen}
            hasDurationInFields={hasDurationInFields}
            colorScheme={colorScheme}
        >
            {field.key === TRACKING_FIELD_KEY.TIME ? (
                <ClientWorkoutSessionStopwatch
                    value={value}
                    width={width}
                    height={"3rem"}
                    buttonWidth={!isSmallScreen ? "3rem" : stackItem ? "2rem" : "2.7rem"}
                    onChange={onChange}
                />
            ) : field.key === TRACKING_FIELD_KEY.REST ? (
                <DurationInput
                    value={value}
                    width={width}
                    height={"3rem"}
                    marginInline={0}
                    onChange={onChange}
                />
            ) : type === TRACKING_FIELD_TYPE.TEXT ? (
                <TextInput
                    value={value}
                    placeholder={placeholder}
                    aria-label={label}
                    w="100%"
                    styles={{
                        root: {
                            minWidth: 0,
                        },
                        input: {
                            width: '100%',
                            height: "3rem",
                            minWidth: 0,
                            paddingInline: '0.5rem',
                            fontWeight: 600,
                            textAlign: 'center',
                        },
                    }}
                    onChange={event => onChange(event.currentTarget.value)}
                />
            ) : (

                <NumberInput
                    value={value}
                    placeholder={placeholder}
                    suffix={unit ? ` ${unit}` : undefined}
                    decimalScale={2}
                    allowDecimal
                    hideControls
                    min={0}
                    max={field.key === TRACKING_FIELD_KEY.RPE ? 10 : undefined}
                    aria-label={label}
                    w={width}
                    styles={{
                        root: {
                            minWidth: 0,
                        },
                        input: {
                            height: "3rem",
                            paddingInline: '0.5rem',
                            fontWeight: 600,
                            textAlign: 'center',
                        },
                    }}
                    onChange={onChange}
                />

            )}
        </MetricRow>
    );
}

function MetricRow({label, modeLabel, targetLabel, stackItem, alternate, withTopBorder = false, isSmallScreen, hasDurationInFields, colorScheme, children}) {
    return (
        <Box
            px="sm"
            py="sm"
            bg={
                alternate ? colorScheme === 'light' ? 'rgba(0, 0, 0, 0.01)' : 'rgba(255, 255, 255, 0.01)' : undefined
            }
            style={{
                borderTop: withTopBorder ? '1px solid var(--mantine-color-disabled)' : undefined,
            }}
        >
            <Box
                style={{
                    display: 'grid',
                    gridTemplateColumns: `${!isSmallScreen ? '5.5rem' : stackItem && hasDurationInFields ? '4rem' : '4.8rem'} minmax(6rem, 1fr) fit-content(7rem)`,
                    alignItems: 'center',
                    columnGap: '0.5rem',
                }}
            >
                <Stack gap={0} justify="center" style={{minWidth: 0}}>
                    <Text size="sm" fw={700} truncate>
                        {label}
                    </Text>

                    {modeLabel && (
                        <Text size="xs" c="dimmed" truncate>
                            {modeLabel}
                        </Text>
                    )}
                </Stack>

                <Box style={{width: '100%', minWidth: 0}}>
                    {children}
                </Box>

                <Stack
                    gap={0}
                    align="flex-end"
                    style={{
                        minWidth: 0,
                        maxWidth: '7rem',
                    }}
                >
                    <Text size="xs" c="dimmed">
                        Target
                    </Text>

                    <Text
                        size="sm"
                        fw={600}
                        ta="right"
                        style={{
                            overflowWrap: 'break-word',
                        }}
                    >
                        {targetLabel}
                    </Text>
                </Stack>
            </Box>
        </Box>
    );
}

export default ClientWorkoutSessionResultInputs;