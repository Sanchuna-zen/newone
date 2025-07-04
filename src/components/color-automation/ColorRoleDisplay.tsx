import React from 'react';
import { ColorRole } from '../../types/color-roles';
import ColorPicker from '../ui/ColorPicker';

interface ColorRoleDisplayProps {
    role: ColorRole;
    color: string;
    onColorChange: (role: ColorRole, newColor: string) => void;
}

const ColorRoleDisplay: React.FC<ColorRoleDisplayProps> = ({ role, color, onColorChange }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <ColorPicker value={color} onChange={(newColor) => onColorChange(role, newColor)} />
            <span>{role}</span>
        </div>
    );
};

export default ColorRoleDisplay;