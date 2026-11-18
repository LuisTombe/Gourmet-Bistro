declare module 'figma' {
  export interface ResultSection {
    type: string;
    code?: string;
  }

  export interface SelectedInstance {
    getString(propName: string): string;
    getBoolean<T = boolean>(
      propName: string,
      mapping?: { true: T; false: T }
    ): T;
    getEnum<T extends string>(
      propName: string,
      mapping: Record<string, T>
    ): T;
    getInstanceSwap(propName: string): {
      type: 'INSTANCE' | 'ERROR';
      executeTemplate(): { example: ResultSection[]; metadata?: Record<string, unknown> };
    } | null;
    getSlot(propName: string): ResultSection[] | undefined;
  }

  const figma: {
    selectedInstance: SelectedInstance;
    code(strings: TemplateStringsArray, ...values: unknown[]): ResultSection[];
  };

  export default figma;
}
