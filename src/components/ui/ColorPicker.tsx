import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="w-[150px] justify-start text-left font-normal"
                >
                    <div
                        className="mr-2 h-4 w-4 rounded"
                        style={{ backgroundColor: value }}
                    />
                    {value}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-24 cursor-pointer"
                />
            </PopoverContent>
        </Popover>
    );
};

export default ColorPicker;