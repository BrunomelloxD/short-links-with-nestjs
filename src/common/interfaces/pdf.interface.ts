export interface PdfColumn<T> {
  label: string;
  value: (item: T) => string;
  width?: number;
}

export interface PdfOptions<T> {
  title: string;
  columns: PdfColumn<T>[];
  fontSize?: number;
  margin?: number;
}