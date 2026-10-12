/**
 * The hero's load sequence lives in CSS (`globals.css`) so it survives a failed
 * script load. Motion is reserved for state the user changes: the intent toggle,
 * dim/hide switching and hover-restore.
 */
export const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

export const dimTransition = { duration: 0.55, ease: EASE } as const;
