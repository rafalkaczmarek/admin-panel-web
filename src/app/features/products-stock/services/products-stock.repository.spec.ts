import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ProductsStockRepository } from '@admin-panel-web/features/products-stock/services/products-stock.repository';
import { ProductStock } from '@admin-panel-web/features/products-stock/types/product-stock.interface';
import { ProductStockUpsert } from '@admin-panel-web/features/products-stock/types/product-stock-upsert.interface';
import { unitTestApiEnvironment } from '@admin-panel-web/test/unit-test-api-environment';
import { APP_ENVIRONMENT } from '@admin-panel-web/tokens/app-environment.token';

import { firstValueFrom } from 'rxjs';

const SAMPLE_PRODUCT: ProductStock = {
  id: 'prod-uuid-1',
  image: 'https://placehold.co/48x48/4880ff/fff?text=AW',
  name: 'Apple Watch Series 4',
  category: 'Digital Product',
  price: 690,
  piece: 63,
  availableColors: ['#333333'],
  status: 'in-stock',
};

const UPSERT_BODY: ProductStockUpsert = {
  image: 'https://placehold.co/48x48/4880ff/fff?text=NW',
  name: 'New Product',
  category: 'Digital Product',
  price: 99.5,
  piece: 10,
  availableColors: ['#333333'],
};

describe('ProductsStockRepository', () => {
  let http: HttpTestingController;
  let repository: ProductsStockRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_ENVIRONMENT, useValue: unitTestApiEnvironment },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    repository = TestBed.inject(ProductsStockRepository);
  });

  afterEach(() => {
    http.verify();
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  it('getProducts should GET the products list', async () => {
    const promise = firstValueFrom(repository.getProducts());

    const req = http.expectOne('http://test-api/api/products');
    expect(req.request.method).toBe('GET');
    req.flush([SAMPLE_PRODUCT]);

    const result = await promise;
    expect(result).toEqual([SAMPLE_PRODUCT]);
  });

  it('getProduct should GET a single product', async () => {
    const promise = firstValueFrom(repository.getProduct(SAMPLE_PRODUCT.id));

    const req = http.expectOne(`http://test-api/api/products/${SAMPLE_PRODUCT.id}`);
    expect(req.request.method).toBe('GET');
    req.flush(SAMPLE_PRODUCT);

    const result = await promise;
    expect(result).toEqual(SAMPLE_PRODUCT);
  });

  it('createProduct should POST product body', async () => {
    const promise = firstValueFrom(repository.createProduct(UPSERT_BODY));

    const req = http.expectOne('http://test-api/api/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(UPSERT_BODY);
    req.flush({ ...SAMPLE_PRODUCT, ...UPSERT_BODY });

    const result = await promise;
    expect(result.name).toBe(UPSERT_BODY.name);
  });

  it('updateProduct should PUT product body', async () => {
    const promise = firstValueFrom(repository.updateProduct(SAMPLE_PRODUCT.id, UPSERT_BODY));

    const req = http.expectOne(`http://test-api/api/products/${SAMPLE_PRODUCT.id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(UPSERT_BODY);
    req.flush({ ...SAMPLE_PRODUCT, ...UPSERT_BODY });

    const result = await promise;
    expect(result.name).toBe(UPSERT_BODY.name);
  });

  it('deleteProduct should DELETE by id', async () => {
    const promise = firstValueFrom(repository.deleteProduct(SAMPLE_PRODUCT.id));

    const req = http.expectOne(`http://test-api/api/products/${SAMPLE_PRODUCT.id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    await promise;
  });
});
