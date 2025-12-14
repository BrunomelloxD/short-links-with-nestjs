export interface XlsxColumn<T> {
  label: string;
  value: (item: T) => string | number;
  width?: number;
}

export interface XlsxOptions<T> {
  sheetName: string;
  columns: XlsxColumn<T>[];
  fileName?: string;
}