import {useState} from 'react';
import {
    Group,
    Menu,
    Text,
    UnstyledButton,
} from '@mantine/core';
import {
    IconChevronDown,
} from '@tabler/icons-react';

import {WORKOUT_SET_TYPE_OPTIONS} from '../workout-builder-constants';

function ExerciseSetTypeInput({set, locked, onChange}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // State
    // ------------------------------------------------------------------------------------------------------------------------

    const [hovered, setHovered] = useState(false);
    const [opened, setOpened] = useState(false);

    // ------------------------------------------------------------------------------------------------------------------------
    // Derived state
    // ------------------------------------------------------------------------------------------------------------------------

    const option = WORKOUT_SET_TYPE_OPTIONS.find(
        option => option.value === set.setType
    ) ?? WORKOUT_SET_TYPE_OPTIONS[0];

    const showSetNumber = hovered || opened;

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <Menu
            withinPortal
            position="bottom-start"
            opened={opened}
            onChange={setOpened}
        >
            <Menu.Target>
                <UnstyledButton
                    className="subtle-input-container"
                    data-locked={locked || undefined}
                    disabled={locked}
                    onMouseEnter={() => {
                        if (!locked) {
                            setHovered(true);
                        }
                    }}
                    onMouseLeave={() => setHovered(false)}
                    style={{
                        width: '100%',
                        minHeight: '2.25rem',
                        paddingInline: '0.35rem',
                        cursor: locked ? 'default' : undefined,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Group gap={2} wrap="nowrap" align="center">
                        <Text
                            component="span"
                            fw={600}
                            style={{
                                fontSize: 'var(--mantine-font-size-sm)',
                                lineHeight: 'var(--mantine-line-height-sm)',
                                display: 'block',
                                transform: 'translateY(1px)',
                                ...(locked ? {
                                    opacity: '0.5',
                                }: {})
                            }}
                            c={option.value === 'STANDARD' && !showSetNumber
                                ? undefined
                                : option.color ?? undefined}
                        >
                            {showSetNumber || option.value === 'STANDARD'
                                ? set.position
                                : option.shortLabel ?? set.position}
                        </Text>

                        {!locked && showSetNumber && (
                            <IconChevronDown
                                size={13}
                                style={{transform: 'translateY(1px)'}}
                            />
                        )}
                    </Group>
                </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown>
                {WORKOUT_SET_TYPE_OPTIONS.map(nextOption => (
                    <Menu.Item
                        key={nextOption.value}
                        leftSection={<Text size="sm" c={nextOption.color} fw={600}>{nextOption.shortLabel}</Text>}
                        onClick={() => onChange(nextOption.value)}
                    >
                        {nextOption.label}
                    </Menu.Item>
                ))}
            </Menu.Dropdown>
        </Menu>
    );
}

export default ExerciseSetTypeInput;