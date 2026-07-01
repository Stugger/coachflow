import {Paper, Scroller, Tabs} from '@mantine/core';
import {CLIENT_PROFILE_TABS} from './client-profile-tab-utils.js';

function ClientProfileTabs({activeTab, onChange}) {
    return (
        <Paper withBorder radius="md" p="sm" style={{borderRadius: '1rem 1rem 0 0'}}>
            <Tabs
                value={activeTab}
                onChange={onChange}
                variant="default"
                radius="md"
            >
                <Scroller scrollAmount={120}>
                    <Tabs.List pt="xs" style={{flexWrap: 'nowrap'}}>
                        {CLIENT_PROFILE_TABS.map(tab => (
                            <Tabs.Tab key={tab.value} value={tab.value}>
                                {tab.label}
                            </Tabs.Tab>
                        ))}
                    </Tabs.List>
                </Scroller>
            </Tabs>
        </Paper>
    );
}

export default ClientProfileTabs;