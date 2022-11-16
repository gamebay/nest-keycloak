// import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { ModuleMetadata, Type } from '@nestjs/common';

export type KeycloakModuleOptions = {
  baseUrl: string;
  realmName: string;
  clientId: string;
  clientSecret: string;
};

// export type KeycloakAdmin = KeycloakAdminClient;

export interface KeycloakModuleOptionsFactory {
  createKeycloakOptions():
    | Promise<KeycloakModuleOptions>
    | KeycloakModuleOptions;
}

export interface KeycloakModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useClass?: Type<KeycloakModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<KeycloakModuleOptions> | KeycloakModuleOptions;
  inject?: any[];
}
