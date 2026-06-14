import {
    Badge,
    Button,
    Collapse,
    Group,
    MultiSelect,
    Paper,
    SimpleGrid,
    Stack,
} from '@mantine/core';
import {
    IconChevronDown,
    IconChevronRight,
} from '@tabler/icons-react';

import {
    EQUIPMENT_OPTIONS,
    EXERCISE_DIFFICULTY_OPTIONS,
    EXERCISE_TAG_OPTIONS,
    MUSCLE_OPTIONS,
} from '../../constants/exercises.js';

function ExerciseFilters({filters, filtersOpen, hasActiveFilters, onToggleFilters, onFilterChange, onClearFilters}) {

    return (
        <Paper withBorder p="md" radius="md">
            <Stack gap="md">
                <Group justify="space-between" align="center">
                    <Group gap="xs">
                        <Button
                            variant="subtle"
                            size="compact-sm"
                            leftSection={filtersOpen ? <IconChevronDown size={16}/> : <IconChevronRight size={16}/>}
                            onClick={onToggleFilters}
                        >
                            Filters
                        </Button>

                        {hasActiveFilters && (
                            <Badge size="sm" color="blue" variant="light">
                                Active
                            </Badge>
                        )}
                    </Group>

                    {hasActiveFilters && (
                        <Button size="compact-xs" variant="subtle" onClick={onClearFilters}>
                            Clear filters
                        </Button>
                    )}
                </Group>

                <Collapse expanded={filtersOpen}>
                    <SimpleGrid cols={{base: 1, sm: 2, lg: 4}}>
                        <MultiSelect
                            className="lossy-placeholder"
                            label="Equipment"
                            placeholder="Any equipment"
                            data={EQUIPMENT_OPTIONS}
                            value={filters.equipment}
                            onChange={value => onFilterChange('equipment', value)}
                            searchable
                            clearable
                            nothingFoundMessage="No equipment found"
                        />

                        <MultiSelect
                            className="lossy-placeholder"
                            label="Primary muscles"
                            placeholder="Any muscle"
                            data={MUSCLE_OPTIONS}
                            value={filters.primaryMuscles}
                            onChange={value => onFilterChange('primaryMuscles', value)}
                            searchable
                            clearable
                            nothingFoundMessage="No muscles found"
                        />

                        <MultiSelect
                            className="lossy-placeholder"
                            label="Difficulty"
                            placeholder="Any difficulty"
                            data={EXERCISE_DIFFICULTY_OPTIONS}
                            value={filters.difficulty}
                            onChange={value => onFilterChange('difficulty', value || '')}
                            searchable
                            clearable
                            nothingFoundMessage="No difficulty found"
                        />

                        <MultiSelect
                            className="lossy-placeholder"
                            label="Tags"
                            placeholder="Any tags"
                            data={EXERCISE_TAG_OPTIONS}
                            value={filters.tags}
                            onChange={value => onFilterChange('tags', value)}
                            searchable
                            clearable
                            nothingFoundMessage="No tags found"
                        />
                    </SimpleGrid>
                </Collapse>
            </Stack>
        </Paper>
    );
}

export default ExerciseFilters;