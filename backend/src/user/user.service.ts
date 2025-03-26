import { Injectable } from '@nestjs/common';
import { NhostService } from '../nhost/nhost.service';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  constructor(private nhostService: NhostService) {}

  async findOne(id: number): Promise<any | null> {
    const nhost = this.nhostService.getNhostClient();
    const result = await nhost.graphql.request(`
      query GetUser($id: uuid!) {
        user(id: $id) {
          id
          email
          name
        }
      }
    `, { id });
    return result.data?.user;
  }

  async findAll(): Promise<any[]> {
    const nhost = this.nhostService.getNhostClient();
    const result = await nhost.graphql.request(`
      query GetUsers {
        users {
          id
          email
          name
        }
      }
    `);
    return result.data?.users;
  }

  async create(user: any): Promise<any> {
    const nhost = this.nhostService.getNhostClient();
    const result = await nhost.graphql.request(`
      mutation InsertUser($email: String!, $password: String!, $name: String!) {
        insert_users_one(object: {email: $email, password: $password, name: $name}) {
          id
          email
          name
        }
      }
    `, { email: user.email, password: user.password, name: user.name });
    return result.data?.insert_users_one;
  }

  async update(id: number, user: any): Promise<any | null> {
    const nhost = this.nhostService.getNhostClient();
    const result = await nhost.graphql.request(
      `
      mutation UpdateUser($id: uuid!, $user: users_set_input!) {
        update_users_by_pk(pk_columns: {id: $id}, _set: $user) {
          id
          email
          name
          twoFactorEnabled
          twoFactorMethod
          recoveryEmail
          recoveryPhone
        }
      }
    `,
      {
        id,
        user: {
          email: user.email,
          name: user.name,
          password: user.password,
          twoFactorEnabled: user.twoFactorEnabled,
          twoFactorMethod: user.twoFactorMethod,
          recoveryEmail: user.recoveryEmail,
          recoveryPhone: user.recoveryPhone,
        },
      }
    );
    return result.data?.update_users_by_pk;
  }

  async findOneByEmail(email: string): Promise<any | null> {
    const nhost = this.nhostService.getNhostClient();
    const result = await nhost.graphql.request(`
      query GetUserByEmail($email: String!) {
        users(where: {email: {_eq: $email}}) {
          id
          email
          name
        }
      }
    `, { email });
    return result.data?.users[0];
  }

  async remove(id: number): Promise<void> {
    const nhost = this.nhostService.getNhostClient();
    await nhost.graphql.request(`
      mutation DeleteUser($id: uuid!) {
        delete_users_by_pk(id: $id) {
          id
        }
      }
    `, { id });
  }

  async generateRecoveryCodes(id: number): Promise<string[]> {
    const codes: string[] = [];
    for (let i = 0; i < 8; i++) {
      const randomBytes = crypto.randomBytes(4);
      let code = "";
      for (const byte of randomBytes) {
        code += byte.toString(16).padStart(2, "0");
      }
      codes.push(code);
    }
    // TODO: Store the generated codes securely in the database
    return codes;
  }

  async verifyDevice(id: number, code: string): Promise<boolean> {
    // TODO: Implement device verification logic
    return false;
  }

  async getDevices(id: number): Promise<string[]> {
    // TODO: Implement get devices logic
    return [];
  }

  async logoutDevice(deviceId: string): Promise<boolean> {
    // In a real implementation, this would invalidate the session or token
    // associated with the device ID.
    console.log(`Logging out device with ID: ${deviceId}`);
    return true;
  }
}
