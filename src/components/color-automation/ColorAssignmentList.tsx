import React from 'react';
import { ColorAssignment } from '../../types/color-roles';
import ColorRoleDisplay from './ColorRoleDisplay';

interface ColorAssignmentListProps {
    assignments: ColorAssignment[];
}

const ColorAssignmentList: React.FC<ColorAssignmentListProps> = ({ assignments }) => {
    return (
        <div>
            {assignments.map((assignment, index) => (
                <ColorRoleDisplay key={index} role={assignment.role} color={assignment.color} />
            ))}
        </div>
    );
};

export default ColorAssignmentList;