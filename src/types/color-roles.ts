export enum ColorRole {
    Primary = 'Primary',
    Accent = 'Accent',
    Background = 'Background',
    Text = 'Text',
}

export interface ColorAssignment {
    role: ColorRole;
    color: string;
}