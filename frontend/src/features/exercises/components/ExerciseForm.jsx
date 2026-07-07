import {
    Button,
    Select,
    MultiSelect,
    Text,
    TextInput,
    Textarea,
    Group,
    Stack,
    Paper,
    SimpleGrid,
    Divider,

} from '@mantine/core';
import {
    IconPhoto,
    IconFlag,
    IconDumbbell,
    IconTarget,
    IconFocus,
    IconTableImport,
    IconTag,

} from '@tabler/icons-react';

import ExerciseVideoPreview from './ExerciseVideoPreview.jsx';

import {resolveMediaUrl} from '../../../utils/media-url-utils.js';

import {
    EQUIPMENT_OPTIONS,
    EXERCISE_DIFFICULTY_OPTIONS,
    EXERCISE_TAG_OPTIONS,
    MUSCLE_OPTIONS
} from "../exercise-metadata-options.js";

import {TRACKING_FIELD_OPTIONS} from "../exercise-tracking-fields.js";

function ExerciseForm({form, errors, onChange, onValueChange, onSubmit, isEditing, onCancel}) {

    // ------------------------------------------------------------------------------------------------------------------------
    // Event handlers
    // ------------------------------------------------------------------------------------------------------------------------

    function promptForThumbnailUrl() {
        const url = window.prompt('Enter thumbnail image URL', form.thumbnailUrl || '');

        if (url === null) {
            return;
        }

        onValueChange('thumbnailUrl', url.trim());
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Render helpers
    // ------------------------------------------------------------------------------------------------------------------------

    function renderThumbnail() {
        return (
            <Paper
                className={"interactive-card subtle"}
                withBorder
                radius="md"
                p={2}
                onClick={promptForThumbnailUrl}
                style={{
                    width: '7rem',
                    height: '7rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                }}
            >
                {form.thumbnailUrl ? (
                    <img
                        src={resolveMediaUrl(form.thumbnailUrl)}
                        alt="Exercise thumbnail"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '0.4rem',
                        }}
                    />
                ) : (
                    <Stack gap={4} align="center">
                        <IconPhoto size={28}/>
                        <Text size="xs" c="dimmed" ta="center">
                            Add thumbnail
                        </Text>
                    </Stack>
                )}
            </Paper>
        );
    }

    // ------------------------------------------------------------------------------------------------------------------------
    // Main return
    // ------------------------------------------------------------------------------------------------------------------------

    return (
        <form onSubmit={onSubmit}>
            <Stack pt={1}>
                <Group align="flex-start" wrap="nowrap">
                    {renderThumbnail()}

                    <Stack gap="sm" style={{flex: 1}}>
                        <TextInput
                            name="name"
                            label="Name"
                            placeholder="Barbell Bench Press"
                            value={form.name}
                            onChange={onChange}
                            error={errors.name}
                            required
                        />
                        {form.thumbnailUrl && (
                            <Button
                                type="button"
                                variant="subtle"
                                color="red"
                                size="xs"
                                onClick={() => onValueChange('thumbnailUrl', '')}
                            >
                                Remove thumbnail
                            </Button>
                        )}
                    </Stack>
                </Group>

                <Textarea
                    name="details"
                    label="Instructions"
                    placeholder="Setup, execution, coaching cues, etc."
                    value={form.details}
                    onChange={onChange}
                    autosize
                    minRows={4}
                />

                <TextInput
                    name="demoVideoUrl"
                    label="Demo video URL"
                    placeholder="https://youtube.com/watch?v=..."
                    value={form.demoVideoUrl}
                    onChange={onChange}
                    error={errors.demoVideoUrl}
                />

                {form.demoVideoUrl && (
                    <Stack gap="xs">
                        <Text size="sm" fw={600}>
                            Video preview
                        </Text>

                        <ExerciseVideoPreview
                            url={form.demoVideoUrl}
                            title={`${form.name || 'Exercise'} demo video preview`}
                        />
                    </Stack>
                )}

                <Divider label="Configuration" labelPosition="left"/>

                <Select
                    label="Difficulty"
                    placeholder="Select difficulty"
                    leftSection={<IconFlag size={16}/>}
                    data={EXERCISE_DIFFICULTY_OPTIONS}
                    value={form.difficulty}
                    onChange={value => onValueChange('difficulty', value || '')}
                    comboboxProps={{shadow: 'lg'}}
                    searchable
                    clearable
                    clearSectionMode="clear"
                    nothingFoundMessage="No difficulty found"
                />

                <MultiSelect
                    label="Equipment"
                    placeholder="Select equipment"
                    leftSection={<IconDumbbell size={16}/>}
                    data={EQUIPMENT_OPTIONS}
                    value={form.equipment}
                    onChange={value => onValueChange('equipment', value)}
                    maxValues={10}
                    withScrollArea={false}
                    styles={{dropdown: {overflowY: 'auto'}}}
                    comboboxProps={{shadow: 'lg'}}
                    floatingHeight="viewport"
                    withPillsReorder
                    searchable
                    clearable
                    clearSectionMode="clear"
                    nothingFoundMessage="No equipment found"
                />

                <SimpleGrid cols={{base: 1, sm: 2}}>
                    <MultiSelect
                        label="Primary muscles"
                        placeholder="Select primary muscles"
                        leftSection={<IconTarget size={16}/>}
                        data={MUSCLE_OPTIONS}
                        value={form.primaryMuscles}
                        onChange={value => onValueChange('primaryMuscles', value)}
                        maxValues={10}
                        withScrollArea={false}
                        styles={{dropdown: {overflowY: 'auto'}}}
                        comboboxProps={{shadow: 'lg'}}
                        floatingHeight="viewport"
                        withPillsReorder
                        searchable
                        clearable
                        clearSectionMode="clear"
                        nothingFoundMessage="No muscles found"
                    />

                    <MultiSelect
                        label="Secondary muscles"
                        placeholder="Select secondary muscles"
                        leftSection={<IconFocus size={16}/>}
                        data={MUSCLE_OPTIONS}
                        value={form.secondaryMuscles}
                        onChange={value => onValueChange('secondaryMuscles', value)}
                        maxValues={10}
                        withScrollArea={false}
                        styles={{dropdown: {overflowY: 'auto'}}}
                        comboboxProps={{shadow: 'lg'}}
                        floatingHeight="viewport"
                        withPillsReorder
                        searchable
                        clearable
                        clearSectionMode="clear"
                        nothingFoundMessage="No muscles found"
                    />
                </SimpleGrid>

                <MultiSelect
                    label="Tags"
                    placeholder="Select tags"
                    leftSection={<IconTag size={16}/>}
                    data={EXERCISE_TAG_OPTIONS}
                    value={form.tags}
                    onChange={value => onValueChange('tags', value)}
                    maxValues={10}
                    withScrollArea={false}
                    styles={{dropdown: {overflowY: 'auto'}}}
                    comboboxProps={{shadow: 'lg'}}
                    floatingHeight="viewport"
                    withPillsReorder
                    searchable
                    clearable
                    clearSectionMode="clear"
                    nothingFoundMessage="No tags found"
                />

                <MultiSelect
                    label="Default tracking fields"
                    description="Added automatically when this exercise is added to a workout."
                    placeholder="Select tracking fields"
                    leftSection={<IconTableImport size={16}/>}
                    data={TRACKING_FIELD_OPTIONS}
                    value={form.defaultTrackingFields}
                    onChange={value => onValueChange('defaultTrackingFields', value)}
                    comboboxProps={{shadow: 'lg'}}
                    withPillsReorder
                    searchable
                    clearable
                    clearSectionMode="clear"
                    nothingFoundMessage="No tracking fields found"
                />

                <Group justify="flex-end">
                    <Button type="button" variant="subtle" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        {isEditing ? 'Save Changes' : 'Add Exercise'}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}

export default ExerciseForm;