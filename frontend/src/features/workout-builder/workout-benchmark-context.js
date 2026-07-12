import {createContext, useContext} from 'react';

export const WorkoutBenchmarkContext = createContext({
    enabled: false,
    benchmarks: [],
});

export function useWorkoutBenchmarks() {
    return useContext(WorkoutBenchmarkContext);
}