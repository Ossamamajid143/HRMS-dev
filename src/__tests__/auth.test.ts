import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../app';

describe('Authentication Flow', () => {
  let authToken = '';
  let employeeId = '';

  it('Should successfully register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Admin',
        email: 'testadmin@hrms.com',
        password: 'securepassword123',
        role: 'Admin',
        department: 'Engineering'
      });
      
    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe('testadmin@hrms.com');
    employeeId = res.body.user.id;
  });

  it('Should fail to register a duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Another Admin',
        email: 'testadmin@hrms.com',
        password: 'securepassword123',
        role: 'Admin',
        department: 'Engineering'
      });
      
    expect(res.status).toBe(400);
  });

  it('Should successfully login and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testadmin@hrms.com',
        password: 'securepassword123',
      });
      
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    authToken = res.body.token;
  });

  it('Should successfully fetch the created employee profile using JWT', async () => {
    const res = await request(app)
      .get(`/api/employees/${employeeId}`)
      .set('Authorization', `Bearer ${authToken}`);
      
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('id', employeeId);
    expect(res.body.data.name).toBe('Test Admin');
  });
});
