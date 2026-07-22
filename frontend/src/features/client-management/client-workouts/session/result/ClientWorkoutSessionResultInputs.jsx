import useIsSmallScreen from '../../../../../hooks/useIsSmallScreen.js';
import {
    Box,
    Button,
    Group,
    Menu,
    NumberInput,
    Paper,
    Stack,
    Text,
    TextInput,
} from '@mantine/core';
import {
    IconChevronDown,
} from '@tabler/icons-react';

import ClientWorkoutSessionStopwatch from './ClientWorkoutSessionStopwatch.jsx';
import DurationInput from '../../../../../components/input/DurationInput.jsx';

import {
    TRACKING_FIELD_KEY,
    TRACKING_FIELD_TYPE,
} from '../../../../exercises/exercise-tracking-fields.js';

import {getSetResultInputDetails} from './client-workout-set-result-utils.js';

function ClientWorkoutSessionResultInputs({exerciseId, benchmarks, config, set, values, stackItem, separateSides, recordMode = false, colorScheme, onChange, onSplitSides, onMergeSides}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const isSmallScreen = useIsSmallScreen();

    const fields = config.trackingFields.filter(field =>
        field.key !== TRACKING_FIELD_KEY.NOTES
        && field.key !== TRACKING_FIELD_KEY.REST
    );

    // ------------------------------------------------------------------------------------------------------------------------
    // Conditional return
    // ------------------------------------------------------------------------------------------------------------------------

    if (config.eachSide && separateSides) {
        return (
            <Stack gap="lg">
                <ResultInputGroup
                    label="Left"
                    action={
                        <Menu position="bottom-end" withinPortal>
                            <Menu.Target>
                                <Button
                                    type="button"
                                    variant="subtle"
                                    size="compact-sm"
                                    rightSection={<IconChevronDown size={14}/>}
                                >
                                    Use same results
                                </Button>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Label>Keep values from</Menu.Label>

                                <Menu.Item onClick={() => onMergeSides('left')}>
                                    Left side
                                </Menu.Item>

                                <Menu.Item onClick={() => onMergeSides('right')}>
                                    Right side
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    }
                    side="left"
                    fields={fields}
                    set={set}
                    values={values.left}
                    exerciseId={exerciseId}
                    benchmarks={benchmarks}
                    stackItem={stackItem}
                    recordMode={recordMode}
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
                    exerciseId={exerciseId}
                    benchmarks={benchmarks}
                    stackItem={stackItem}
                    recordMode={recordMode}
                    isSmallScreen={isSmallScreen}
                    colorScheme={colorScheme}
                    onChange={onChange}
                />
            </Stack>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <ResultInputGroup
            label={config.eachSide ? 'Both sides' : undefined}
            action={config.eachSide ? (
                <Button
                    type="button"
                    variant="subtle"
                    size="compact-sm"
                    onClick={onSplitSides}
                >
                    Track separately
                </Button>
            ) : undefined}
            side="default"
            fields={fields}
            set={set}
            values={values.default}
            exerciseId={exerciseId}
            benchmarks={benchmarks}
            stackItem={stackItem}
            recordMode={recordMode}
            isSmallScreen={isSmallScreen}
            colorScheme={colorScheme}
            onChange={onChange}
        />
    );
}

// ------------------------------------------------------------------------------------------------------------------------
// Components
// ------------------------------------------------------------------------------------------------------------------------

function ResultInputGroup({label, action, side, fields, set, values = {}, exerciseId, benchmarks, stackItem, recordMode, isSmallScreen, colorScheme, onChange}) {

    const hasDurationInFields = fields.find(field => field.key === TRACKING_FIELD_KEY.TIME);

    return (
        <Stack gap="xs">
            {(label || action) && (
                <Group justify="space-between" align="center" wrap="nowrap">
                    {label ? <Text fw={700}>{label}</Text> : <span/>}
                    {action}
                </Group>
            )}

            {fields.length ? (
                <Paper
                    withBorder
                    radius="md"
                    w="100%"
                    style={{
                        overflow: 'hidden',
                        backgroundColor: 'var(--color-workout-exercise-bg)',
                        borderColor: 'var(--color-border)',
                    }}
                >
                    {fields.map((field, index) => (
                        <SessionResultInput
                            key={field.key}
                            field={field}
                            target={set.targets?.[field.key]}
                            value={values[field.key] ?? ''}
                            exerciseId={exerciseId}
                            benchmarks={benchmarks}
                            index={index}
                            stackItem={stackItem}
                            recordMode={recordMode}
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

function SessionResultInput({field, target, value, exerciseId, benchmarks, index, stackItem, recordMode, withTopBorder, isSmallScreen, hasDurationInFields, colorScheme, onChange}) {
    const {
        width,
        label,
        modeLabel,
        type,
        unit,
        targetLabel,
        targetDetailLabel,
        targetDetailColor,
        placeholder,
    } = getSetResultInputDetails(
        field,
        target,
        {
            exerciseId,
            benchmarks,
        },
    );

    return (
        <MetricRow
            label={label}
            modeLabel={modeLabel}
            targetLabel={targetLabel}
            targetDetailLabel={targetDetailLabel}
            targetDetailColor={targetDetailColor}
            stackItem={stackItem}
            alternate={index % 2 === 0}
            withTopBorder={withTopBorder}
            isSmallScreen={isSmallScreen}
            hasDurationInFields={hasDurationInFields}
            colorScheme={colorScheme}
        >
            {field.key === TRACKING_FIELD_KEY.TIME && !recordMode ? (
                <ClientWorkoutSessionStopwatch
                    value={value}
                    width={width}
                    height="3rem"
                    buttonWidth={!isSmallScreen ? '3rem' : stackItem ? '2rem' : '2.7rem'}
                    onChange={onChange}
                />
            ) : field.key === TRACKING_FIELD_KEY.TIME ? (
                <DurationInput
                    value={value}
                    width={width}
                    height="3rem"
                    marginInline={0}
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

function MetricRow({label, modeLabel, targetLabel, targetDetailLabel, targetDetailColor, stackItem, alternate, withTopBorder = false, isSmallScreen, hasDurationInFields, colorScheme, children}) {
    return (
        <Box
            px="sm"
            py="sm"
            bg={alternate ? colorScheme === 'light' ? 'rgba(0, 0, 0, 0.01)' : 'rgba(255, 255, 255, 0.01)' : undefined}
            style={{borderTop: withTopBorder ? '1px solid var(--mantine-color-disabled)' : undefined}}
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
                    style={{minWidth: 0, maxWidth: '7rem'}}
                >
                    <Text size="xs" c="dimmed">
                        Target
                    </Text>

                    <Text
                        size="sm"
                        fw={600}
                        ta="right"
                        style={{overflowWrap: 'break-word'}}
                    >
                        {targetLabel}
                    </Text>

                    {targetDetailLabel && (
                        <Text
                            size="xs"
                            c={targetDetailColor ?? 'dimmed'}
                            fw={500}
                            ta="right"
                            lh={1.2}
                            style={{
                                overflowWrap: 'break-word',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {targetDetailLabel}
                        </Text>
                    )}
                </Stack>
            </Box>
        </Box>
    );
}

export default ClientWorkoutSessionResultInputs;