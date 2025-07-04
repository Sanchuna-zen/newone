import React from 'react';
import { Button } from '@/components/ui/button';

interface HistoryControlsProps {
    onUndo: () => void;
    onRedo: () => void;
    onRevert: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const HistoryControls: React.FC<HistoryControlsProps> = ({
    onUndo,
    onRedo,
    onRevert,
    canUndo,
    canRedo,
}) => {
    return (
        <div className="flex space-x-2 mt-4">
            <Button onClick={onUndo} disabled={!canUndo}>
                Undo
            </Button>
            <Button onClick={onRedo} disabled={!canRedo}>
                Redo
            </Button>
            <Button onClick={onRevert}>
                Revert
            </Button>
        </div>
    );
};

export default HistoryControls;