declare module 'pdfmake/build/pdfmake' {
  export function createPdf(docDefinition: any): any;
  export function createPdf(docDefinition: any, tableLayouts?: any): any;
  export function createPdf(docDefinition: any, tableLayouts?: any, fonts?: any): any;
  export function createPdf(docDefinition: any, tableLayouts?: any, fonts?: any, vfs?: any): any;
}

declare module 'pdfmake/build/vfs_fonts' {
  const vfs: any;
  export default vfs;
}
