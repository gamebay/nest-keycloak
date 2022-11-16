import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map, Observable } from 'rxjs';
import { Request } from 'express';

import { KeycloakModuleOptions } from './keycloak.interface';
import { KEYCLOAK_MODULE_OPTIONS } from './keycloak.constants';

@Injectable()
export class KeycloakService {
  private readonly logger = new Logger(KeycloakService.name);

  constructor(
    @Inject(KEYCLOAK_MODULE_OPTIONS)
    private readonly options: KeycloakModuleOptions,
    private readonly http: HttpService,
  ) {}

  async login(
    req: Request,
    username: string,
    password: string,
  ): Promise<Observable<any>> {
    const url = `/realms/${this.options.realmName}/protocol/openid-connect/token`;

    const data = new URLSearchParams({
      client_id: 'admin-cli',
      grant_type: 'password',
      username: username,
      password: password,
    });

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    if (req.ip) {
      config.headers['X-Forwarded-For'] = req.ip;
    }

    return this.http.post(url, data, config).pipe(
      map((response) => response.data),
      catchError((e) => {
        this.logger.debug(JSON.stringify({ username, password }));

        // request was made and server responded
        if (e.response) {
          throw new HttpException(e.response.data, e.response.status);
        }

        // request was made but no response was received
        if (e.request) {
          throw new HttpException(e.message, HttpStatus.BAD_GATEWAY);
        }

        throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }),
    );
  }

  async logout(token: string, refreshToken: string): Promise<Observable<any>> {
    const url = `/realms/${this.options.realmName}/protocol/openid-connect/logout`;

    const data = new URLSearchParams({
      client_id: 'admin-cli',
      refresh_token: refreshToken,
    });

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    return this.http.post(url, data, config).pipe(
      map((response) => response.data),
      catchError((e) => {
        if (e.response) {
          throw new HttpException(e.response.data, e.response.status);
        }

        if (e.request) {
          throw new HttpException(e.message, HttpStatus.BAD_GATEWAY);
        }

        throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }),
    );
  }

  async refresh(refreshToken: string) {
    const url = `/realms/${this.options.realmName}/protocol/openid-connect/token`;

    const data = new URLSearchParams({
      client_id: 'admin-cli',
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    const response = this.http.post(url, data, config).pipe(
      map((response) => response.data),
      catchError((e) => {
        if (e.response) {
          throw new HttpException(e.response.data, e.response.status);
        }

        if (e.request) {
          throw new HttpException(e.message, HttpStatus.BAD_GATEWAY);
        }

        throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }),
    );

    return await lastValueFrom(response);
  }

  async introspect(token: string) {
    const url = `/realms/${this.options.realmName}/protocol/openid-connect/token/introspect`;

    const data = new URLSearchParams({
      client_id: this.options.clientId,
      client_secret: this.options.clientSecret,
      token: token,
    });

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    const response = this.http.post(url, data, config).pipe(
      map((response) => response.data),
      catchError((e) => {
        if (e.response) {
          throw new HttpException(e.response.data, e.response.status);
        }

        if (e.request) {
          throw new HttpException(e.message, HttpStatus.BAD_GATEWAY);
        }

        throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
      }),
    );

    return await lastValueFrom(response);
  }
}
