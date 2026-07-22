import {
    Text,
    Textarea,
} from '@mantine/core';

import ClientWorkoutSessionResultInputs
    from './ClientWorkoutSessionResultInputs.jsx';

import {
    getSetInstruction,
} from './client-workout-set-result-utils.js';

function ClientWorkoutSetResultFields({exerciseId, benchmarks, config, set, values, notes, stackItem, separateSides, recordMode = false, colorScheme,
                                          onChange, onSplitSides, onMergeSides, onNotesChange}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const instruction = getSetInstruction(config, set);

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <>
            {instruction && (
                <Text
                    size="sm"
                    c="dimmed"
                    fs="italic"
                    style={{whiteSpace: 'pre-wrap'}}
                >
                    {instruction}
                </Text>
            )}

            <ClientWorkoutSessionResultInputs
                exerciseId={exerciseId}
                benchmarks={benchmarks}
                config={config}
                set={set}
                values={values}
                stackItem={stackItem}
                separateSides={separateSides}
                recordMode={recordMode}
                colorScheme={colorScheme}
                onChange={onChange}
                onSplitSides={onSplitSides}
                onMergeSides={onMergeSides}
            />

            <Textarea
                classNames={{input: 'subtle-input'}}
                variant="unstyled"
                placeholder="Optional note..."
                value={notes}
                autosize
                label={
                    <Text size="sm" fw={600} pl="0.5rem">
                        Trainer note
                    </Text>
                }
                onChange={event =>
                    onNotesChange(event.currentTarget.value)
                }
            />
        </>
    );
}

export default ClientWorkoutSetResultFields;