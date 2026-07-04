import {Button, Menu} from '@mantine/core';
import {
    IconChevronDown,
    IconCopy,
    IconHammer,
    IconPlus,
} from '@tabler/icons-react';

function InitialAssessmentSetupMenu({variant = 'filled', onNewWorkout, onFromTemplate}) {

    return (
        <Menu shadow="md" width={220} position="bottom-end" withinPortal>
            <Menu.Target>
                <Button
                    variant={variant}
                    leftSection={<IconHammer size={15}/>}
                    rightSection={<IconChevronDown size={14}/>}
                >
                    Set Up Assessment
                </Button>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Item
                    leftSection={<IconPlus size={15}/>}
                    onClick={onNewWorkout}
                >
                    New Workout
                </Menu.Item>

                <Menu.Item
                    leftSection={<IconCopy size={15}/>}
                    onClick={onFromTemplate}
                >
                    From Template
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}

export default InitialAssessmentSetupMenu;