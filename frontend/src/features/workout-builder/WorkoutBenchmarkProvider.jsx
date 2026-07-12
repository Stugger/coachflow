import {useMemo} from 'react';

import {
    WorkoutBenchmarkContext,
} from './workout-benchmark-context.js';

function WorkoutBenchmarkProvider({benchmarks = null, children}) {

    const value = useMemo(() => ({
        enabled: Array.isArray(benchmarks),
        benchmarks: benchmarks ?? [],
    }), [benchmarks]);

    return (
        <WorkoutBenchmarkContext.Provider value={value}>
            {children}
        </WorkoutBenchmarkContext.Provider>
    );
}

export default WorkoutBenchmarkProvider;