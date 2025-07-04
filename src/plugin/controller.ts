
import { ColorRole, ColorAssignment } from '../types/color-roles';
import { PaletteVariant } from '../types/palette-variants';


function hexToRgb(hex: string) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;
    return { r, g, b };
}

function rgbaToHex(r: number, g: number, b: number, a: number = 1) {
    const toHex = (c: number) => Math.round(c * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function processNode(node: SceneNode, colorAssignments: ColorAssignment[]) {
    if ('fills' in node && Array.isArray(node.fills)) {
        for (const paint of node.fills) {
            if (paint.type === 'SOLID') {
                const { r, g, b, a } = paint.color;
                const hexColor = rgbaToHex(r, g, b, a);
                // For simplicity, assigning a generic role. In a real plugin, you'd infer role
                colorAssignments.push({ role: ColorRole.Primary, color: hexColor });
            }
        }
    }
    if ('strokes' in node && Array.isArray(node.strokes)) {
        for (const paint of node.strokes) {
            if (paint.type === 'SOLID') {
                const { r, g, b, a } = paint.color;
                const hexColor = rgbaToHex(r, g, b, a);
                colorAssignments.push({ role: ColorRole.Accent, color: hexColor });
            }
        }
    }
}

figma.ui.on('message', async msg => {
    try {
        if (msg.type === 'create-rectangles') {
            const nodes: SceneNode[] = [];
            for (let i = 0; i < msg.count; i++) {
                const rect = figma.createRectangle();
                rect.x = i * 150;
                rect.fills = [{type: 'SOLID', color: {r: 1, g: 0, b: 0}}];
                figma.currentPage.appendChild(rect);
                nodes.push(rect);
            }
            figma.currentPage.selection = nodes;
            figma.viewport.scrollAndZoomIntoView(nodes);
        } else if (msg.type === 'fetch-colors') {
            const colorAssignments: ColorAssignment[] = [];
            
            // Traverse the document to find color information
            figma.currentPage.children.forEach(node => {
                processNode(node, colorAssignments);
            });

            // For styles
            for (const styleId in figma.getLocalPaintStyles()) {
                const style = figma.getLocalPaintStyles()[styleId];
                if (style.paints && Array.isArray(style.paints)) {
                    for (const paint of style.paints) {
                        if (paint.type === 'SOLID') {
                            const { r, g, b, a } = paint.color;
                            const hexColor = rgbaToHex(r, g, b, a);
                            // Assigning a role based on style name if possible, otherwise generic
                            let role: ColorRole = ColorRole.Primary; // Default
                            if (style.name.toLowerCase().includes('primary')) {
                                role = ColorRole.Primary;
                            } else if (style.name.toLowerCase().includes('accent')) {
                                role = ColorRole.Accent;
                            } else if (style.name.toLowerCase().includes('background')) {
                                role = ColorRole.Background;
                            } else if (style.name.toLowerCase().includes('text')) {
                                role = ColorRole.Text;
                            }
                            colorAssignments.push({ role, color: hexColor });
                        }
                    }
                }
            }
            figma.ui.postMessage({ type: 'color-data', payload: colorAssignments });
        } else if (msg.type === 'update-color') {
            const { role, color } = msg.payload;
            const newRGB = hexToRgb(color);

            if (!newRGB) {
                figma.ui.postMessage({ type: 'error', message: 'Invalid color format' });
                return;
            }

            // Update styles
            for (const styleId in figma.getLocalPaintStyles()) {
                const style = figma.getLocalPaintStyles()[styleId];
                if (style.name.toLowerCase().includes(role.toLowerCase())) {
                    const newPaints = style.paints.map(paint => {
                        if (paint.type === 'SOLID') {
                            return {
                                ...paint,
                                color: newRGB
                            };
                        }
                        return paint;
                    });
                    style.paints = newPaints;
                }
            }

            // Update nodes directly (for simplicity, only solid fills/strokes)
            figma.currentPage.findAll(node => {
                let updated = false;
                if ('fills' in node && Array.isArray(node.fills)) {
                    const newFills = node.fills.map(paint => {
                        if (paint.type === 'SOLID') {
                            // This is a very simplistic mapping. In a real plugin, you'd use more robust logic
                            // to determine if this node's fill should be updated based on the 'role'.
                            // For now, we'll update if the node's name or a parent's name matches the role.
                            if (node.name.toLowerCase().includes(role.toLowerCase())) {
                                updated = true;
                                return {
                                    ...paint,
                                    color: newRGB
                                };
                            }
                        }
                        return paint;
                    });
                    if (updated) {
                        node.fills = newFills;
                    }
                }
                updated = false; // Reset for strokes
                if ('strokes' in node && Array.isArray(node.strokes)) {
                    const newStrokes = node.strokes.map(paint => {
                        if (paint.type === 'SOLID') {
                             if (node.name.toLowerCase().includes(role.toLowerCase())) {
                                updated = true;
                                return {
                                    ...paint,
                                    color: newRGB
                                };
                            }
                        }
                        return paint;
                    });
                    if (updated) {
                        node.strokes = newStrokes;
                    }
                }
                return false; // Don't stop traversal
            });

            // After updating, send the new color data back to the UI to reflect changes
            const colorAssignments: ColorAssignment[] = [];
            figma.currentPage.children.forEach(node => {
                processNode(node, colorAssignments);
            });
            for (const styleId in figma.getLocalPaintStyles()) {
                const style = figma.getLocalPaintStyles()[styleId];
                if (style.paints && Array.isArray(style.paints)) {
                    for (const paint of style.paints) {
                        if (paint.type === 'SOLID') {
                            const { r, g, b, a } = paint.color;
                            const hexColor = rgbaToHex(r, g, b, a);
                            let currentRole: ColorRole = ColorRole.Primary;
                            if (style.name.toLowerCase().includes('primary')) {
                                currentRole = ColorRole.Primary;
                            } else if (style.name.toLowerCase().includes('accent')) {
                                currentRole = ColorRole.Accent;
                            } else if (style.name.toLowerCase().includes('background')) {
                                currentRole = ColorRole.Background;
                            } else if (style.name.toLowerCase().includes('text')) {
                                currentRole = ColorRole.Text;
                            }
                            colorAssignments.push({ role: currentRole, color: hexColor });
                        }
                    }
                }
            }
            figma.ui.postMessage({ type: 'color-data', payload: colorAssignments });
        } else if (msg.type === 'switch-palette-variant') {
            const selectedPalette = msg.payload as PaletteVariant;

            for (const assignment of selectedPalette.colors) {
                const { role, color } = assignment;
                const newRGB = hexToRgb(color);

                if (!newRGB) {
                    figma.ui.postMessage({ type: 'error', message: `Invalid color format for role ${role}: ${color}` });
                    continue; // Skip to next assignment
                }

                // Update styles
                for (const styleId in figma.getLocalPaintStyles()) {
                    const style = figma.getLocalPaintStyles()[styleId];
                    if (style.name.toLowerCase().includes(role.toLowerCase())) {
                        const newPaints = style.paints.map(paint => {
                            if (paint.type === 'SOLID') {
                                return {
                                    ...paint,
                                    color: newRGB
                                };
                            }
                            return paint;
                        });
                        style.paints = newPaints;
                    }
                }

                // Update nodes directly
                figma.currentPage.findAll(node => {
                    let updated = false;
                    if ('fills' in node && Array.isArray(node.fills)) {
                        const newFills = node.fills.map(paint => {
                            if (paint.type === 'SOLID') {
                                if (node.name.toLowerCase().includes(role.toLowerCase())) {
                                    updated = true;
                                    return {
                                        ...paint,
                                        color: newRGB
                                    };
                                }
                            }
                            return paint;
                        });
                        if (updated) {
                            node.fills = newFills;
                        }
                    }
                    updated = false; // Reset for strokes
                    if ('strokes' in node && Array.isArray(node.strokes)) {
                        const newStrokes = node.strokes.map(paint => {
                            if (paint.type === 'SOLID') {
                                if (node.name.toLowerCase().includes(role.toLowerCase())) {
                                    updated = true;
                                    return {
                                        ...paint,
                                        color: newRGB
                                    };
                                }
                            }
                            return paint;
                        });
                        if (updated) {
                            node.strokes = newStrokes;
                        }
                    }
                    return false; // Don't stop traversal
                });
            }

            // After applying all palette colors, send the new color data back to the UI
            const colorAssignments: ColorAssignment[] = [];
            figma.currentPage.children.forEach(node => {
                processNode(node, colorAssignments);
            });
            for (const styleId in figma.getLocalPaintStyles()) {
                const style = figma.getLocalPaintStyles()[styleId];
                if (style.paints && Array.isArray(style.paints)) {
                    for (const paint of style.paints) {
                        if (paint.type === 'SOLID') {
                            const { r, g, b, a } = paint.color;
                            const hexColor = rgbaToHex(r, g, b, a);
                            let currentRole: ColorRole = ColorRole.Primary;
                            if (style.name.toLowerCase().includes('primary')) {
                                currentRole = ColorRole.Primary;
                            } else if (style.name.toLowerCase().includes('accent')) {
                                currentRole = ColorRole.Accent;
                            } else if (style.name.toLowerCase().includes('background')) {
                                currentRole = ColorRole.Background;
                            } else if (style.name.toLowerCase().includes('text')) {
                                currentRole = ColorRole.Text;
                            }
                            colorAssignments.push({ role: currentRole, color: hexColor });
                        }
                    }
                }
            }
            figma.ui.postMessage({ type: 'color-data', payload: colorAssignments });
        }
    } catch (error: any) {
        figma.ui.postMessage({ type: 'error', message: error.message });
    }
});