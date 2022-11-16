import { Provider } from '@nestjs/common';

import {
  // KEYCLOAK_MODULE_ADMIN_CLIENT,
  KEYCLOAK_MODULE_OPTIONS,
} from './keycloak.constants';
import {
  KeycloakModuleAsyncOptions,
  KeycloakModuleOptions,
  KeycloakModuleOptionsFactory,
} from './keycloak.interface';
import { KeycloakService } from './keycloak.service';

export const createKeycloakProviders = (
  options: KeycloakModuleOptions,
): Provider[] => [
  createKeycloakOptionsProvider(options),
  // createKeycloakAdminProvider(options),
  KeycloakService,
];

export const createKeycloakAsyncProviders = (
  options: KeycloakModuleAsyncOptions,
): Provider[] => [
  ...createKeycloakAsyncOptionsProviders(options),
  // createKeycloakAsyncAdminProvider(),
  KeycloakService,
];

// export const createKeycloakAdminProvider = (
// options: KeycloakModuleOptions,
// ): Provider => ({
// provide: KEYCLOAK_MODULE_ADMIN_CLIENT,
// useValue: null,
// useValue: new KeycloakAdminClient({
// baseUrl: options.baseUrl,
// realmName: options.realmName,
// }),
// });

// export const createKeycloakAsyncAdminProvider = (): Provider => ({
// provide: KEYCLOAK_MODULE_ADMIN_CLIENT,
// useFactory: () => {
// return {};
// return new KeycloakAdminClient();
// },
// });

export const createKeycloakOptionsProvider = (
  options: KeycloakModuleOptions,
): Provider => ({
  provide: KEYCLOAK_MODULE_OPTIONS,
  useValue: options,
});

export const createKeycloakAsyncOptionsProviders = (
  options: KeycloakModuleAsyncOptions,
): Provider[] => {
  if (options.useFactory) {
    return [
      {
        provide: KEYCLOAK_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
    ];
  }

  return [
    {
      provide: KEYCLOAK_MODULE_OPTIONS,
      useFactory: async (optionsFactory: KeycloakModuleOptionsFactory) =>
        await optionsFactory.createKeycloakOptions(),
      inject: [options.useClass],
    },
    {
      provide: options.useClass,
      useClass: options.useClass,
    },
  ];
};
