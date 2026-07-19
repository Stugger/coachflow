import {
    Accordion,
    Avatar,
    Group,
    Text,
} from '@mantine/core';
import {IconPhoto} from '@tabler/icons-react';

import {resolveMediaUrl} from '../../../../utils/media-url-utils.js';

import {
    ClientWorkoutExerciseInformationContent,
} from './ClientWorkoutExerciseInformation.jsx';

function ClientWorkoutStackExerciseInformation({itemExercises}) {

    const exercises = itemExercises.filter(itemExercise => itemExercise.exercise);

    if (!exercises.length) {
        return null;
    }

    return (
        <Accordion
            variant="contained"
            radius="md"
            mt="calc(var(--mantine-spacing-xs) * -1.3)"
            styles={{
                item: {
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                },
            }}
        >
            <Accordion.Item value="stack-exercise-information">
                <Accordion.Control>
                    <Group gap="sm" wrap="nowrap">
                        <ExerciseThumbnailGroup itemExercises={exercises}/>

                        <Text fw={600}>
                            Exercise information
                        </Text>
                    </Group>
                </Accordion.Control>

                <Accordion.Panel>
                    <Accordion variant="default" radius="md" >
                        {exercises.map((itemExercise, index) => (
                            <Accordion.Item
                                key={itemExercise.id}
                                value={String(itemExercise.id)}
                            >
                                <Accordion.Control
                                    mt={index == 0 ? 0 : "xs"}
                                    mb="xs"
                                    icon={
                                        <Avatar
                                            src={resolveMediaUrl(itemExercise.exercise.thumbnailUrl)}
                                            alt={itemExercise.displayName}
                                            size={40}
                                            radius="sm"
                                        >
                                            <IconPhoto size={20}/>
                                        </Avatar>
                                    }
                                >
                                    <Text fw={600}>
                                        {itemExercise.displayName}
                                    </Text>
                                </Accordion.Control>

                                <Accordion.Panel>
                                    <ClientWorkoutExerciseInformationContent
                                        exercise={itemExercise.exercise}
                                    />
                                </Accordion.Panel>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    );
}

function ExerciseThumbnailGroup({itemExercises}) {

    const visibleExercises = itemExercises.slice(0, 3);
    const remainingCount = itemExercises.length - visibleExercises.length;

    return (
        <Group
            gap={0}
            wrap="nowrap"
            aria-hidden
            style={{flexShrink: 0}}
        >
            {visibleExercises.map((itemExercise, index) => (
                <Avatar
                    key={itemExercise.id}
                    src={resolveMediaUrl(itemExercise.exercise.thumbnailUrl)}
                    alt=""
                    size={34}
                    radius="sm"
                    ml={index ? '-0.6rem' : 0}
                    style={{
                        zIndex: visibleExercises.length - index,
                        border: '2px solid var(--mantine-color-body)',
                    }}
                >
                    <IconPhoto size={17}/>
                </Avatar>
            ))}

            {remainingCount > 0 && (
                <Avatar
                    size={34}
                    radius="sm"
                    ml="-0.6rem"
                    style={{
                        zIndex: 0,
                        border: '2px solid var(--mantine-color-body)',
                    }}
                >
                    <Text size="xs" fw={700} pl={4}>
                        +{remainingCount}
                    </Text>
                </Avatar>
            )}
        </Group>
    );
}

export default ClientWorkoutStackExerciseInformation;