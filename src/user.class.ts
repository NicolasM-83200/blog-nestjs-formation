export class User {
  private static nextId: number = 1;
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    firstname: string,
    lastname: string,
    email: string,
    password: string,
    isAdmin: boolean = false,
  ) {
    this.id = User.nextId++;
    this.firstname = firstname;
    this.lastname = lastname;
    this.email = email;
    this.password = password;
    this.isAdmin = isAdmin;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
