import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaletteVariant } from '../../types/palette-variants';

interface PaletteVariantSelectorProps {
    variants: PaletteVariant[];
    selectedValue: string;
    onValueChange: (value: string) => void;
}

const PaletteVariantSelector: React.FC<PaletteVariantSelectorProps> = ({
    variants,
    selectedValue,
    onValueChange,
}) => {
    return (
        <Select value={selectedValue} onValueChange={onValueChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a palette variant" />
            </SelectTrigger>
            <SelectContent>
                {variants.map((variant) => (
                    <SelectItem key={variant.name} value={variant.name}>
                        {variant.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default PaletteVariantSelector;