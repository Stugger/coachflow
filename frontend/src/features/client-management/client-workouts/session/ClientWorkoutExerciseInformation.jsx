import {
    Accordion,
    Avatar,
    Badge,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
} from '@mantine/core';
import {
    IconDumbbell,
    IconPhoto,
    IconTarget,
} from '@tabler/icons-react';

import ExerciseVideoPreview from '../../../exercises/components/ExerciseVideoPreview.jsx';
import * as ExerciseMetadataUtils from '../../../exercises/exercise-metadata-utils.js';
import {
    EQUIPMENT_OPTIONS,
    MUSCLE_OPTIONS,
} from '../../../exercises/exercise-metadata-options.js';
import {resolveMediaUrl} from '../../../../utils/media-url-utils.js';

function ClientWorkoutExerciseInformation({exercise}) {

    if (!exercise) {
        return null;
    }

    const metadata = ExerciseMetadataUtils.parseExerciseMetadataJson(exercise.metadataJson);

    return (
        <Accordion
            variant="contained"
            radius="md"
            mt='calc(var(--mantine-spacing-xs) * -1.3)'
            styles={{
                item: {
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                },
            }}
        >
            <Accordion.Item value="exercise-information">
                <Accordion.Control icon={exercise.thumbnailUrl && (
                    <Avatar
                        src={resolveMediaUrl(exercise.thumbnailUrl)}
                        alt={exercise.name}
                        size={40}
                        radius="sm"
                        mt="xs"
                        mb="xs"
                    >
                        <IconPhoto size={20}/>
                    </Avatar>)}
                >
                    <Text fw={600} mt="xs" mb="xs">Exercise information</Text>
                </Accordion.Control>

                <Accordion.Panel>
                    <Stack gap="md">
                        <Text size="sm" c={exercise.details ? undefined : 'dimmed'} style={{whiteSpace: 'pre-wrap'}}>
                            {exercise.details || 'No exercise instructions provided.'}
                        </Text>

                        {exercise.demoVideoUrl && (
                            <ExerciseVideoPreview
                                url={exercise.demoVideoUrl}
                                title={`${exercise.name} demo video`}
                            />
                        )}

                        <SimpleGrid cols={{base: 1, sm: 2}}>
                            <MetadataBadges
                                icon={<IconTarget size={16}/>}
                                label="Primary muscles"
                                values={metadata.primaryMuscles}
                                options={MUSCLE_OPTIONS}
                            />

                            <MetadataBadges
                                icon={<IconDumbbell size={16}/>}
                                label="Equipment"
                                values={metadata.equipment}
                                options={EQUIPMENT_OPTIONS}
                            />
                        </SimpleGrid>
                    </Stack>
                </Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    );
}

function MetadataBadges({icon, label, values, options}) {
    return (
        <Paper withBorder radius="md" p="md">
            <Stack gap="xs">
                <Group gap={6}>
                    {icon}
                    <Text size="sm" fw={700}>{label}</Text>
                </Group>

                {values.length
                    ? (
                        <Group gap={6}>
                            {values.map(value => (
                                <Badge key={value} variant="light">
                                    {options.find(option => option.value === value)?.label ?? value}
                                </Badge>
                            ))}
                        </Group>
                    )
                    : <Text size="sm" c="dimmed">—</Text>}
            </Stack>
        </Paper>
    );
}

export default ClientWorkoutExerciseInformation;