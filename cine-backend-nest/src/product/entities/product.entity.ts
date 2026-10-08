export enum ProductCategory {
  COMBOS = 'combos',
  SNACKS = 'snacks',
  BEBIDAS = 'bebidas',
  DULCES = 'dulces',
}

export class Product {
  id!: number;
  name!: string;
  description!: string;
  category!: ProductCategory;
  price!: number;
  available!: boolean;
  imageUrl?: string;

  constructor(partial?: Partial<Product>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
