import { Page, BrowserContext } from '@playwright/test';
import { AuthService, IAuthService } from '../modules/auth/services/auth.service';
import { PimApiClient, IPimApiClient } from '../modules/pim/infra/clients/pim-api.client';
import { HybridPimService, IHybridPimService } from '../modules/pim/services/hybrid-pim.service';

export type ServiceOverrides = Partial<{
  authService: IAuthService;
  pimApiClient: IPimApiClient;
  hybridPimService: IHybridPimService;
}>;

/**
 * Fábrica central para criar serviços usados nas fixtures e steps.
 * Permite injeção de substitutos para testes isolados e mocking.
 */
export class ServiceFactory {
  constructor(
    private readonly page: Page,
    private readonly browserContext: BrowserContext,
    private readonly overrides: ServiceOverrides = {},
  ) {}

  getAuthService(): IAuthService {
    if (this.overrides.authService) return this.overrides.authService;
    return new AuthService(this.page);
  }

  getPimApiClient(): IPimApiClient {
    if (this.overrides.pimApiClient) return this.overrides.pimApiClient;
    return new PimApiClient(this.browserContext);
  }

  getHybridPimService(): IHybridPimService {
    if (this.overrides.hybridPimService) return this.overrides.hybridPimService;
    return new HybridPimService(this.page, this.browserContext, this.getPimApiClient());
  }
}
