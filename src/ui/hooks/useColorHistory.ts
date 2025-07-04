import { useState, useRef, useCallback } from 'react';
import { ColorAssignment } from '../../types/color-roles';

interface ColorHistoryState {
    present: ColorAssignment[];
    past: ColorAssignment[][];
    future: ColorAssignment[][];
    initial: ColorAssignment[];
}

const useColorHistory = (initialState: ColorAssignment[]) => {
    const [state, setState] = useState<ColorHistoryState>({
        present: initialState,
        past: [],
        future: [],
        initial: initialState,
    });

    const setStateWithHistory = useCallback((newPresent: ColorAssignment[]) => {
        setState(prevState => ({
            present: newPresent,
            past: [...prevState.past, prevState.present],
            future: [],
        }));
    }, []);

    const undo = useCallback(() => {
        setState(prevState => {
            const { past, present, future } = prevState;
            if (past.length === 0) return prevState;

            const previous = past[past.length - 1];
            const newPast = past.slice(0, past.length - 1);

            return {
                present: previous,
                past: newPast,
                future: [present, ...future],
            };
        });
    }, []);

    const redo = useCallback(() => {
        setState(prevState => {
            const { past, present, future } = prevState;
            if (future.length === 0) return prevState;

            const next = future[0];
            const newFuture = future.slice(1);

            return {
                present: next,
                past: [...past, present],
                future: newFuture,
            };
        });
    }, []);

    const revert = useCallback(() => {
        setState(prevState => ({
            present: prevState.initial,
            past: [prevState.initial],
            future: [],
        }));
    }, []);

    return {
        colorAssignments: state.present,
        setColorAssignments: setStateWithHistory,
        undo,
        redo,
        revert,
        canUndo: state.past.length > 0,
        canRedo: state.future.length > 0,
    };
};

export default useColorHistory;