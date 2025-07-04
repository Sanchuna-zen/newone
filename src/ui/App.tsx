import React, { useState, useEffect } from 'react';
import ColorAssignmentsList from '../components/color-automation/ColorAssignmentList';
import HistoryControls from '../components/color-automation/HistoryControls';
import { ColorRole, ColorAssignment } from '../types/color-roles';
import useColorHistory from './hooks/useColorHistory';

const App = () => {
    const [error, setError] = useState<string | null>(null);
    const { colorAssignments, setColorAssignments, undo, redo, canUndo, canRedo } = useColorHistory([]);

    useEffect(() => {
        // Request initial color data from the plugin
        parent.postMessage({ pluginMessage: { type: 'fetch-colors' } }, '*');

        window.onmessage = (event: MessageEvent) => {
            const { type, message, payload } = event.data.pluginMessage;
            if (type === 'error') {
                setError(message);
            } else if (type === 'color-data') {
                setColorAssignments(payload);
            }
        };
    }, [setColorAssignments]);

    const handleColorChange = (role: ColorRole, newColor: string) => {
        parent.postMessage({ pluginMessage: { type: 'update-color', payload: { role, color: newColor } } }, '*');
        // The plugin will send back updated color data, which will be handled by window.onmessage
    };

    const handleUndo = () => {
        undo();
        parent.postMessage({ pluginMessage: { type: 'undo-color-assignment' } }, '*');
    };

    const handleRedo = () => {
        redo();
        parent.postMessage({ pluginMessage: { type: 'redo-color-assignment' } }, '*');
    };

    const handleRevert = () => {
        revert();
        parent.postMessage({ pluginMessage: { type: 'revert-color-assignments' } }, '*');
    };

    return (
        <div>
            <h1>Color Automation Panel</h1>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            <ColorAssignmentsList assignments={colorAssignments} onColorChange={handleColorChange} />
            <HistoryControls onUndo={handleUndo} onRedo={handleRedo} onRevert={handleRevert} canUndo={canUndo} canRedo={canRedo} />
        </div>
    );
};

export default App;