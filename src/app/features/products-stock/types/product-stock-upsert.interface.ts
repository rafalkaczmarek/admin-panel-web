export interface ProductStockUpsert {
  readonly image: string;
  readonly name: string;
  readonly category: string;
  readonly price: number;
  readonly piece: number;
  readonly availableColors: string[];
}
