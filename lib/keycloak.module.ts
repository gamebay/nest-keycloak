import { HttpModule } from '@nestjs/axios';
import {
  DynamicModule,
  Global,
  Inject,
  Logger,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Issuer } from 'openid-client';

import {
  // KEYCLOAK_MODULE_ADMIN_CLIENT,
  KEYCLOAK_MODULE_OPTIONS,
} from './keycloak.constants';
import {
  // KeycloakAdmin,
  KeycloakModuleAsyncOptions,
  KeycloakModuleOptions,
} from './keycloak.interface';
import {
  createKeycloakProviders,
  createKeycloakAsyncProviders,
} from './keycloak.providers';

@Global()
@Module({
  // TODO: fix this
  imports: [HttpModule.register({ baseURL: 'https://auth.gamebay.io/auth' })],
})
export class KeycloakModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KeycloakModule.name);

  constructor(
    // @Inject(KEYCLOAK_MODULE_ADMIN_CLIENT)
    // private readonly keycloakAdmin: KeycloakAdmin,
    @Inject(KEYCLOAK_MODULE_OPTIONS)
    private readonly options: KeycloakModuleOptions,
  ) {}

  async onModuleInit() {
    this.logger.debug('keycloak module init');
    this.logger.debug(this.options);

    const { clientId, clientSecret, baseUrl, realmName } = this.options;

    // TODO:
    // - fix keycloak async admin provider
    // - fix token refresh
    // - fix keycloak timeout/offline
    // this.keycloakAdmin.setConfig({ baseUrl, realmName });

    const issuer = await Issuer.discover(`${baseUrl}/realms/${realmName}`);

    const client = new issuer.Client({
      client_id: clientId,
      client_secret: clientSecret,
    });

    const token = await client.grant({
      grant_type: 'client_credentials',
    });
    // this.logger.debug(token);
    this.logger.debug(token.access_token);
    this.logger.debug(token.expires_at);
    this.logger.debug(token.expires_in);

    // this.keycloakAdmin.setAccessToken(token.access_token);
  }

  onModuleDestroy() {
    this.logger.debug('keycloak module destroy');
  }

  static forRoot(options: KeycloakModuleOptions): DynamicModule {
    const providers = createKeycloakProviders(options);

    return {
      module: KeycloakModule,
      providers: providers,
      exports: providers,
    };
  }

  static forRootAsync(options: KeycloakModuleAsyncOptions): DynamicModule {
    const providers = createKeycloakAsyncProviders(options);

    return {
      module: KeycloakModule,
      imports: options.imports,
      providers: providers,
      exports: providers,
    };
  }
}
